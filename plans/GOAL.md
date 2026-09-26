# Build: Standalone Real-Time AI Virtual Try-On Web App

## Objective

Build a production-quality standalone web application that allows a user to:

1. Open the website.
2. Grant webcam permission.
3. See their live camera feed.
4. Upload a clothing/garment image.
5. Send the live camera stream + garment reference image to Decart's real-time virtual try-on model.
6. Receive the AI-transformed video stream in real time.
7. Display the transformed video as the main output.
8. Change garments without reconnecting the camera/WebRTC session.
9. Stop/restart the session cleanly.

This is an independent standalone application.

Do not reference or integrate any existing application, company, product, database, analytics system, or codebase.

---

# 1. Technical Architecture

Use this architecture:

```text
                         WEB BROWSER
                              |
              +---------------+---------------+
              |                               |
              v                               v
        User Webcam                    Garment Upload
        MediaStream                    Image / Blob
              |                               |
              |                               |
              +---------------+---------------+
                              |
                              v
                    Decart Realtime SDK
                              |
                           WebRTC
                              |
                              v
                    Decart Realtime API
                              |
                       lucy-vton-latest
                              |
                              v
                  AI transformed video stream
                              |
                              v
                       <video> output
```

The browser must NOT contain the permanent Decart API key.

Use:

```text
Browser
   |
   | POST /api/token
   v
Backend
   |
   | DECART_API_KEY
   v
Decart
   |
   | short-lived client token
   v
Browser
```

---

# 2. Recommended Stack

Use:

* Next.js
* TypeScript
* React
* Tailwind CSS
* `@decartai/sdk`
* Browser WebRTC / MediaStream APIs
* HTML5 `<video>`
* Next.js API routes for secure token generation

Use a clean modern project structure.

Do NOT introduce unnecessary technologies.

Do NOT build a custom WebRTC server.

Do NOT implement your own AI model.

Do NOT attempt to reproduce the VTON model locally.

AI inference should be handled by Decart.

---

# 3. Environment Variables

Create:

```env
DECART_API_KEY=
```

Use `.env.local`.

Never expose:

```text
DECART_API_KEY
```

to client-side JavaScript.

Also create:

```text
.env.example
```

with:

```env
DECART_API_KEY=your_decart_api_key_here
```

Add `.env.local` to `.gitignore`.

---

# 4. Backend Token Endpoint

Create:

```text
POST /api/token
```

The endpoint should:

1. Read `DECART_API_KEY`.
2. Initialize the Decart client.
3. Create a short-lived client token.
4. Return only the temporary token to the browser.
5. Never return the permanent API key.

Use the currently installed Decart SDK API.

Do not invent SDK methods.

Before implementation, inspect:

* Installed `@decartai/sdk` version
* TypeScript definitions
* Official SDK examples
* Current API signatures

---

# 5. Camera Initialization

When the user clicks:

```text
Start Camera
```

request:

```typescript
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "user",
  },
  audio: false,
});
```

The camera should NOT automatically start before the user explicitly chooses to start it.

Handle:

* Permission granted
* Permission denied
* Camera unavailable
* No camera device
* Browser does not support camera
* Camera already in use

Display useful user-facing messages.

Example:

```text
Camera permission is required for virtual try-on.
```

Do not expose raw JavaScript errors directly to users.

---

# 6. Decart Realtime Connection

After obtaining:

1. Client token
2. Camera MediaStream

initialize the Decart realtime client.

Use the realtime model:

```text
lucy-vton-latest
```

The architecture should follow the current Decart public integration.

Conceptually:

```typescript
const client = createDecartClient({
  apiKey: clientToken,
});

const realtimeClient = await client.realtime.connect(cameraStream, {
  model: models.realtime("lucy-vton-latest"),

  onRemoteStream: (remoteStream) => {
    outputVideo.srcObject = remoteStream;
  },
});
```

IMPORTANT:

Use the actual API exposed by the installed SDK.

If the current SDK signature differs, inspect the package/documentation and use the correct current implementation.

Do not blindly copy outdated examples.

---

# 7. Video UI

Create two video areas.

## Main Output

```text
┌────────────────────────────────────┐
│                                    │
│        AI VIRTUAL TRY-ON           │
│                                    │
│        [ transformed video ]       │
│                                    │
└────────────────────────────────────┘
```

## Original Camera Preview

Show a smaller picture-in-picture camera preview:

```text
┌──────────────────────────────┐
│                              │
│        AI OUTPUT             │
│                              │
│                  ┌────────┐  │
│                  │ CAMERA │  │
│                  └────────┘  │
└──────────────────────────────┘
```

