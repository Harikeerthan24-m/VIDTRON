# Production-Grade Web App Reliability & Performance Specification

## Objective

Make the Virtual Try-On web application behave like a **real production
software system**, not just a functional frontend.

The goal is:

> **Fast + Reliable + Observable + Failure-tolerant + API-aware +
> User-friendly**

The application must remain usable when:

-   APIs are slow
-   APIs temporarily fail
-   APIs return malformed data
-   API rate limits are reached
-   Network connectivity disappears
-   Network connectivity becomes unstable
-   WebRTC takes time to connect
-   Camera permission is denied
-   Camera devices disappear
-   Uploads fail
-   Users double-click actions
-   Users rapidly switch garments
-   Browser tabs become hidden/backgrounded
-   Sessions expire
-   Backend services are degraded
-   External AI providers are unavailable
-   Requests time out
-   A request succeeds on the backend but the frontend misses the
    response
-   The user refreshes the page during an active session

Do not hide errors.

**Convert technical failures into controlled product states.**

------------------------------------------------------------------------

# 1. Reliability Philosophy

Use this mental model:

``` text
USER ACTION
    ↓
VALIDATE
    ↓
DEDUPE
    ↓
REQUEST
    ↓
TIMEOUT
    ↓
SUCCESS / RETRY / FALLBACK / ERROR
    ↓
RECOVER
    ↓
USER FEEDBACK
```

Every important asynchronous operation should have an explicit
lifecycle.

Never assume:

``` text
request → success
```

Instead design:

``` text
idle
→ validating
→ loading
→ success

OR

idle
→ loading
→ timeout
→ retrying
→ success

OR

idle
→ loading
→ rate limited
→ retry-after
→ retry
→ success

OR

idle
→ loading
→ failure
→ recoverable error
```

------------------------------------------------------------------------

# 2. Define Application States

For every major feature, explicitly model state.

Example:

``` ts
type RequestState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "timeout"
  | "rate_limited"
  | "offline";
```

For realtime try-on:

``` text
IDLE
CONNECTING
CONNECTED
PROCESSING
READY
DEGRADED
RECONNECTING
DISCONNECTED
FAILED
```

For camera:

``` text
UNKNOWN
REQUESTING
GRANTED
DENIED
UNAVAILABLE
INTERRUPTED
READY
```

For uploads:

``` text
IDLE
SELECTING
UPLOADING
PROCESSING
SUCCESS
FAILED
CANCELLED
```

Do not represent all of these states using a single boolean such as:

``` ts
isLoading
```

------------------------------------------------------------------------

# 3. API Reliability Layer

Do not call APIs directly from UI components wherever possible.

Bad:

``` ts
await fetch("/api/try-on");
```

inside a button component.

Prefer:

``` text
UI
 ↓
Feature hook/service
 ↓
API client
 ↓
Request policy
 ↓
fetch
```

Suggested architecture:

``` text
src/
├── api/
│   ├── client.ts
│   ├── errors.ts
│   ├── retry.ts
│   ├── timeout.ts
│   └── request-policy.ts
│
├── features/
│   ├── camera/
│   ├── tryon/
│   ├── garments/
│   └── session/
│
├── hooks/
│   ├── useTryOn.ts
│   ├── useCamera.ts
│   ├── useUpload.ts
│   └── useConnectionStatus.ts
│
└── components/
```

The API client becomes the central reliability boundary.

------------------------------------------------------------------------

# 4. Centralized API Client

Create one consistent API abstraction.

Responsibilities:

-   Base URL
-   Authentication
-   Headers
-   Request IDs
-   Timeout
-   Response parsing
-   Error normalization
-   Retry policy
-   Rate-limit handling
-   Logging
-   Abort handling

Example conceptual interface:

``` ts
api.request({
  method: "POST",
  endpoint: "/try-on",
  body,
  timeoutMs: 15000,
  retryPolicy: "safe"
});
```

