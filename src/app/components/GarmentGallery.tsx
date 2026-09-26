/**
 * @module GarmentGallery
 * @description Local garment gallery that displays previously uploaded garments.
 * Clicking a garment calls applyGarment() — no page reload, no camera restart,
 * no WebRTC reconnection (GOAL.md §13).
 */

"use client";

import React from "react";
import type { GarmentItem } from "../types/tryon";

interface GarmentGalleryProps {
  /** All garments in the local gallery. */
  garments: GarmentItem[];
  /** The ID of the currently active garment. */
  activeGarmentId: string | null;
  /** Called when a garment thumbnail is clicked. */
  onSelectGarment: (garment: GarmentItem) => void;
  /** Whether a garment is currently being applied. */
  isProcessing: boolean;
  /** Remove a garment from the gallery. */
  onRemoveGarment: (id: string) => void;
}

export default function GarmentGallery({
  garments,
  activeGarmentId,
  onSelectGarment,
  isProcessing,
  onRemoveGarment,
}: GarmentGalleryProps) {
  if (garments.length === 0) return null;

  return (
    <div className="garment-gallery">
      <h3 className="garment-gallery__title">Your Garments</h3>

      <div className="garment-gallery__grid">
        {garments.map((garment) => (
          <div
            key={garment.id}
            className={`garment-gallery__item ${
              activeGarmentId === garment.id
                ? "garment-gallery__item--active"
                : ""
            }`}
          >
            <button
              className="garment-gallery__button"
              onClick={() => onSelectGarment(garment)}
              disabled={isProcessing}
              title={garment.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={garment.previewUrl}
                alt={garment.name}
                className="garment-gallery__image"
              />
              {activeGarmentId === garment.id && (
                <div className="garment-gallery__active-badge">✓</div>
              )}
            </button>
            <button
              className="garment-gallery__remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveGarment(garment.id);
              }}
              title="Remove from gallery"
            >
              ✕
            </button>
            <p className="garment-gallery__name">{garment.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
