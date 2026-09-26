/**
 * @module Diagnostics
 * @description Development-only diagnostics panel showing realtime session info.
 * Hidden in production. Important for debugging WebRTC/camera/model failures.
 */

"use client";

import React, { useState } from "react";
import type { SessionState } from "../types/tryon";

interface DiagnosticsProps {
  /** Current session state. */
  state: SessionState;
  /** Decart connection state string. */
  connectionState: string;
  /** Camera resolution string (e.g. "1280x720"). */
  cameraResolution: string;
  /** Name of the currently active garment. */
  activeGarmentName: string;
  /** Decart session ID. */
  sessionId: string;
}

export default function Diagnostics({
  state,
  connectionState,
  cameraResolution,
  activeGarmentName,
  sessionId,
}: DiagnosticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;

  const isConnected =
    state === "CONNECTED" || state === "READY" || state === "PROCESSING";

  return (
    <div className="diagnostics">
      <button
        className="diagnostics__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        🔧 {isExpanded ? "Hide" : "Show"} Diagnostics
      </button>

      {isExpanded && (
        <div className="diagnostics__panel">
          <div className="diagnostics__row">
            <span className="diagnostics__label">Session State:</span>
            <span className="diagnostics__value">{state}</span>
          </div>
          <div className="diagnostics__row">
            <span className="diagnostics__label">Camera:</span>
            <span
              className={`diagnostics__value ${cameraResolution ? "diagnostics__value--ok" : "diagnostics__value--off"}`}
            >
              {cameraResolution || "Not connected"}
            </span>
          </div>
          <div className="diagnostics__row">
            <span className="diagnostics__label">Camera Resolution:</span>
            <span className="diagnostics__value">
              {cameraResolution || "—"}
            </span>
          </div>
          <div className="diagnostics__row">
            <span className="diagnostics__label">Realtime:</span>
            <span
              className={`diagnostics__value ${isConnected ? "diagnostics__value--ok" : "diagnostics__value--off"}`}
            >
              {connectionState}
            </span>
          </div>
          <div className="diagnostics__row">
            <span className="diagnostics__label">Model:</span>
            <span className="diagnostics__value">lucy-vton-latest</span>
          </div>
          <div className="diagnostics__row">
            <span className="diagnostics__label">Remote Stream:</span>
            <span className="diagnostics__value">
              {state === "READY" || state === "PROCESSING"
                ? "Receiving"
                : "Not receiving"}
            </span>
          </div>
          <div className="diagnostics__row">
            <span className="diagnostics__label">Garment:</span>
            <span className="diagnostics__value">
              {activeGarmentName || "None"}
            </span>
          </div>
          <div className="diagnostics__row">
            <span className="diagnostics__label">Session ID:</span>
            <span className="diagnostics__value diagnostics__value--mono">
              {sessionId || "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
