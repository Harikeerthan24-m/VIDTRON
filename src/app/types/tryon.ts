/**
 * @module tryon
 * @description Core type definitions for the Real-Time AI Virtual Try-On application.
 * Defines session states, error states, garment categories, and the main hook interface.
 */

/** Session state machine — tracks the current lifecycle stage of the try-on session. */
export type SessionState =
  | "IDLE"
  | "REQUESTING_CAMERA"
  | "CAMERA_READY"
  | "CONNECTING"
  | "CONNECTED"
  | "PROCESSING"
  | "READY";

/** Error states — each maps to a user-friendly message in the UI. */
export type ErrorState =
  | "CAMERA_PERMISSION_DENIED"
  | "CAMERA_UNAVAILABLE"
  | "TOKEN_ERROR"
  | "WEBRTC_CONNECTION_ERROR"
  | "MODEL_ERROR"
  | "GARMENT_UPLOAD_ERROR"
  | "UNKNOWN_ERROR";

/** Garment category — drives which prompt template is used for the try-on. */
export type GarmentCategory = "shirt" | "jacket" | "pants" | "dress" | "general";

/** A garment stored in the local gallery. */
export interface GarmentItem {
  /** Unique identifier for this garment entry. */
  id: string;
  /** Display name chosen by the user or auto-generated. */
  name: string;
  /** The raw image file uploaded by the user. */
  file: File;
  /** Object URL for previewing the garment in the UI. */
  previewUrl: string;
  /** Optional category for prompt selection. */
  category: GarmentCategory;
  /** Timestamp when the garment was added. */
  addedAt: number;
}

/** User-facing error object — never exposes raw technical details. */
export interface TryOnError {
  /** Machine-readable error state. */
  state: ErrorState;
  /** Human-friendly message for display in the UI. */
  message: string;
  /** Raw technical error for developer console logging only. */
  technicalDetail?: string;
}

/** Return type of the useRealtimeTryOn hook — the single abstraction consumed by all UI components. */
export interface UseRealtimeTryOnReturn {
  /** Current session lifecycle state. */
  state: SessionState;
  /** Camera MediaStream (null until camera is granted). */
  cameraStream: MediaStream | null;
  /** AI-transformed output MediaStream from Decart (null until connected). */
  outputStream: MediaStream | null;
  /** Start the full session: camera → token → Decart realtime connection. */
  start: () => Promise<void>;
  /** Stop the session: disconnect realtime, stop camera tracks, reset state. */
  stop: () => void;
  /** Apply a garment image to the active realtime session (no reconnection). */
  applyGarment: (garment: GarmentItem) => Promise<void>;
  /** Current error, if any. */
  error: TryOnError | null;
  /** Convenience boolean: true when state is CONNECTED or READY. */
  isConnected: boolean;
  /** Convenience boolean: true when a garment is being applied. */
  isProcessing: boolean;
  /** Decart realtime connection state string for diagnostics. */
  connectionState: string;
  /** Camera video resolution string for diagnostics (e.g. "1280x720"). */
  cameraResolution: string;
  /** Active garment name for diagnostics. */
  activeGarmentName: string;
  /** Decart session ID for diagnostics. */
  sessionId: string;
}
