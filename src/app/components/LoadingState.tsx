/**
 * @module LoadingState
 * @description Contextual loading messages displayed during state transitions.
 * Shows progress through the Camera → Token → Decart connection pipeline.
 */

"use client";

import React from "react";
import type { SessionState } from "../types/tryon";

interface LoadingStateProps {
  /** Current session state. */
  state: SessionState;
}

/** Maps session states to user-friendly loading messages. */
const LOADING_MESSAGES: Partial<Record<SessionState, string>> = {
  REQUESTING_CAMERA: "Connecting camera...",
  CONNECTING: "Connecting to virtual try-on...",
  CONNECTED: "AI try-on ready",
  PROCESSING: "Applying garment...",
  READY: "AI try-on ready",
};

export default function LoadingState({ state }: LoadingStateProps) {
  const message = LOADING_MESSAGES[state];
  if (!message) return null;

  const isLoading =
    state === "REQUESTING_CAMERA" ||
    state === "CONNECTING" ||
    state === "PROCESSING";

  const isReady = state === "CONNECTED" || state === "READY";

  return (
    <div
      className={`loading-state ${isReady ? "loading-state--ready" : ""} ${isLoading ? "loading-state--loading" : ""}`}
    >
      {isLoading && <span className="spinner spinner--sm" />}
      {isReady && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="loading-state__check"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
}