The AI output should be the primary visual experience.

---

# 8. Garment Upload

Create a garment upload component.

Requirements:

* Drag and drop
* File picker
* Image preview
* Remove image
* Replace image
* JPG
* JPEG
* PNG
* WebP
* Reasonable file-size validation
* Client-side image validation

Example:

```text
┌──────────────────────────────────┐
│                                  │
│       Drag garment here          │
│              or                  │
│        [ Upload Image ]          │
│                                  │
│     JPG / PNG / WebP             │
│                                  │
└──────────────────────────────────┘
```

After upload:

```text
┌──────────────────────┐
│                      │
│    garment image     │
│                      │
└──────────────────────┘

[ Try This On ]
```

---

# 9. Garment Image Requirements

Prefer clean garment reference images.

The user should be informed that better inputs generally contain:

* Clearly visible clothing
* Minimal background
* Good lighting
* Reasonably high resolution
* Preferably the clothing item without a person wearing it

Do not unnecessarily reject imperfect images.

Instead show a warning:

```text
Tip: Clean product images usually produce better try-on results.
```

---

# 10. Applying a Garment

When the user selects:

```text
Try This On
```

call the realtime client's garment/image method.

Use the current SDK equivalent of:

```typescript
await realtimeClient.setImage(garmentBlob, {
  prompt:
    "Substitute the current top with this garment, preserving the person's identity, body, pose, lighting, and natural movement.",
  enhance: false,
});
```

The exact API must be verified against the installed SDK.

---

# 11. Garment-Specific Prompts

If the garment category is known, use an appropriate prompt.

### Shirt

```text
Substitute the current top with this garment. Preserve the person's identity, body proportions, pose, lighting, and natural movement.
```

### Jacket

```text
Substitute the current outerwear with this jacket. Preserve the person's identity, body proportions, pose, lighting, and natural movement.
```

### Pants

```text
Substitute the current bottoms with these pants. Preserve the person's identity, body proportions, pose, lighting, and natural movement.
```

### Dress

```text
Substitute the person's current outfit with this dress. Preserve the person's identity, body proportions, pose, lighting, and natural movement.
```

Do not force every garment into a "top" prompt.

---

# 12. Critical Requirement: No Reconnection

This is extremely important.

Establish the WebRTC realtime session once:

```text
Camera
   ↓
WebRTC
   ↓
Decart
```

Then allow:

```text
Garment A
   ↓
setImage()

Garment B
   ↓
setImage()

Garment C
   ↓
setImage()
```

without reconnecting.

Changing a garment must NOT:

* Restart the camera
* Reconnect WebRTC
* Reload the page
* Request camera permission again

The realtime session should remain alive.

---

# 13. Garment Gallery

After the basic upload flow works, implement a small local garment gallery.

Example:

```text
YOUR GARMENTS

┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│       │ │       │ │       │ │       │
│ shirt │ │ jacket│ │ hoodie│ │ dress │
│       │ │       │ │       │ │       │
└───────┘ └───────┘ └───────┘ └───────┘
```

Clicking another garment should call `setImage()`.

No page reload.

No camera restart.

No WebRTC reconnection.

---

# 14. Session State Machine

Implement explicit state management.

States:

```text
IDLE
 ↓
REQUESTING_CAMERA
 ↓
CAMERA_READY
 ↓
CONNECTING
 ↓
CONNECTED
 ↓
PROCESSING
 ↓
READY
```

Error states:

```text
CAMERA_PERMISSION_DENIED
CAMERA_UNAVAILABLE
TOKEN_ERROR
WEBRTC_CONNECTION_ERROR
MODEL_ERROR
GARMENT_UPLOAD_ERROR
UNKNOWN_ERROR
```

The UI should reflect the current state.

Examples:

```text
Connecting to AI...
```

```text
AI Try-On Ready
```

```text
Changing garment...
```

```text
Camera permission denied
```

---

# 15. Loading UX

During connection:

```text
Connecting camera...
```

Then:

```text
Connecting to virtual try-on...
```

Then:

```text
AI try-on ready
```

When changing garments:

```text
Applying garment...
```

Keep the existing video visible if possible while the new garment is being applied.

Avoid blank screens during transitions.

---

# 16. Stop Session

Create:

```text
Stop Try-On
```

When clicked:

1. Disconnect realtime client.
2. Stop every camera track.
3. Clear video `srcObject`.
4. Reset UI state.
5. Release resources.

Conceptually:

```typescript
stream.getTracks().forEach(track => track.stop());
realtimeClient.disconnect();
```

Ensure cleanup also happens when the React component unmounts.

---