Do not duplicate error-handling logic across components.

------------------------------------------------------------------------

# 5. Error Normalization

Different APIs may return different error shapes.

Normalize them into one internal structure.

Example:

``` ts
type AppError = {
  code: string;
  message: string;
  userMessage: string;
  status?: number;
  retryable: boolean;
  retryAfterMs?: number;
  requestId?: string;
};
```

Example:

``` text
Backend:
{
  error: "RATE_LIMITED"
}

Frontend:

{
  code: "RATE_LIMITED",
  message: "Provider rate limit reached",
  userMessage: "Too many requests. Please wait a moment.",
  retryable: true,
  retryAfterMs: 5000
}
```

The UI should not need to understand every backend provider's error
format.

------------------------------------------------------------------------

# 6. HTTP Error Handling

Explicitly handle common classes.

## 400

Bad request.

Frontend should:

-   Validate before sending
-   Show useful field/action feedback
-   Avoid automatic retry

------------------------------------------------------------------------

## 401

Authentication/session issue.

Frontend should:

-   Refresh session if supported
-   Otherwise transition to authenticated-session recovery
-   Never endlessly retry

------------------------------------------------------------------------

## 403

Permission/access issue.

Show a clear explanation.

Do not retry automatically unless the permission can genuinely change.

------------------------------------------------------------------------

## 404

Resource unavailable.

Handle gracefully.

Example:

``` text
This garment is no longer available.
```

Do not show raw API errors.

------------------------------------------------------------------------

## 408

Request timeout.

Retry only if the operation is safe.

------------------------------------------------------------------------

## 409

Conflict.

Example:

``` text
This action is already being processed.
```

Prefer state reconciliation over blindly retrying.

------------------------------------------------------------------------

## 413

Payload too large.

Frontend should validate file/image size before upload.

------------------------------------------------------------------------

## 422

Validation error.

Map server validation errors to the relevant UI.

------------------------------------------------------------------------

## 429

Rate limited.

This is especially important.

See the rate-limit section below.

------------------------------------------------------------------------

## 500

Internal server error.

Show:

``` text
Something went wrong.
Please try again.
```

Allow retry.

------------------------------------------------------------------------

## 502 / 503 / 504

Infrastructure/provider unavailable.

Treat as potentially temporary.

Use controlled retry with exponential backoff.

------------------------------------------------------------------------

# 7. API Timeout Strategy

Never allow requests to hang forever.

Every network request should have a timeout.

Example:

``` text
Fast metadata API:
5–10 seconds

Normal API:
10–15 seconds

AI processing:
20–60 seconds depending on provider

File upload:
Based on file size/network conditions
```

Timeouts should be feature-specific.

Do not use one giant timeout for the entire application.

------------------------------------------------------------------------

# 8. Abort Requests

Cancel requests that are no longer relevant.

Example:

``` text
User selects garment A
        ↓
Request A starts
        ↓
User selects garment B
        ↓
Cancel / supersede A
        ↓
Request B becomes current
```

Use:

``` ts
AbortController
```

Do not allow obsolete requests to overwrite newer UI state.

------------------------------------------------------------------------

# 9. Race Condition Protection

This is critical.

Example:

``` text
User selects:
A → B → C
```

Network:

``` text
C response → arrives first
A response → arrives last
```

Bad behavior:

``` text
UI ends on A
```

Correct behavior:

``` text
Only latest valid request may update current UI state.
```

Use:

-   Request IDs
-   AbortController
-   Sequence numbers
-   Current-operation tokens

Example:

``` ts
const requestId = ++latestRequestId;

const result = await request();

if (requestId !== latestRequestId) {
  return;
}
```

------------------------------------------------------------------------

# 10. Idempotency

For operations that can accidentally execute twice, use idempotency.

Examples:

-   Create session
-   Start AI generation
-   Upload processing job
-   Purchase/payment
-   Save garment
-   Submit form

Send an idempotency key where supported:

