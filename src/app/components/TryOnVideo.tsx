/**
 * @module TryOnVideo
 * @description Main AI output video display.
 * Shows the transformed video stream from Decart.
 * Falls back to the camera stream if no output is available yet.
 * Uses ref-based srcObject assignment to avoid React re-renders per frame.
 */

"use client";

import React, { useEffect, useRef } from "react";
import type { SessionState } from "../types/tryon";

interface TryOnVideoProps {
  /** AI-transformed output stream from Decart. */
  outputStream: MediaStream | null;
  /** Raw camera stream as fallback. */
  cameraStream: MediaStream | null;
  /** Current session state for overlay text. */
  state: SessionState;
}

export default function TryOnVideo({
  outputStream,
  cameraStream,
  state,
}: TryOnVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Assign the best available stream to the video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const stream = outputStream ?? cameraStream;
    if (stream) {
      video.srcObject = stream;
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video) video.srcObject = null;
    };
  }, [outputStream, cameraStream]);

  /** Overlay message based on current state. */
  const overlayMessage = (() => {
    switch (state) {
      case "CONNECTING":
        return "Connecting to virtual try-on...";
      case "CONNECTED":
        return "AI try-on ready — upload a garment to start";
      case "PROCESSING":
        return "Applying garment...";
      default:
        return null;
    }
  })();

  const hasVideo = outputStream !== null || cameraStream !== null;

  return (
    <div className="tryon-video">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="tryon-video__element"
        />
      ) : (
        <div className="tryon-video__placeholder">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="tryon-video__placeholder-icon"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <p>Start camera to begin</p>
        </div>
      )}

      {/* State overlay — avoids blank screens during transitions */}
      {overlayMessage && hasVideo && (
        <div className="tryon-video__overlay">
          <span className="spinner spinner--lg" />
          <p>{overlayMessage}</p>
        </div>
      )}
    </div>
  );
}
