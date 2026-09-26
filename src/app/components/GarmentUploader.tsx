/**
 * @module GarmentUploader
 * @description Garment image upload component with drag-and-drop, file picker,
 * preview, remove, and replace functionality.
 * Validates file type (JPG, JPEG, PNG, WebP) and size (max 10MB).
 */

"use client";

import React, { useCallback, useRef, useState } from "react";
import type { GarmentCategory, GarmentItem } from "../types/tryon";

/** Accepted MIME types for garment images. */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface GarmentUploaderProps {
  /** Called when a valid garment is uploaded and ready to be applied. */
  onGarmentReady: (garment: GarmentItem) => void;
  /** Whether a garment is currently being applied (disables the button). */
  isProcessing: boolean;
  /** Whether the session is connected and ready for garments. */
  isConnected: boolean;
}

export default function GarmentUploader({
  onGarmentReady,
  isProcessing,
  isConnected,
}: GarmentUploaderProps) {
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);
  const [category, setCategory] = useState<GarmentCategory>("general");
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates and processes a selected file.
   */
  const processFile = useCallback((file: File) => {
    setValidationError(null);

    // Type validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    // Revoke previous preview URL to avoid memory leaks
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview({ url: previewUrl, file });
  }, [preview?.url]);

  /** Handle file input change. */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  /** Handle drag events. */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  /** Remove current preview. */
  const handleRemove = useCallback(() => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [preview?.url]);

  /** Apply the uploaded garment. */
  const handleTryOn = useCallback(() => {
    if (!preview) return;

    const garment: GarmentItem = {
      id: `garment-${Date.now()}`,
      name: preview.file.name.replace(/\.[^.]+$/, ""),
      file: preview.file,
      previewUrl: preview.url,
      category,
      addedAt: Date.now(),
    };

    onGarmentReady(garment);
  }, [preview, category, onGarmentReady]);

  return (
    <div className="garment-uploader">
      <h3 className="garment-uploader__title">Upload Garment</h3>

      {!preview ? (
        /* ── Drop Zone ── */
        <div
          className={`garment-uploader__dropzone ${isDragOver ? "garment-uploader__dropzone--active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="garment-uploader__icon"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <p className="garment-uploader__text">
            Drag garment image here
            <br />
            <span className="garment-uploader__or">or</span>
          </p>

          <span className="btn btn--outline btn--sm">Upload Image</span>

          <p className="garment-uploader__hint">JPG / PNG / WebP · Max {MAX_FILE_SIZE_MB}MB</p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileChange}
            className="garment-uploader__input"
          />
        </div>
      ) : (
        /* ── Preview ── */
        <div className="garment-uploader__preview">
          <div className="garment-uploader__preview-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt="Garment preview"
              className="garment-uploader__preview-image"
            />
            <button
              className="garment-uploader__remove-btn"
              onClick={handleRemove}
              title="Remove garment"
            >
              ✕
            </button>
          </div>

          {/* Category selector */}
          <div className="garment-uploader__category">
            <label className="garment-uploader__category-label">Type:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GarmentCategory)}
              className="garment-uploader__category-select"
            >
              <option value="general">Auto</option>
              <option value="shirt">Shirt / Top</option>
              <option value="jacket">Jacket / Outerwear</option>
              <option value="pants">Pants / Bottoms</option>
              <option value="dress">Dress</option>
            </select>
          </div>

          <p className="garment-uploader__tip">
            💡 Tip: Clean product images usually produce better try-on results.
          </p>

          <button
            className="btn btn--primary btn--lg garment-uploader__try-btn"
            onClick={handleTryOn}
            disabled={isProcessing || !isConnected}
          >
            {isProcessing ? (
              <>
                <span className="spinner spinner--sm" />
                Applying...
              </>
            ) : !isConnected ? (
              "Start camera first"
            ) : (
              "Try This On"
            )}
          </button>
        </div>
      )}

      {validationError && (
        <div className="garment-uploader__error">{validationError}</div>
      )}
    </div>
  );
}