``` text
Idempotency-Key: <unique-request-id>
```

This protects against:

``` text
double-click
network retry
browser retry
frontend retry
```

creating duplicate backend operations.

------------------------------------------------------------------------

# 11. Double-Click Protection

Every important action must prevent accidental duplicate execution.

Example:

``` text
[ Apply Look ]
```

After click:

``` text
[ Applying... ]
```

Disable duplicate invocation.

But do not simply disable buttons forever.

Always re-enable them after:

-   Success
-   Failure
-   Timeout
-   Cancellation

------------------------------------------------------------------------

# 12. Retry Strategy

Do not blindly retry every error.

Retry only when:

``` text
Network error
Timeout
429
502
503
504
```

Usually do not retry:

``` text
400
401
403
404
422
```

unless there is a specific recovery path.

------------------------------------------------------------------------

# 13. Exponential Backoff

Use exponential backoff with jitter.

Example:

``` text
Attempt 1:
500ms

Attempt 2:
1s

Attempt 3:
2s

Attempt 4:
4s
```

Add random jitter.

Conceptually:

``` ts
delay =
  min(base * 2 ** attempt, maxDelay)
  + randomJitter;
```

This prevents many clients from retrying simultaneously.

------------------------------------------------------------------------

# 14. Retry Limits

Never retry forever.

Example:

``` text
Maximum automatic retries:
2–3
```

After that:

``` text
Show recoverable error
+
Retry button
```

The user should always remain in control.

------------------------------------------------------------------------

# 15. Rate Limit Handling

Treat HTTP `429` as a first-class state.

Possible response:

``` http
HTTP 429
Retry-After: 5
```

If available, respect:

``` text
Retry-After
```

Do not immediately hammer the API again.

UI:

``` text
✦
We're processing a lot of requests right now.

Trying again in 5s...
```

Countdown can be:

``` text
Retrying in 5...
Retrying in 4...
...
Retrying now
```

But do not create an aggressive countdown if the provider does not give
a reliable retry interval.

------------------------------------------------------------------------

# 16. Rate Limit UX

Never show:

``` text
HTTP 429
Too Many Requests
```

to normal users.

Translate to:

``` text
You're making requests a little faster than the service allows.

Please wait a moment and we'll continue automatically.
```

For a manual retry:

``` text
Try again
```

------------------------------------------------------------------------

# 17. Client-Side Request Throttling

Prevent unnecessary API traffic before it reaches the server.

Use:

-   Debounce
-   Throttle
-   Deduplication
-   Caching
-   Request cancellation

Examples:

Search:

``` text
300–500ms debounce
```

Rapid garment selection:

``` text
Cancel obsolete request
```

Continuous camera processing:

``` text
Do not send a request for every frame
```

------------------------------------------------------------------------

# 18. AI / Realtime Provider Limits

External AI providers may have:

-   Requests/minute limits
-   Concurrent session limits
-   Token limits
-   Connection limits
-   Image size limits
-   Processing limits
-   Cost limits

The frontend should assume these can happen.

Do not design the happy path around unlimited API availability.

------------------------------------------------------------------------

# 19. WebRTC / Realtime Reliability

For realtime connections explicitly model:

``` text
CONNECTING
CONNECTED
DEGRADED
RECONNECTING
DISCONNECTED
FAILED
```

Show appropriate UI.

Example:

``` text
● Live
```

When reconnecting:

``` text
◌ Reconnecting...
```

When degraded:

``` text
△ Connection unstable
```

When disconnected:

``` text
Connection lost

[ Reconnect ]
```

Do not suddenly leave the user staring at a frozen video.

------------------------------------------------------------------------

# 20. Reconnection Strategy

When the realtime connection drops:

``` text
Detect disconnect
        ↓
Pause user actions that depend on connection
        ↓
Attempt controlled reconnect
        ↓
Backoff
        ↓
Restore session if possible
        ↓
Resume
```

