/**
 * @module useRealtimeTryOn
 * @description Core React hook encapsulating the entire virtual try-on pipeline:
 *   Camera → Token → Decart Realtime WebRTC → AI Video Output
 *
 * Exposes a clean interface (state, start, stop, applyGarment) so UI components
 * never touch Decart SDK internals directly.
 *
 * Critical design constraint (GOAL.md §12): Garment changes call set() on the
 * existing realtime session — no WebRTC reconnection, no camera restart.
 */

"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { createDecartClient, models } from "@decartai/sdk";
import type {
  SessionState,
  TryOnError,
  GarmentItem,
  UseRealtimeTryOnReturn,
} from "../types/tryon";
import { getGarmentPrompt } from "../lib/garment-prompts";
import { logger } from "../lib/decart";

/** The VTON model instance — provides fps, width, height for getUserMedia. */
const VTON_MODEL = models.realtime("lucy-vton-latest");

/**
 * Maps raw camera/WebRTC errors to user-friendly TryOnError objects.
 */
function mapCameraError(err: unknown): TryOnError {
  const raw = err instanceof Error ? err.message : String(err);

  if (raw.includes("Permission") || raw.includes("NotAllowedError")) {
    return {
      state: "CAMERA_PERMISSION_DENIED",
      message:
        "Camera access was denied. Please allow camera access in your browser settings and try again.",
      technicalDetail: raw,
    };
  }
  if (raw.includes("NotFoundError") || raw.includes("DevicesNotFoundError")) {
    return {
      state: "CAMERA_UNAVAILABLE",
      message: "No camera was detected on this device.",
      technicalDetail: raw,
    };
  }
  if (raw.includes("NotReadableError") || raw.includes("TrackStartError")) {
    return {
      state: "CAMERA_UNAVAILABLE",
      message:
        "Camera is already in use by another application. Please close other apps using the camera and try again.",
      technicalDetail: raw,
    };
  }
  if (raw.includes("OverconstrainedError")) {
    return {
      state: "CAMERA_UNAVAILABLE",
      message: "Camera does not support the required settings.",
      technicalDetail: raw,
    };
  }

  return {
    state: "CAMERA_UNAVAILABLE",
    message: "Unable to initialize the camera.",
    technicalDetail: raw,
  };
}

/**
 * Primary hook for the Virtual Try-On pipeline.
 *
 * @returns UseRealtimeTryOnReturn — state, streams, actions, and diagnostics.
 */