# 17. Restart Session

After stopping:

```text
[ Start Again ]
```

should create a completely clean session.

Do not accidentally reuse stale:

* MediaStreams
* WebRTC connections
* Client tokens
* Video tracks
* Event handlers

---

# 18. Error Handling

Handle these separately.

## Camera Permission

```text
Camera access was denied.
Please allow camera access in your browser settings and try again.
```

## No Camera

```text
No camera was detected on this device.
```

## Token Failure

```text
Unable to start the AI session.
Please try again.
```

## WebRTC Failure

```text
The realtime AI connection failed.
Please check your internet connection and try again.
```

## Garment Failure

```text
This garment could not be applied.
Try another image.
```

Never display raw implementation errors to end users.

For example, do not show:

```text
onCameraGranted is not a function
```

Instead:

```text
Unable to initialize the camera.
```

Log the technical error separately for developers.

---

# 19. Camera Permission UX

Before requesting camera access, show:

```text
Virtual Try-On needs access to your camera.

Your camera feed is used to generate the live try-on experience.

[ Enable Camera ]
```

Only call `getUserMedia()` after the user clicks the button.

Do not request microphone permissions.

Use:

```typescript
audio: false
```

unless the Decart SDK explicitly requires otherwise.

---

# 20. Responsive Design

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile browser

Desktop:

```text
┌─────────────────────────────────────────────────┐
│                 Virtual Try-On                  │
├───────────────────────────┬─────────────────────┤
│                           │                     │
│                           │  Garment Selection  │
│       AI VIDEO            │                     │
│                           │  [ Upload ]         │
│                           │                     │
│                           │  [ Garments ]       │
│                           │                     │
└───────────────────────────┴─────────────────────┘
```

Mobile:

```text
┌─────────────────────┐
│                     │
│      AI VIDEO       │
│                     │
├─────────────────────┤
│ Garment             │
│                     │
│ [Upload]            │
│                     │
│ [Garments]          │
└─────────────────────┘
```

---

# 21. Security

Never:

* Put the permanent Decart API key in React code.
* Put it in `NEXT_PUBLIC_*`.
* Commit `.env.local`.
* Send the permanent key to the browser.
* Store the permanent key in localStorage.
* Log the permanent key.

Use:

```text
.env.local
```

and:

```text
.env.example
```

---

# 22. Performance

Optimize specifically for realtime video.

Do NOT:

* Convert camera frames to base64 unnecessarily.
* Upload every camera frame manually.
* Implement polling.
* Build custom WebSocket video transport.
* Reconnect when changing garments.
* Trigger unnecessary React renders for every video frame.

Use the realtime WebRTC pipeline provided by the SDK.

The browser should essentially do:

```text
Camera MediaStream
       ↓
Decart SDK
       ↓
WebRTC
       ↓
Remote MediaStream
       ↓
<video>
```

---

# 23. Optional Fast Mode

If the installed Decart SDK/model supports a realtime fast mode for the selected VTON model, support it as an optional configuration.

Do not assume it exists.

Detect support from the SDK/model definition.

For the first implementation:

```text
DEFAULT = standard mode
```

Do not silently enable a higher-cost mode.

---

# 24. Logging

Create structured development logs.

Example:

```text
[TRYON] Camera requested
[TRYON] Camera granted
[TRYON] Token requested
[TRYON] Token received
[TRYON] Connecting realtime model
[TRYON] Realtime connected
[TRYON] Garment selected
[TRYON] Garment sent
[TRYON] Remote stream received
[TRYON] Session disconnected
```

Never log secrets.

Reduce verbose logs in production.

---

# 25. Developer Diagnostics

Create a development-only diagnostics panel.

Display:

```text
Camera: Connected
Camera resolution: 1280x720
Realtime: Connected
Model: lucy-vton-latest
Remote stream: Receiving
Garment: Loaded
Session: Active
```

Hide the diagnostics panel in production.

This is important for debugging realtime failures.

---

# 26. Project Structure

Use a structure similar to:

```text
app/
├── api/
│   └── token/
│       └── route.ts
│
├── page.tsx
│
├── components/
│   ├── CameraPermission.tsx
│   ├── CameraPreview.tsx
│   ├── TryOnVideo.tsx
│   ├── GarmentUploader.tsx
│   ├── GarmentGallery.tsx
│   ├── SessionControls.tsx
│   ├── LoadingState.tsx
│   └── Diagnostics.tsx
│
├── hooks/
│   └── useRealtimeTryOn.ts
│
├── lib/
│   ├── decart.ts
│   └── garment-prompts.ts
│
└── types/
    └── tryon.ts
```