Do not reconnect in a tight infinite loop.

Example:

``` text
1st retry: 1s
2nd retry: 2s
3rd retry: 4s
4th retry: 8s
```

Cap the delay.

After several failed attempts:

``` text
Connection couldn't be restored.

[ Try again ]
```

------------------------------------------------------------------------

# 21. Network Connectivity

Listen for:

``` js
window.addEventListener("online", ...)
window.addEventListener("offline", ...)
```

When offline:

``` text
You're offline.

Your current session is paused.
We'll reconnect when the connection returns.
```

When online:

``` text
Back online
```

Then recover relevant services.

Do not automatically replay every old request.

------------------------------------------------------------------------

# 22. Browser Visibility

Handle:

``` text
tab hidden
tab visible
```

When the page is backgrounded:

-   Avoid unnecessary polling
-   Reduce expensive work
-   Pause decorative animations
-   Avoid unnecessary API calls
-   Handle camera/realtime behavior appropriately

When returning:

``` text
Check connection
Check session
Reconcile current state
```

Do not assume the previous connection is still healthy.

------------------------------------------------------------------------

# 23. Camera Reliability

Camera access can fail for many reasons.

Handle:

``` text
Permission denied
No camera
Camera already in use
Browser restriction
HTTPS restriction
Device disconnected
Track ended
Camera interrupted
```

UI should explain the problem.

Example:

``` text
Camera access is blocked.

Please allow camera access in your browser settings,
then try again.

[ Try Again ]
```

Avoid:

``` text
NotAllowedError
```

as the user-facing message.

------------------------------------------------------------------------

# 24. Camera Recovery

If the camera track ends:

``` text
Detect track ended
      ↓
Update camera state
      ↓
Show recovery UI
      ↓
Request camera again
```

Do not crash the application.

------------------------------------------------------------------------

# 25. Upload Reliability

For image uploads:

Validate before network request.

Check:

``` text
File type
File size
Image dimensions
Corrupt image
Unsupported format
```

Example:

``` text
Supported:
JPG
JPEG
PNG
WEBP
```

Set a reasonable maximum file size.

If invalid:

``` text
This image is too large.

Please choose an image under 10MB.
```

Do not upload invalid files only to discover the error from the backend.

------------------------------------------------------------------------

# 26. Upload Progress

For large uploads, show progress.

Example:

``` text
Uploading garment
██████████████░░░░ 72%
```

Do not show fake progress.

If actual upload progress cannot be measured, use a determinate state
only when supported.

------------------------------------------------------------------------

# 27. Upload Cancellation

Allow cancellation when practical:

``` text
Uploading...
[ Cancel ]
```

Cancel using:

``` ts
AbortController
```

Do not leave abandoned requests running.

------------------------------------------------------------------------

# 28. Session Expiration

Sessions can expire.

Detect:

``` text
401
session expiration
WebRTC session timeout
backend session invalidation
```

Do not suddenly break the page.

Show:

``` text
Your session has expired.

Reconnect to continue your try-on session.

[ Reconnect ]
```

If state can be restored, restore it.

------------------------------------------------------------------------

# 29. Graceful Degradation

When optional services fail, keep the core application usable.

Example:

``` text
Analytics unavailable
        ↓
App continues normally
```

Do not allow:

``` text
analytics failure
→ application failure
```

Same principle for:

-   Optional recommendations
-   Non-critical telemetry
-   Secondary images
-   Feature flags
-   Nonessential APIs

------------------------------------------------------------------------

# 30. Error Boundaries

Use React error boundaries around major application sections.

Suggested boundaries:

``` text
App
├── Navigation
├── Onboarding
├── TryOnStage
├── GarmentSelector
└── Secondary UI
```

If the garment selector crashes, do not necessarily crash the entire
application.

Show:

``` text
Something went wrong with this section.

[ Retry ]
```

------------------------------------------------------------------------

# 31. Global Error Boundary

At the application level:

