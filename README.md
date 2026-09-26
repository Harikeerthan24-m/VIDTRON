# VIDTRON — Real-Time AI Virtual Try-On

A production-quality standalone web application that enables users to virtually try on clothing in real-time using their webcam and AI. 

Users can upload garment images and see themselves wearing them instantly via a live WebRTC video stream powered by the Decart Realtime API (`lucy-vton-latest` model).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism design)
- **AI Backend:** Decart Realtime API (`@decartai/sdk`)
- **Video:** Browser WebRTC / MediaStream APIs

## Features

- **Real-Time Webcam Integration:** `getUserMedia` with explicit permission flows.
- **Secure Architecture:** Server-side API routes for ephemeral token generation. The permanent API key never reaches the browser.
- **Instant Garment Switching:** Atomic garment state updates via the Decart SDK without dropping the WebRTC connection.
- **Garment Gallery:** Drag-and-drop upload and a local gallery for quick switching.
- **Premium Design:** Dark mode, glassmorphism UI, smooth transitions, and diagnostic panels.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Add your Decart API key. Create a `.env.local` file in the root directory:
   ```env
   DECART_API_KEY=your_decart_api_key_here
   ```
   *(You can obtain an API key from [platform.decart.ai](https://platform.decart.ai))*

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
