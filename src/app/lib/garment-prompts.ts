/**
 * @module garment-prompts
 * @description Category-specific prompt templates for the virtual try-on model.
 * Each prompt is tuned to preserve the person's identity, body, pose, lighting,
 * and natural movement while substituting the correct clothing type.
 */

import type { GarmentCategory } from "../types/tryon";

/** Mapping from garment category to the optimal try-on prompt. */
const GARMENT_PROMPTS: Record<GarmentCategory, string> = {
  shirt:
    "Substitute the current top with this garment. Preserve the person's identity, body proportions, pose, lighting, and natural movement.",
  jacket:
    "Substitute the current outerwear with this jacket. Preserve the person's identity, body proportions, pose, lighting, and natural movement.",
  pants:
    "Substitute the current bottoms with these pants. Preserve the person's identity, body proportions, pose, lighting, and natural movement.",
  dress:
    "Substitute the person's current outfit with this dress. Preserve the person's identity, body proportions, pose, lighting, and natural movement.",
  general:
    "Substitute the current top with this garment, preserving the person's identity, body, pose, lighting, and natural movement.",
};

/**
 * Returns the appropriate try-on prompt for the given garment category.
 *
 * @param category - The garment category (shirt, jacket, pants, dress, or general).
 * @returns The prompt string to send to the VTON model.
 */
export function getGarmentPrompt(category: GarmentCategory): string {
  return GARMENT_PROMPTS[category] ?? GARMENT_PROMPTS.general;
}