``` text
Something unexpected happened.

Your session may still be recoverable.

[ Try again ]
```

Do not expose stack traces.

Log technical details internally.

------------------------------------------------------------------------

# 32. Error Message Design

Separate:

``` text
Developer error
```

from:

``` text
User error
```

Example internal:

``` text
TypeError:
Cannot read properties of undefined
```

User-facing:

``` text
We couldn't load this part of the experience.

[ Try again ]
```

Errors should answer:

1.  What happened?
2.  Can the user recover?
3.  What should they do?

------------------------------------------------------------------------

# 33. Observability

A production app needs visibility into failures.

Track:

``` text
Request duration
Request success rate
Request error rate
Timeout rate
429 rate
5xx rate
WebRTC connection success
WebRTC reconnect rate
Camera permission success
Camera failure rate
Upload success
Upload failure
Try-on generation latency
Session duration
```

Do not log sensitive personal data.

------------------------------------------------------------------------

# 34. Request Correlation

Every important request should have a request ID.

Example:

``` text
x-request-id: 7f31...
```

When an error occurs:

``` text
Something went wrong.

Reference: 7F31A2
```

The user normally doesn't need this, but support/debugging can use it.

------------------------------------------------------------------------

# 35. Logging

Use structured logs.

Example:

``` ts
logger.error({
  event: "tryon_request_failed",
  requestId,
  status,
  durationMs,
  errorCode,
});
```

Avoid:

``` ts
console.log("something failed");
```

for production-critical flows.

Do not log:

-   Camera frames
-   Raw images
-   Access tokens
-   Secrets
-   Personal data
-   Sensitive API responses

------------------------------------------------------------------------

# 36. Performance Budget

Set explicit targets.

Suggested initial targets:

``` text
Initial page render:
< 2s on good connection

Largest Contentful Paint:
< 2.5s

Cumulative Layout Shift:
< 0.1

Interaction responsiveness:
< 200ms for normal UI actions

JS bundle:
Keep as small as practical

Primary hero:
Load immediately

Non-critical assets:
Lazy load
```

These are targets, not guarantees; measure real users.

------------------------------------------------------------------------

# 37. Bundle Optimization

Audit dependencies.

Avoid importing huge libraries for tiny features.

Prefer:

``` ts
import { Camera } from "lucide-react";
```

rather than importing unnecessary icon collections.

Use:

-   Code splitting
-   Dynamic imports
-   Tree shaking
-   Lazy loading
-   Route-level splitting

Do not optimize blindly.

Measure first.

------------------------------------------------------------------------

# 38. Image Optimization

For all images:

``` text
Correct dimensions
WebP / AVIF
Compression
Responsive srcset
Lazy loading where appropriate
```

Do not load:

``` text
4000 × 4000 image
```

when the UI displays:

``` text
300 × 300
```

Generate appropriate thumbnails.

------------------------------------------------------------------------

# 39. Video Optimization

The realtime video path should remain efficient.

Avoid:

-   Copying video frames unnecessarily
-   Converting frames to base64 repeatedly
-   Rendering video through React state
-   Excessive canvas processing
-   Unnecessary video element recreation

Prefer:

``` text
MediaStream
↓
video element
```

with minimal intermediary work.

------------------------------------------------------------------------

# 40. React Performance

Avoid state updates on every animation/video frame.

Bad:

``` ts
setState(videoFrame)
```

for every frame.

Prefer:

-   Refs
-   Direct DOM/video APIs
-   WebRTC APIs
-   requestAnimationFrame only when needed
-   Memoized components

Use React state for actual UI state, not high-frequency media data.

------------------------------------------------------------------------

# 41. Caching

Cache data that does not change frequently.

Examples:

-   Garment metadata
-   Static configuration
-   Feature configuration
-   User preferences

Do not blindly cache:

-   Realtime session state
-   Sensitive temporary data
-   Highly dynamic AI output

Use appropriate cache invalidation.

