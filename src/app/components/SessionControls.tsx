/**
 * @module SessionControls
 * @description Start / Stop / Restart session controls.
 * Clean abstraction over the hook's start() and stop() methods.
 */

"use client";

import React from "react";
import type { SessionState } from "../types/tryon";

interface SessionControlsProps {
  /** Current session state. */
  state: SessionState;
  /** Start a new session. */
  onStart: () => void;
  /** Stop the current session. */
  onStop: () => void;
}

export default function SessionControls({
  state,
  onStart,
  onStop,
}: SessionControlsProps) {
  const isActive =
    state === "CAMERA_READY" ||
    state === "CONNECTING" ||
    state === "CONNECTED" ||
    state === "PROCESSING" ||
    state === "READY";

  const isStarting =
    state === "REQUESTING_CAMERA" || state === "CONNECTING";

  return (
    <div className="session-controls">
      {isActive ? (
        <button className="btn btn--danger btn--lg" onClick={onStop}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="btn__icon"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          Stop Try-On
        </button>
      ) : (
        <button
          className="btn btn--primary btn--lg"
          onClick={onStart}
          disabled={isStarting}
        >
          {isStarting ? (
            <>
              <span className="spinner spinner--sm" />
              Starting...
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="btn__icon"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {state === "IDLE" ? "Start Camera" : "Start Again"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
