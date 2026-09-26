/**
 * @module api/token
 * @description Server-side endpoint that generates short-lived Decart client tokens.
 * The permanent DECART_API_KEY never leaves the server.
 *
 * POST /api/token → { apiKey: string; expiresAt: string }
 */

import { createDecartClient } from "@decartai/sdk";
import { NextResponse } from "next/server";

/**
 * POST handler — creates a short-lived client token scoped to the VTON model.
 * Returns the temporary token for the browser to use with WebRTC.
 */
export async function POST() {
  try {
    const permanentKey = process.env.DECART_API_KEY;

    if (!permanentKey) {
      console.error("[TRYON] DECART_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error. AI service is not available." },
        { status: 500 }
      );
    }

    const client = createDecartClient({ apiKey: permanentKey });

    // Generate a short-lived token (5 minutes) scoped to VTON models
    const token = await client.tokens.create({
      expiresIn: 300,
      allowedModels: ["lucy-vton-3.5", "lucy-vton-latest"],
    });

    return NextResponse.json({
      apiKey: token.apiKey,
      expiresAt: token.expiresAt,
    });
  } catch (error) {
    console.error("[TRYON] Token generation failed:", error);
    return NextResponse.json(
      { error: "Unable to start the AI session. Please try again." },
      { status: 500 }
    );
  }
}