------------------------------------------------------------------------

# 42. Request Deduplication

If the same request is already running:

``` text
Request A
Request A again
```

Do not necessarily send two network calls.

Share the existing promise/result where appropriate.

This is especially useful for:

-   Configuration
-   User profile
-   Garment metadata
-   Session initialization

------------------------------------------------------------------------

# 43. Optimistic UI

Use optimistic UI only where safe.

Good:

``` text
Selecting a garment
```

Potentially bad:

``` text
AI result generated
```

Do not show fake success for operations where the backend must confirm
the result.

------------------------------------------------------------------------

# 44. Stale Data Protection

When using cached data:

``` text
CACHE
 ↓
SHOW QUICKLY
 ↓
REFRESH IN BACKGROUND
 ↓
RECONCILE
```

But ensure stale data cannot overwrite newer data.

Use timestamps/version IDs where needed.

------------------------------------------------------------------------

# 45. Frontend Security

Never expose:

``` text
API secrets
private provider keys
service credentials
```

in frontend code.

Anything shipped to the browser should be treated as public.

Use backend-controlled credentials/proxies where secrets are required.

------------------------------------------------------------------------

# 46. Input Validation

Validate user-controlled inputs.

Examples:

-   File type
-   File size
-   URLs
-   Text length
-   IDs
-   Query parameters

Do not rely only on frontend validation.

Backend validation remains mandatory.

Frontend validation exists for:

``` text
UX
+
early feedback
```

------------------------------------------------------------------------

# 47. API Response Validation

Do not assume backend responses are correct.

Validate important responses.

For example, use a schema validator such as:

``` text
Zod
```

Conceptually:

``` ts
const result = TryOnResponseSchema.safeParse(data);
```

If invalid:

``` text
Treat as controlled failure.
Log internally.
Do not crash the UI.
```

------------------------------------------------------------------------

# 48. Feature Flags

Potentially risky features should be controllable.

Examples:

``` text
NEW_TRYON_PIPELINE
NEW_GARMENT_SELECTOR
EXPERIMENTAL_REALTIME_MODE
```

If a feature causes problems:

``` text
Disable feature
↓
Fallback to stable behavior
```

This allows safer releases.

------------------------------------------------------------------------

# 49. Health / Readiness Checks

If the application depends on multiple backend services, know their
state.

Example:

``` text
Frontend
   ↓
Backend API
   ↓
AI Provider
   ↓
Realtime Service
```

Do not assume all are healthy because the frontend loaded.

Where appropriate, expose backend health/readiness checks.

------------------------------------------------------------------------

# 50. Dependency Failure Isolation

Example:

``` text
Analytics ❌
     ↓
Try-on remains functional

Recommendations ❌
     ↓
Try-on remains functional

AI Provider ❌
     ↓
Try-on shows controlled unavailable state
```

Separate critical and non-critical dependencies.

------------------------------------------------------------------------

# 51. Frontend Recovery Pipeline

Every important failure should follow:

``` text
DETECT
  ↓
CLASSIFY
  ↓
RECOVER IF SAFE
  ↓
RETRY IF APPROPRIATE
  ↓
FALLBACK
  ↓
SHOW USER-FRIENDLY ERROR
  ↓
LOG
  ↓
ALLOW MANUAL RECOVERY
```

------------------------------------------------------------------------

# 52. Do Not Create Retry Storms

Never do:

``` text
API fails
↓
retry immediately
↓
fails
↓
retry immediately
↓
fails
↓
retry forever
```

Instead:

``` text
failure
↓
backoff
↓
limited retry
↓
stop
↓
user recovery
```

------------------------------------------------------------------------

# 53. Offline / Poor Network UX

On poor connections:

``` text
Connection unstable
```

Do not immediately tell the user:

``` text
Something went wrong
```

Distinguish:

``` text
Offline
Slow
Timeout
Server error
Rate limited
Session expired
Permission denied
```

