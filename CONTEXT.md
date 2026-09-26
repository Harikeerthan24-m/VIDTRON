# VIDTRON — Real-Time AI Virtual Try-On Web App

## Project Overview

A production-quality standalone web application that enables users to virtually try on clothing in real-time using their webcam and Decart's AI-powered virtual try-on model (`lucy-vton-latest`). Users can upload garment images and see themselves wearing them instantly via a live WebRTC video stream.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Vanilla CSS design system
- **AI Backend:** Decart Realtime API (`@decartai/sdk`) — WebRTC-based
- **VTON Model:** `lucy-vton-latest` (lucy-vton-3.5)
- **Video:** Browser WebRTC / MediaStream APIs + HTML5 `<video>`
- **Auth:** Server-side client token generation via Next.js API routes
- **Font:** Inter (Google Fonts)

## Folder Structure

```
VID_TRY_ON_APP/
├── src/app/
│   ├── api/token/route.ts        # Server-side Decart token endpoint
│   ├── page.tsx                   # Main page (assembles all components)
│   ├── layout.tsx                 # Root layout (Inter font, SEO meta, globals.css)
│   ├── globals.css                # Premium dark-mode design system
│   ├── components/
│   │   ├── CameraPermission.tsx   # Pre-camera-access screen
│   │   ├── CameraPreview.tsx      # PiP camera preview overlay
│   │   ├── TryOnVideo.tsx         # Main AI output video display
│   │   ├── GarmentUploader.tsx    # Drag-and-drop garment upload
│   │   ├── GarmentGallery.tsx     # Local garment gallery grid
│   │   ├── SessionControls.tsx    # Start/Stop/Restart buttons
│   │   ├── LoadingState.tsx       # Pipeline stage loading messages
│   │   └── Diagnostics.tsx        # Dev-only diagnostics panel
│   ├── hooks/
│   │   └── useRealtimeTryOn.ts    # Core hook (Camera→Token→Decart→Video)
│   ├── lib/
│   │   ├── decart.ts              # Structured [TRYON] logger
│   │   └── garment-prompts.ts     # Category-specific VTON prompts
│   └── types/
│       └── tryon.ts               # TypeScript types (states, errors, etc.)
├── .env.local                     # DECART_API_KEY (never committed)
├── .env.example                   # Template for env setup
└── CONTEXT.md                     # This file
```

## Core Features

1. **Webcam Integration** — `getUserMedia` with explicit permission flow
2. **Secure Token Generation** — Server-side API route, permanent key never reaches browser
3. **Decart Realtime WebRTC** — Live bidirectional video stream with `lucy-vton-latest`
4. **Garment Upload** — Drag-and-drop, file picker, JPG/PNG/WebP, size validation
5. **Garment Switching** — `realtimeClient.set()` without reconnecting WebRTC
6. **Garment Gallery** — Local gallery for quick switching between uploaded garments
7. **Session Management** — Explicit state machine (IDLE→CAMERA_READY→CONNECTED→READY)
8. **Responsive Design** — Desktop side-by-side, mobile stacked layout
9. **Dev Diagnostics** — Camera, WebRTC, model, and session status panel (dev only)

## API Contracts

### POST /api/token

- **Request:** No body required
- **Response (200):** `{ apiKey: string, expiresAt: string }`
- **Response (500):** `{ error: string }`
- **Security:** Reads `DECART_API_KEY` from env, returns short-lived (300s) token

### Decart SDK API (Client-Side)

- `createDecartClient({ apiKey })` — initialize with ephemeral token
- `client.realtime.connect(stream, { model, mirror, onRemoteStream })` — WebRTC session
- `realtimeClient.set({ prompt, image, enhance })` — atomic garment update
- `realtimeClient.disconnect()` — cleanup
- `realtimeClient.on("connectionChange" | "error", callback)` — events

## Design Decisions

| Decision | Rationale |
|---|---|
| `useRealtimeTryOn` hook encapsulates all SDK logic | UI components never touch Decart internals (separation of concerns) |
| `set()` used instead of `setImage()` + `setPrompt()` | Atomic update avoids intermediate states (SDK docs recommendation) |
| Ref-based video srcObject assignment | Avoids React re-renders per video frame |
| `mirror: "auto"` in connect options | Pre-flips selfie stream for natural display |
| Category-specific prompts | Better VTON results than generic "replace top" prompt |
| Dark-mode-only design | Matches typical webcam/video app aesthetics |

## Known Issues / TODOs

- [ ] User needs to set `DECART_API_KEY` in `.env.local` before the app works
- [ ] Token refresh not implemented (300s TTL — session may expire on long use)
- [ ] No garment category auto-detection (user selects manually)
- [ ] Gallery is in-memory only (lost on page reload)
- [ ] No 1080p option exposed yet (SDK supports it)
- [ ] Fast mode not exposed yet (available for lucy-vton-latest, billed 2x)

## Last Updated

2026-09-26 — Initial implementation with full pipeline (Phases 1–5)
