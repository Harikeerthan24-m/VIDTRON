/**
 * @module CameraPermission
 * @description Pre-camera-permission screen.
 * Explains why camera access is needed and provides the "Enable Camera" button.
 * Only calls getUserMedia after the user explicitly clicks.
 */

"use client";

import React from "react";

interface CameraPermissionProps {
  /** Called when the user clicks "Enable Camera" — triggers getUserMedia. */
  onRequestCamera: () => void;
  /** Whether the camera request is in progress. */
  isRequesting: boolean;
}

export default function CameraPermission({
  onRequestCamera,
  isRequesting,
}: CameraPermissionProps) {
  return (
    <div className="camera-permission">
      <div className="camera-permission__icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>

      <h2 className="camera-permission__title">
        Virtual Try-On needs access to your camera
      </h2>

      <p className="camera-permission__description">
        Your camera feed is used to generate the live try-on experience. No video
        is recorded or stored.
      </p>

      <button
        className="btn btn--primary btn--lg"
        onClick={onRequestCamera}
        disabled={isRequesting}
      >
        {isRequesting ? (
          <>
            <span className="spinner spinner--sm" />
            Connecting camera...
          </>
        ) : (
          "Enable Camera"
        )}
      </button>
    </div>
  );
}