Different problems deserve different recovery paths.

------------------------------------------------------------------------

# 54. User-Friendly Error Copy

Create a centralized error-message map.

Example:

``` ts
const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "We couldn't reach the service. Check your connection and try again.",

  TIMEOUT:
    "The request took too long. Please try again.",

  RATE_LIMITED:
    "We're handling a lot of requests right now. Please wait a moment.",

  CAMERA_DENIED:
    "Camera access is blocked. Allow camera access and try again.",

  SESSION_EXPIRED:
    "Your session expired. Reconnect to continue.",

  SERVER_ERROR:
    "Something went wrong on our side. Please try again."
};
```

Do not expose technical error strings directly.

------------------------------------------------------------------------

# 55. Loading State Rules

Every asynchronous action should have an appropriate loading state.

Bad:

``` text
Nothing changes for 5 seconds.
```

Better:

``` text
Applying your look...
```

or:

``` text
Connecting...
```

or:

``` text
Uploading garment...
```

Loading state should explain what is happening.

------------------------------------------------------------------------

# 56. Avoid Fake Loading

Do not add artificial delays just to make the UI look animated.

If an API responds in:

``` text
200ms
```

let it respond naturally.

Animation should smooth transitions, not intentionally slow the
application.

------------------------------------------------------------------------

# 57. Skeletons

Use skeleton loading where the structure is known.

Good for:

-   Garment gallery
-   Metadata
-   User information

Not necessary for:

-   Instant buttons
-   Very fast operations
-   Realtime video

Do not skeleton everything.

------------------------------------------------------------------------

# 58. Frontend State Machine

For the main try-on flow, consider a state machine.

Example:

``` text
             ┌──────────────┐
             │   IDLE       │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │ CONNECTING   │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │ CONNECTED    │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │    READY     │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │  PROCESSING  │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │    READY     │
             └──────────────┘

Failure:
ANY STATE
    ↓
DEGRADED
    ↓
RECOVER / RETRY
    ↓
READY
```

This is more reliable than scattered booleans.

------------------------------------------------------------------------

# 59. Critical User Journeys To Test

Test these manually and automatically.

## Camera

``` text
Allow
Deny
No camera
Camera already in use
Camera disconnected
Browser permission revoked
```

## Network

``` text
Normal
Slow
Offline
Online again
Request timeout
```

## API

``` text
200
400
401
403
404
408
409
413
422
429
500
502
503
504
Malformed JSON
Empty response
```

## Realtime

``` text
Connect
Slow connect
Disconnect
Reconnect
Repeated disconnect
Provider unavailable
```

## Upload

``` text
Valid image
Large image
Invalid format
Corrupt image
Upload timeout
Upload failure
Cancel upload
Retry upload
```

## User interaction

``` text
Double click
Rapid clicks
Rapid garment switching
Refresh during processing
Close tab during processing
Return to tab
Mobile rotation
Network switching
```

------------------------------------------------------------------------

# 60. Production Monitoring Dashboard

Monitor at least:

``` text
Frontend error rate
API error rate
API latency p50
API latency p95
API latency p99
429 rate
5xx rate
Timeout rate
Camera permission success rate
Camera failure rate
Realtime connection success rate
Realtime reconnect rate
Upload failure rate
Try-on success rate
Try-on processing latency
Session abandonment
```

The important principle:

> Do not optimize what you cannot measure.

------------------------------------------------------------------------

# 61. Core Performance Metrics

Track:

``` text
TTFB
FCP
LCP
CLS
INP
JS bundle size
Initial page size
Image transfer size
API latency
AI processing latency
WebRTC connection time
```

Separate:

``` text
Frontend latency
Backend latency
External provider latency
```

Otherwise a slow API may look like a slow frontend.

------------------------------------------------------------------------

# 62. Performance Instrumentation

For each important operation measure:

``` text
start
↓
request sent
↓
first response
↓
response complete
↓
UI updated
```