export function useRealtimeTryOn(): UseRealtimeTryOnReturn {
  // ── State ─────────────────────────────────────────────────────────────
  const [state, setState] = useState<SessionState>("IDLE");
  const [error, setError] = useState<TryOnError | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [outputStream, setOutputStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>("disconnected");
  const [cameraResolution, setCameraResolution] = useState<string>("");
  const [activeGarmentName, setActiveGarmentName] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");

  // ── Refs (mutable, never trigger re-renders) ──────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realtimeClientRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Track mount/unmount for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Cleanup helper ────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    logger.info("Session cleanup started");

    // 1. Disconnect realtime client
    if (realtimeClientRef.current) {
      try {
        realtimeClientRef.current.disconnect();
        logger.info("Realtime disconnected");
      } catch (e) {
        logger.warn("Disconnect error (non-fatal):", e);
      }
      realtimeClientRef.current = null;
    }

    // 2. Stop all camera tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        logger.info(`Track stopped: ${track.kind}`);
      });
      streamRef.current = null;
    }

    // 3. Reset state
    if (isMountedRef.current) {
      setCameraStream(null);
      setOutputStream(null);
      setConnectionState("disconnected");
      setCameraResolution("");
      setActiveGarmentName("");
      setSessionId("");
      setState("IDLE");
      setError(null);
    }

    logger.info("Session cleanup complete");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // ── START ─────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    // Reset any previous error
    setError(null);

    // ── Phase 1: Camera ──
    setState("REQUESTING_CAMERA");
    logger.info("Camera requested");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          frameRate: VTON_MODEL.fps,
          width: VTON_MODEL.width,
          height: VTON_MODEL.height,
        },
        audio: false,
      });
      logger.info("Camera granted");
    } catch (err) {
      const cameraError = mapCameraError(err);
      logger.error("Camera error:", cameraError.technicalDetail);
      if (isMountedRef.current) {
        setError(cameraError);
        setState("IDLE");
      }
      return;
    }

    streamRef.current = stream;
    if (isMountedRef.current) {
      setCameraStream(stream);

      // Extract resolution for diagnostics
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setCameraResolution(`${settings.width ?? "?"}x${settings.height ?? "?"}`);
      }

      setState("CAMERA_READY");
    }

    // ── Phase 2: Token ──
    setState("CONNECTING");
    logger.info("Token requested");

    let clientToken: string;
    try {
      const res = await fetch("/api/token", { method: "POST" });
      if (!res.ok) {
        throw new Error(`Token endpoint returned ${res.status}`);
      }
      const data = await res.json();
      clientToken = data.apiKey;
      logger.info("Token received");
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      logger.error("Token error:", raw);
      if (isMountedRef.current) {
        setError({
          state: "TOKEN_ERROR",
          message: "Unable to start the AI session. Please try again.",
          technicalDetail: raw,
        });
        setState("IDLE");
      }
      // Stop camera since we can't continue
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (isMountedRef.current) setCameraStream(null);
      return;
    }

    // ── Phase 3: Decart Realtime Connection ──
    logger.info("Connecting realtime model");

    try {
      const client = createDecartClient({ apiKey: clientToken });

      const realtimeClient = await client.realtime.connect(stream, {
        model: VTON_MODEL,
        mirror: "auto",
        onRemoteStream: (remoteStream: MediaStream) => {
          logger.info("Remote stream received");
          if (isMountedRef.current) {
            setOutputStream(remoteStream);
            setState("READY");
          }
        },
      });

      realtimeClientRef.current = realtimeClient;

      // Listen for connection state changes
      realtimeClient.on("connectionChange", (newState: string) => {
        logger.info(`Connection state: ${newState}`);
        if (isMountedRef.current) {
          setConnectionState(newState);

          if (newState === "disconnected" && isMountedRef.current) {
            // Unexpected disconnect
            setError({
              state: "WEBRTC_CONNECTION_ERROR",
              message:
                "The realtime AI connection was lost. Please check your internet connection and try again.",
            });
          }
        }
      });

      // Listen for errors
      realtimeClient.on("error", (sdkError: { code?: string; message?: string }) => {
        logger.error("SDK error:", sdkError.code, sdkError.message);
        if (isMountedRef.current) {
          setError({
            state: "MODEL_ERROR",
            message: "An error occurred with the AI model. Please try again.",
            technicalDetail: `${sdkError.code}: ${sdkError.message}`,
          });
        }
      });

      // Capture session ID for diagnostics
      if (realtimeClient.sessionId && isMountedRef.current) {
        setSessionId(realtimeClient.sessionId);
      }

      logger.info("Realtime connected");
      if (isMountedRef.current) {
        setState("CONNECTED");
        setConnectionState("connected");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      logger.error("WebRTC connection error:", raw);
      if (isMountedRef.current) {
        setError({
          state: "WEBRTC_CONNECTION_ERROR",
          message:
            "The realtime AI connection failed. Please check your internet connection and try again.",
          technicalDetail: raw,
        });
        setState("IDLE");
      }
      // Clean up camera on connection failure
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (isMountedRef.current) setCameraStream(null);
    }
  }, []);

  // ── STOP ──────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    logger.info("Session stop requested");
    cleanup();
  }, [cleanup]);

  // ── APPLY GARMENT (no reconnection!) ──────────────────────────────────
  const applyGarment = useCallback(async (garment: GarmentItem) => {
    if (!realtimeClientRef.current) {
      logger.warn("Cannot apply garment: no active realtime session");
      return;
    }

    logger.info("Garment selected:", garment.name);
    if (isMountedRef.current) {
      setState("PROCESSING");
      setActiveGarmentName(garment.name);
    }

    try {
      const prompt = getGarmentPrompt(garment.category);

      // Use the unified set() method — atomic prompt + image update
      // This does NOT reconnect WebRTC or restart the camera (GOAL.md §12)
      await realtimeClientRef.current.set({
        prompt,
        image: garment.file,
        enhance: false,
      });

      logger.info("Garment sent");
      if (isMountedRef.current) {
        setState("READY");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      logger.error("Garment apply error:", raw);
      if (isMountedRef.current) {
        setError({
          state: "GARMENT_UPLOAD_ERROR",
          message: "This garment could not be applied. Try another image.",
          technicalDetail: raw,
        });
        setState("READY"); // Revert to ready so user can try another garment
      }
    }
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────
  const isConnected = state === "CONNECTED" || state === "READY";
  const isProcessing = state === "PROCESSING";

  return {
    state,
    cameraStream,
    outputStream,
    start,
    stop,
    applyGarment,
    error,
    isConnected,
    isProcessing,
    connectionState,
    cameraResolution,
    activeGarmentName,
    sessionId,
  };
}