Keep realtime connection logic inside:

```text
useRealtimeTryOn.ts
```

rather than putting everything into `page.tsx`.

---

# 27. Main React Hook

Create:

```typescript
useRealtimeTryOn()
```

It should expose something conceptually similar to:

```typescript
{
  state,
  cameraStream,
  outputStream,
  start,
  stop,
  applyGarment,
  error,
  isConnected,
  isProcessing
}
```

The UI should consume this abstraction.

Do not spread Decart SDK implementation details across the UI.

---

# 28. MVP Implementation Order

Build in this exact order.

## Phase 1 — Camera

```text
Open website
     ↓
Click Start Camera
     ↓
Camera appears
```

Verify this before proceeding.

---

## Phase 2 — Realtime AI

```text
Camera
   ↓
Token
   ↓
Decart
   ↓
WebRTC
   ↓
AI output
```

Do not continue until the remote AI video stream works.

---

## Phase 3 — Garment

```text
Upload garment
      ↓
setImage()
      ↓
AI clothing transformation
```

---

## Phase 4 — Garment Switching

```text
Upload garment A
      ↓
Try on

Upload garment B
      ↓
setImage()

Upload garment C
      ↓
setImage()
```

The camera and WebRTC connection must remain alive throughout.

---

## Phase 5 — Product Polish

Only after the realtime pipeline works, add:

* polished UI
* garment gallery
* mobile responsiveness
* diagnostics
* robust error handling
* loading states
* animations

Do NOT spend significant time on visual polish before proving the end-to-end pipeline.

---

# 29. Acceptance Criteria

## Camera

* [ ] User can grant camera permission.
* [ ] Camera preview appears.
* [ ] Permission denial is handled.
* [ ] Camera tracks are properly stopped.

## Realtime

* [ ] Backend generates a client token.
* [ ] Permanent API key never reaches browser.
* [ ] Browser connects to Decart.
* [ ] `lucy-vton-latest` realtime session starts.
* [ ] Remote transformed stream is received.
* [ ] AI output appears in `<video>`.

## Garment

* [ ] User can upload a garment.
* [ ] Garment preview appears.
* [ ] Garment can be applied.
* [ ] Garment can be replaced.
* [ ] Replacing garment does NOT reconnect WebRTC.

## Session

* [ ] Start works.
* [ ] Stop works.
* [ ] Restart works.
* [ ] React unmount cleanup works.
* [ ] No camera/WebRTC resource leaks.

## UX

* [ ] Loading states exist.
* [ ] Errors are understandable.
* [ ] Responsive UI works.
* [ ] No raw technical errors shown to users.

---

# 30. Final Experience

The application should ultimately feel like:

```text
                 REAL-TIME AI FITTING ROOM

        ┌─────────────────────────────────┐
        │                                 │
        │                                 │
        │       👤 LIVE AI OUTPUT         │
        │                                 │
        │       wearing selected          │
        │          garment                │
        │                                 │
        └─────────────────────────────────┘

        Select a garment

        ┌──────┐ ┌──────┐ ┌──────┐
        │ 👕   │ │ 🧥   │ │ 👗   │
        └──────┘ └──────┘ └──────┘

              [ Upload Garment ]

              [ Stop Try-On ]
```

The core pipeline must be:

```text
CAMERA
   ↓
REALTIME WEBRTC
   ↓
LUCY VTON
   ↓
LIVE AI VIDEO
```

with garment changes handled through:

```text
GARMENT A
   ↓
setImage()

GARMENT B
   ↓
setImage()

GARMENT C
   ↓
setImage()
```

all within the same realtime session.

---

# 31. Final Instruction to the AI Coding Agent

Act as a senior full-stack engineer experienced in:

* WebRTC
* realtime video
* React
* Next.js
* TypeScript
* AI APIs
* computer vision applications

Do not merely create a mock UI.

Build the actual working end-to-end implementation.

Before coding:

1. Inspect the repository.
2. Inspect the installed Decart SDK.
3. Inspect the current SDK TypeScript types.
4. Verify the current realtime API.
5. Verify the current token API.
6. Verify the current `lucy-vton-latest` integration.
7. Then implement.

Prioritize this milestone:

```text
WEBCAM
   ↓
DECART REALTIME
   ↓
LUCY VTON
   ↓
REMOTE VIDEO STREAM
   ↓
BROWSER VIDEO
```

Once that works, implement garment switching and then polish the application.

If an API differs from the examples above, use the current SDK's actual API rather than creating fictional methods or compatibility layers.

The final result must be a **real working realtime AI virtual try-on application**, not a simulated/demo interface.
