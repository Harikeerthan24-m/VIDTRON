/**
 * @module CameraPreview
 * @description Small picture-in-picture preview of the raw camera feed.
 * Positioned over the main AI output video.
 * Uses a ref-based approach to avoid unnecessary React re-renders per frame.
 */

"use client";

import React, { useEffect, useRef } from "react";

interface CameraPreviewProps {
  /** The raw camera MediaStream. */
  stream: MediaStream | null;
}

export default function CameraPreview({ stream }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="camera-preview">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-preview__video"
      />
      <span className="camera-preview__label">LIVE</span>
    </div>
  );
}
