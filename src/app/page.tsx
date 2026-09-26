/**
 * @module page
 * @description Main page for the Real-Time AI Virtual Try-On application.
 * Assembles all components and manages the garment gallery state.
 *
 * Layout:
 * - Desktop: Side-by-side (video left, controls right)
 * - Mobile: Stacked (video top, controls below)
 */

"use client";

import React, { useCallback, useState } from "react";
import { useRealtimeTryOn } from "./hooks/useRealtimeTryOn";
import type { GarmentItem } from "./types/tryon";

import CameraPermission from "./components/CameraPermission";
import CameraPreview from "./components/CameraPreview";
import TryOnVideo from "./components/TryOnVideo";
import GarmentUploader from "./components/GarmentUploader";
import GarmentGallery from "./components/GarmentGallery";
import SessionControls from "./components/SessionControls";
import LoadingState from "./components/LoadingState";
import Diagnostics from "./components/Diagnostics";

export default function HomePage() {
  // ── Core hook ─────────────────────────────────────────────────────────
  const {
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
  } = useRealtimeTryOn();

  // ── Local garment gallery ─────────────────────────────────────────────
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [activeGarmentId, setActiveGarmentId] = useState<string | null>(null);

  /** Handle a new garment from the uploader — add to gallery and apply. */
  const handleGarmentReady = useCallback(
    async (garment: GarmentItem) => {
      // Add to gallery (avoid duplicates by id)
      setGarments((prev) => {
        const exists = prev.some((g) => g.id === garment.id);
        return exists ? prev : [...prev, garment];
      });
      setActiveGarmentId(garment.id);
      await applyGarment(garment);
    },
    [applyGarment]
  );

  /** Handle gallery selection — apply without reconnection. */
  const handleSelectGarment = useCallback(
    async (garment: GarmentItem) => {
      setActiveGarmentId(garment.id);
      await applyGarment(garment);
    },
    [applyGarment]
  );

  /** Remove a garment from the gallery. */
  const handleRemoveGarment = useCallback(
    (id: string) => {
      setGarments((prev) => {
        const garment = prev.find((g) => g.id === id);
        if (garment) URL.revokeObjectURL(garment.previewUrl);
        return prev.filter((g) => g.id !== id);
      });
      if (activeGarmentId === id) setActiveGarmentId(null);
    },
    [activeGarmentId]
  );

  // ── Determine what to show ────────────────────────────────────────────
  const isRequesting = state === "REQUESTING_CAMERA";
  const showPermissionScreen = (state === "IDLE" || isRequesting) && !error;
  const showVideo =
    state !== "IDLE" || cameraStream !== null || outputStream !== null;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__logo">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h1 className="app__title">Virtual Try-On</h1>
          </div>
          <LoadingState state={state} />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="app__main">
        {showPermissionScreen ? (
          /* ── IDLE: Camera Permission Screen ── */
          <CameraPermission
            onRequestCamera={start}
            isRequesting={isRequesting}
          />
        ) : (
          /* ── Active Session Layout ── */
          <div className="app__layout">
            {/* ── Left: Video Area ── */}
            <div className="app__video-area">
              <div className="app__video-container">
                <TryOnVideo
                  outputStream={outputStream}
                  cameraStream={cameraStream}
                  state={state}
                />
                <CameraPreview stream={cameraStream} />
              </div>
            </div>

            {/* ── Right: Controls ── */}
            <div className="app__controls">
              <GarmentUploader
                onGarmentReady={handleGarmentReady}
                isProcessing={isProcessing}
                isConnected={isConnected}
              />

              <GarmentGallery
                garments={garments}
                activeGarmentId={activeGarmentId}
                onSelectGarment={handleSelectGarment}
                isProcessing={isProcessing}
                onRemoveGarment={handleRemoveGarment}
              />

              <SessionControls
                state={state}
                onStart={start}
                onStop={stop}
              />

              <Diagnostics
                state={state}
                connectionState={connectionState}
                cameraResolution={cameraResolution}
                activeGarmentName={activeGarmentName}
                sessionId={sessionId}
              />
            </div>
          </div>
        )}

        {/* ── Error Toast ── */}
        {error && (
          <div className="error-toast">
            <div className="error-toast__content">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="error-toast__icon"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p>{error.message}</p>
            </div>
            <button
              className="error-toast__dismiss"
              onClick={() => {
                /* Error will reset on next action */
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