Example:

``` text
tryOnStart
tryOnRequestSent
tryOnResponseReceived
tryOnRendered
```

This lets you determine where the actual bottleneck is.

------------------------------------------------------------------------

# 63. Release Safety

Before production deployment:

``` text
Build
↓
Lint
↓
Typecheck
↓
Unit tests
↓
Integration tests
↓
E2E tests
↓
Performance check
↓
Security check
↓
Deploy
↓
Monitor
```

Do not deploy solely because:

``` text
npm run build
```

passes.

------------------------------------------------------------------------

# 64. Regression Protection

Every production bug that is fixed should ideally result in:

``` text
Bug
↓
Root cause
↓
Fix
↓
Regression test
```

Examples:

``` text
Camera callback undefined
→ test camera permission flow

429 retry storm
→ test rate-limit handling

Garment race condition
→ test A → B → C selection

WebRTC reconnect failure
→ test disconnect/reconnect
```

------------------------------------------------------------------------

# 65. Final Reliability Architecture

The target architecture should resemble:

``` text
                    USER
                     ↓
                  UI / UX
                     ↓
              Feature State
                     ↓
             Reliability Layer
                     ↓
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
    API Client    WebRTC        Upload
       ↓             ↓             ↓
   Timeout       Reconnect      Progress
   Retry         Backoff        Cancel
   Abort         Recovery       Retry
       ↓             ↓             ↓
       └─────────────┼─────────────┘
                     ↓
                Backend/API
                     ↓
              External Services
                     ↓
                Observability
```

------------------------------------------------------------------------

# 66. Golden Rule

A production-quality frontend should never think:

> "The API will probably work."

It should think:

> "The API may succeed, fail, timeout, rate-limit, disconnect, return
> unexpected data, or disappear --- and I already know what the product
> should do in each case."

That is the difference between a **demo** and **real software**.

------------------------------------------------------------------------

# 67. Implementation Order

Implement in this order.

## Phase 1 --- Foundation

-   Central API client
-   Error normalization
-   Timeout system
-   AbortController
-   Request IDs
-   Logging
-   Designated error states

## Phase 2 --- Request Safety

-   Retry policy
-   Exponential backoff
-   Jitter
-   429 handling
-   Request deduplication
-   Race-condition protection
-   Idempotency where needed

## Phase 3 --- Realtime

-   WebRTC state machine
-   Connection timeout
-   Reconnection
-   Backoff
-   Network awareness
-   Session recovery

## Phase 4 --- Camera

-   Permission states
-   Camera errors
-   Track-ended detection
-   Recovery
-   Device changes

## Phase 5 --- Upload

-   File validation
-   Size validation
-   Upload progress
-   Abort
-   Retry
-   Error recovery

## Phase 6 --- Performance

-   Bundle analysis
-   Code splitting
-   Image optimization
-   React render profiling
-   WebRTC/video optimization
-   API latency instrumentation

## Phase 7 --- Observability

-   Error tracking
-   Request correlation
-   Performance metrics
-   API health metrics
-   Realtime metrics

## Phase 8 --- Testing

-   API failure matrix
-   Network failure testing
-   Realtime failure testing
-   Camera failure testing
-   Upload failure testing
-   Race-condition testing
-   Mobile testing
-   Accessibility testing

------------------------------------------------------------------------

# 68. Final Quality Bar

The application should behave correctly even when the environment
behaves incorrectly.

The user should rarely see:

``` text
Error
Failed
Exception
500
429
TimeoutError
NetworkError
```

Instead they should see useful product states:

``` text
Connecting...
Applying your look...
Connection unstable...
Trying again...
Camera access is blocked...
This image is too large...
Your session expired...
Something went wrong. Try again.
```

The technical complexity should be absorbed by the software
architecture.

The user should experience:

``` text
FAST
+
CLEAR
+
RECOVERABLE
+
TRUSTWORTHY
```

That is the production reliability target.
