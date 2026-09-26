# Premium Real-Time AI Virtual Try-On --- UI/UX Design Specification

## 1. Design Objective

Redesign the current Virtual Try-On application into a premium,
production-quality AI fashion experience.

The product should communicate:

> **Premium Fashion × AI × Realtime Technology**

It should feel like a serious consumer product, not a developer demo.

### Desired qualities

-   Premium
-   Elegant
-   Calm
-   Futuristic
-   Fashion-oriented
-   Visual
-   Trustworthy
-   Fast
-   Sophisticated
-   Minimal

Avoid the visual language of:

-   Generic SaaS dashboards
-   Developer tools
-   Gaming interfaces
-   Cryptocurrency products
-   Neon cyberpunk
-   Generic Tailwind templates
-   Over-designed "AI" landing pages

------------------------------------------------------------------------

# 2. Core Design Principle

The **camera / AI output is the hero**.

Everything else should support it.

Primary hierarchy:

``` text
USER
  ↓
AI TRY-ON OUTPUT
  ↓
GARMENT SELECTION
  ↓
CONTROLS
  ↓
SECONDARY INFORMATION
```

Do not allow navigation, buttons, decorative effects, or secondary cards
to compete with the video.

------------------------------------------------------------------------

# 3. Visual Direction

Think:

``` text
Luxury fashion
      +
Modern AI
      +
Minimal technology
      +
Editorial photography
      +
Realtime interaction
```

The visual language should be closer to a premium fashion-tech product
than a technical AI dashboard.

Use restraint.

The application should feel expensive because of:

``` text
Typography
+
Spacing
+
Imagery
+
Hierarchy
+
Motion
+
Micro-interactions
```

Not because of excessive gradients, glow, or animation.

------------------------------------------------------------------------

# 4. Color System

Use a neutral-first palette.

## Core Colors

``` text
Background
#08080B

Elevated background
#0E0E13

Card
#131319

Card hover
#18181F

Primary text
#F5F3F7

Secondary text
#A7A3AF

Muted text
#716D79

Border
rgba(255,255,255,0.08)

Primary accent
#8B5CF6

Accent light
#A78BFA

Accent subtle
rgba(139,92,246,0.12)

Success
#34D399

Warning
#FBBF24

Error
#FB7185
```

## Color rule

Purple is an **accent**, not the dominant visual language.

Do not make the entire interface purple.

Avoid:

``` text
purple gradient everywhere
purple cards
purple borders everywhere
purple glow around every element
```

Use subtle lighting instead.

Example:

``` css
background:
  radial-gradient(
    circle at 50% 20%,
    rgba(139, 92, 246, 0.08),
    transparent 40%
  ),
  #08080B;
```

The effect should be barely noticeable.

------------------------------------------------------------------------

# 5. Typography

Use one premium modern font family.

Preferred:

-   Inter
-   Geist

Do not mix multiple decorative fonts.

## Typography scale

``` text
Hero:
48–64px
font-weight: 600
letter-spacing: -0.04em

Section heading:
24–32px
font-weight: 600

Card heading:
16–18px
font-weight: 600

Body:
14–16px
font-weight: 400

Metadata:
12–13px
font-weight: 500
```

Do not solve hierarchy by making everything bold.

Premium typography relies on:

-   scale
-   spacing
-   contrast
-   alignment
-   restraint

------------------------------------------------------------------------

# 6. Navigation

Replace the basic:

``` text
❤️ Virtual Try-On
```

with a refined minimal navigation.

Example:

``` text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ◇  Virtual Try-On                         How it works     │
│                                           [Get Started]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Navigation characteristics

-   56--64px height
-   Sticky if appropriate
-   Transparent or subtly elevated background
-   Backdrop blur
-   Subtle bottom border
-   Minimal controls

Logo:

-   Small geometric mark
-   Monochrome/white
-   Accent interaction state only

Do not make the navigation visually heavy.

------------------------------------------------------------------------

# 7. Camera Permission Screen

The current structure:

``` text
Camera icon
↓
Heading
↓
Description
↓
Enable Camera
```

is functional but generic.

Transform it into a premium onboarding moment.

## Recommended composition

``` text
                    ✦

              Virtual Try-On

       See yourself in any look,
             in real time.

      Your camera powers the
       realtime AI experience.

          [ Enable Camera ]

       No recording · No storage
```

Keep the text concise.

The user should understand the purpose within approximately two seconds.

------------------------------------------------------------------------

# 8. Permission Hero Visual

Replace the generic large camera icon with a more sophisticated visual.

Choose one of two directions.

## Option A --- Camera Lens

Create a subtle circular lens composition:

-   thin rings
-   soft accent glow
-   subtle scanning line
-   tiny particles
-   slow orbital movement

The animation must be restrained.

## Option B --- Editorial Fashion Image

Use a premium fashion silhouette/product image.

Image characteristics:

-   Editorial
-   Minimal
-   Muted
-   High contrast
-   Non-distracting
-   Fashion-oriented

Avoid cheap stock-photo aesthetics.

Optimize images using:

-   AVIF
-   WebP
-   Responsive sizes
-   Correct aspect ratios
-   Lazy loading where appropriate
-   No layout shift

Do not use a large image if it distracts from the CTA.

------------------------------------------------------------------------

# 9. Hero Motion

Motion should feel premium.

Avoid:

``` text
bounce
shake
spin
large zooms
constant movement
```

Prefer:

``` text
fade
scale 0.98 → 1
blur → clear
opacity 0 → 1
subtle glow
slow orbital movement
```

Example entrance:

``` css
opacity: 0 → 1;
transform: translateY(12px) scale(0.98);
duration: 500–700ms;
easing: cubic-bezier(0.22, 1, 0.36, 1);
```

## Staggered entrance

``` text
Logo        0ms
Heading     100ms
Description 180ms
CTA         260ms
Trust text  320ms
```

Motion should guide attention, not demand attention.

------------------------------------------------------------------------

# 10. Primary CTA

The main CTA should be unmistakable.

``` text
┌─────────────────────────────┐
│                             │
│       Enable Camera   →     │
│                             │
└─────────────────────────────┘
```

Characteristics:

-   48--52px height
-   12--14px radius
-   Medium font weight
-   Solid accent or subtle gradient
-   Soft shadow
-   Strong hover state
-   Strong keyboard focus state

Do not use pill-shaped buttons everywhere.

Use rounded rectangles for primary actions.

------------------------------------------------------------------------

# 11. Button Interaction

### Default

``` text
opacity: 1
```

### Hover

``` text
translateY(-1px)
brightness(+5%)
```

### Active

``` text
scale(0.98)
```

### Focus

``` text
subtle accent focus ring
```

### Transition

``` text
150–200ms
```

Do not bounce buttons.

------------------------------------------------------------------------

# 12. Trust / Privacy Microcopy

Under the CTA:

``` text
Camera permission required
No recording · No storage
```

Use:

``` text
12–13px
muted text
```

Keep it subtle.

The purpose is reassurance, not another content block.

------------------------------------------------------------------------

# 13. Main Try-On Workspace

After camera permission, transition to a completely different
application workspace.

Do not keep the onboarding layout.

Suggested architecture:

``` text
┌──────────────────────────────────────────────────────────────┐
│ LOGO                                      SESSION / SETTINGS │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                  ┌──────────────────────┐                    │
│                  │                      │                    │
│                  │                      │                    │
│                  │    AI TRY-ON VIDEO   │                    │
│                  │                      │                    │
│                  │                      │                    │
│                  └──────────────────────┘                    │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  CHOOSE YOUR LOOK                                             │
│                                                              │
│  + Upload     [ garment ] [ garment ] [ garment ] [ garment ]│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The video must dominate the screen.

------------------------------------------------------------------------

# 14. Video Stage

Do not put the video inside a generic dashboard card.

Create a premium visual stage.

Recommended:

``` text
aspect-ratio: 4 / 5
```

Adapt dynamically to the incoming video when necessary.

Container:

``` text
border-radius: 24px
overflow: hidden
background: #0E0E13
```

Use a subtle shadow.

Avoid decorative borders and excessive glow.

------------------------------------------------------------------------

# 15. Camera Preview

Show the original camera feed as a floating preview.

``` text
┌───────────────────────────────┐
│                               │
│          AI OUTPUT            │
│                               │
│                               │
│                    ┌────────┐ │
│                    │ CAMERA │ │
│                    │        │ │
│                    └────────┘ │
└───────────────────────────────┘
```

Camera preview:

-   12px radius
-   Subtle border
-   Soft shadow
-   Optional minimize/hide
-   Smooth transitions
-   Touch-friendly controls

The original camera should remain secondary to the AI output.

------------------------------------------------------------------------

# 16. Realtime Status

Add a small status indicator.

Examples:

``` text
● AI LIVE
```

``` text
◌ Connecting...
```

``` text
✦ Applying look...
```

``` text
● Ready
```

Use a tiny animated indicator.

Do not make the status flashy.

Example:

``` text
● AI LIVE
```

with a subtle pulse.

------------------------------------------------------------------------

# 17. Garment Selection

The garment system should feel like a fashion selector, not a developer
file uploader.

Heading:

``` text
Choose your look
```

Gallery:

``` text
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│        │ │        │ │        │ │        │
│ shirt  │ │ jacket │ │ hoodie │ │ dress  │
│        │ │        │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘
```

Cards should support:

-   Image
-   Selected state
-   Hover state
-   Keyboard focus
-   Smooth transition
-   Optional category metadata

Do not use huge labels.

------------------------------------------------------------------------

# 18. Garment Card Design

Normal:

``` text
border: 1px solid rgba(255,255,255,0.08)
background: #131319
```

Hover:

``` text
background: #18181F
transform: translateY(-2px)
```

Selected:

``` text
border: 1px solid #8B5CF6
box-shadow: 0 0 0 1px #8B5CF6
```

Keep selection visually obvious without becoming neon.

------------------------------------------------------------------------

# 19. Upload Garment

Do not use a huge upload box.

Prefer:

``` text
＋ Upload garment
```

or:

``` text
[ + ] Add garment
```

Clicking opens the file picker.

After upload:

``` text
Upload
↓
Preview
↓
Automatically add to gallery
```

This keeps the interface compact.

------------------------------------------------------------------------

# 20. Garment Gallery Motion

When a garment is added:

``` text
opacity: 0
scale: 0.96
```

Then:

``` text
opacity: 1
scale: 1
```

Duration:

``` text
250–350ms
```

Selected state should animate through:

-   border
-   shadow
-   subtle scale if appropriate

Avoid dramatic animations.

------------------------------------------------------------------------

# 21. Applying Garment State

Do not replace the entire screen with a spinner.

Keep the existing AI video visible.

Overlay:

``` text
┌──────────────────────────┐
│                          │
│                          │
│       ✦ Applying         │
│         look...          │
│                          │
└──────────────────────────┘
```

Use:

-   Backdrop blur
-   Low-opacity dark overlay
-   Small sparkle/spinner
-   Subtle animated shimmer

The existing result should remain visible underneath.

------------------------------------------------------------------------

# 22. AI Loading Animation

Avoid generic circular spinners.

Use a premium AI processing indicator:

``` text
✦
Applying your look
```

Animate subtly using:

-   opacity
-   blur
-   translateX
-   shimmer

Do not create a giant spinner.

------------------------------------------------------------------------

# 23. Empty State

Before selecting a garment:

``` text
┌─────────────────────────────────────┐
│                                     │
│             Your look               │
│                                     │
│       Choose a garment below        │
│       to start your try-on.         │
│                                     │
└─────────────────────────────────────┘
```

Keep the empty state visually quiet.

It should explain the next action without overwhelming the video stage.

------------------------------------------------------------------------

# 24. Icon System

Do not use random emojis as UI icons.

Do not mix:

-   Font Awesome
-   Material Icons
-   Random SVGs
-   Emoji icons

Use one consistent icon library.

Recommended:

**Lucide**

Potential icons:

-   Camera
-   Upload
-   Plus
-   X
-   Settings
-   ChevronRight
-   Sparkles
-   RotateCcw
-   Maximize
-   Minimize
-   CircleStop
-   Info

Recommended sizes:

``` text
16px
18px
20px
```

depending on hierarchy.

Stroke width:

``` text
1.5–2
```

------------------------------------------------------------------------

# 25. Icon Design Principle

Icons support the interface.

They should not dominate it.

Avoid:

``` text
BIG CAMERA ICON
```

Prefer:

``` text
small refined icon
+
strong typography
+
visual composition
```

Keep the icon language consistent.

------------------------------------------------------------------------

# 26. Motion Design System

Create reusable motion tokens.

``` text
Fast:
150ms

Normal:
200–250ms

Emphasis:
350ms

Entrance:
500–700ms
```

Primary easing:

``` css
cubic-bezier(0.22, 1, 0.36, 1)
```

Use motion for:

-   Page entrance
-   Button interactions
-   Garment selection
-   Garment switching
-   Modal transitions
-   Camera preview
-   Status changes
-   Upload completion

Respect:

``` css
@media (prefers-reduced-motion: reduce)
```

When reduced motion is enabled:

-   Disable decorative motion
-   Keep only essential transitions
-   Avoid continuous animations

------------------------------------------------------------------------

# 27. Glass / Backdrop Effects

Use glass effects carefully.

Good:

``` css
background: rgba(14,14,19,0.75);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.08);
```

Use mainly for:

-   Floating controls
-   Camera preview
-   Status badges
-   Processing overlays

Do not use glassmorphism for every element.

------------------------------------------------------------------------

# 28. Background

Use:

``` text
#08080B
```

with subtle depth.

Example:

``` css
background:
  radial-gradient(
    circle at 50% 25%,
    rgba(139, 92, 246, 0.08),
    transparent 40%
  ),
  #08080B;
```

The gradient should be almost imperceptible.

Do not make the application look like a gaming interface.

------------------------------------------------------------------------

# 29. Fashion Visual Language

Use:

-   Large imagery
-   White space
-   Clean typography
-   Strong cropping
-   Neutral backgrounds
-   Subtle borders
-   Editorial composition

Avoid:

-   Excessive gradients
-   Excessive glow
-   Excessive shadows
-   Neon
-   Clutter
-   Too many cards

Mental model:

``` text
Fashion editorial
        +
AI laboratory
```

Not:

``` text
Gaming dashboard
```

------------------------------------------------------------------------

# 30. Responsive Design

## Desktop

``` text
Video = primary
Controls = secondary
```

## Tablet

``` text
Video
↓
Garments
```

## Mobile

``` text
┌──────────────────────┐
│                      │
│       AI VIDEO       │
│                      │
├──────────────────────┤
│ Choose your look     │
│                      │
│ ← garment carousel → │
│                      │
│ + Upload             │
└──────────────────────┘
```

Garments should become horizontally scrollable on mobile.

Touch targets must be at least:

``` text
44 × 44px
```

Do not create tiny controls.

------------------------------------------------------------------------

# 31. Accessibility

Implement:

-   Semantic HTML
-   Keyboard navigation
-   Visible focus states
-   `aria-label` for icon-only buttons
-   Sufficient contrast
-   Accessible file input
-   Accessible realtime status announcements
-   Reduced-motion support

Aesthetic quality must not compromise accessibility.

------------------------------------------------------------------------

# 32. Performance

The UI must remain fast.

Avoid animating expensive layout properties:

``` text
width
height
top
left
```

Prefer:

``` text
transform
opacity
```

Use GPU-friendly animation.

Optimize images with:

-   AVIF
-   WebP
-   Responsive sizes
-   Correct dimensions
-   Lazy loading where appropriate

Do not lazy-load the primary hero visual if it is required immediately.

Do not trigger React state updates on every video frame.

The realtime video stream should remain outside React's high-frequency
rendering path.

------------------------------------------------------------------------

# 33. Component Architecture

Refactor the UI into reusable components.

Suggested structure:

``` text
components/
│
├── layout/
│   ├── AppShell
│   └── Navbar
│
├── onboarding/
│   ├── CameraPermission
│   └── PermissionHero
│
├── tryon/
│   ├── TryOnStage
│   ├── AIOutput
│   ├── CameraPreview
│   ├── RealtimeStatus
│   ├── ProcessingOverlay
│   └── SessionControls
│
├── garments/
│   ├── GarmentSelector
│   ├── GarmentCard
│   ├── GarmentCarousel
│   └── GarmentUploader
│
└── ui/
    ├── Button
    ├── IconButton
    ├── Badge
    ├── Modal
    └── Tooltip
```

Do not put the entire application into one giant component.

------------------------------------------------------------------------

# 34. Design Tokens

Centralize all design values.

Example:

``` css
:root {
  --bg-primary: #08080B;
  --bg-secondary: #0E0E13;
  --bg-card: #131319;

  --text-primary: #F5F3F7;
  --text-secondary: #A7A3AF;
  --text-muted: #716D79;

  --border-subtle: rgba(255,255,255,0.08);

  --accent: #8B5CF6;
  --accent-light: #A78BFA;
  --accent-soft: rgba(139,92,246,0.12);

  --success: #34D399;
  --warning: #FBBF24;
  --error: #FB7185;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --motion-fast: 150ms;
  --motion-normal: 220ms;
  --motion-slow: 500ms;
}
```

Do not scatter arbitrary colors throughout the codebase.

------------------------------------------------------------------------

# 35. Screen-by-Screen UX Flow

## Screen 1 --- Landing / Permission

``` text
              ✦

        Virtual Try-On

   See yourself in any look,
         in real time.

     [ Enable Camera ]

   Camera permission required
   No recording · No storage
```

Goal:

**Get the user into the experience quickly.**

------------------------------------------------------------------------

## Screen 2 --- Camera Initializing

``` text
        Camera access

       Connecting...
```

Use subtle motion.

Do not show a giant spinner.

------------------------------------------------------------------------

## Screen 3 --- AI Connecting

``` text
       ✦

  Connecting to AI...
```

Then transition smoothly into the fitting room.

------------------------------------------------------------------------

## Screen 4 --- Try-On Ready

``` text
┌─────────────────────────────────┐
│                                 │
│          AI TRY-ON              │
│                                 │
│         LIVE VIDEO              │
│                                 │
│                         ┌─────┐ │
│                         │ CAM │ │
│                         └─────┘ │
└─────────────────────────────────┘

● AI LIVE

Choose your look

[ + Upload ]

[ garment ] [ garment ] [ garment ]
```

------------------------------------------------------------------------

## Screen 5 --- Applying Garment

Keep video visible.

``` text
┌─────────────────────────────────┐
│                                 │
│         Current AI video         │
│                                 │
│        ✦ Applying look...        │
│                                 │
└─────────────────────────────────┘
```

------------------------------------------------------------------------

## Screen 6 --- Garment Applied

Remove the overlay smoothly.

Update the selected garment state.

Do not reload the page.

Do not reconnect the camera.

------------------------------------------------------------------------

# 36. Before vs Target

## Current

``` text
Dark background
      ↓
Camera icon
      ↓
Text
      ↓
Button
```

## Target

``` text
Subtle visual atmosphere
        ↓
Premium hero composition
        ↓
Strong headline
        ↓
Short value proposition
        ↓
One primary CTA
        ↓
Tiny trust signal
```

After camera permission:

``` text
REALTIME STAGE
      ↓
AI VIDEO HERO
      ↓
Realtime status
      ↓
Garment system
      ↓
Upload + selection
```

------------------------------------------------------------------------

# 37. What NOT To Do

Absolutely avoid:

-   Huge gradients
-   Neon purple everywhere
-   Excessive glow
-   Emoji UI icons
-   Giant camera icon
-   Generic loading spinner
-   Excessive glassmorphism
-   Excessive rounded cards
-   Every element inside a card
-   Random animations
-   Huge text everywhere
-   Tiny mobile controls
-   Low-quality stock imagery
-   Multiple font families
-   Multiple icon libraries
-   Unnecessary shadows
-   Excessive borders
-   Dashboard-style UI

------------------------------------------------------------------------

# 38. Design Quality Checklist

Before finalizing, inspect every screen.

## Typography

-   Is hierarchy intentional?
-   Are headings too heavy?
-   Is there enough whitespace?

## Color

-   Is purple being overused?
-   Is the interface primarily neutral?
-   Is contrast sufficient?

## Spacing

-   Are elements breathing?
-   Are cards too crowded?
-   Are sections aligned?

## Motion

-   Does motion communicate state?
-   Is anything unnecessarily animated?
-   Does everything feel smooth?

## Icons

-   Are all icons from one family?
-   Are sizes consistent?
-   Are stroke weights consistent?

## Imagery

-   Does imagery feel premium?
-   Is it relevant?
-   Is it optimized?

## UX

-   Does the user know what to do within two seconds?
-   Is the primary action obvious?
-   Is the current state obvious?

------------------------------------------------------------------------

# 39. Core Design Philosophy

Do not try to make the application look futuristic by adding visual
effects.

Make it feel premium through:

``` text
GOOD TYPOGRAPHY
       +
GOOD SPACING
       +
GOOD IMAGERY
       +
GOOD MOTION
       +
GOOD HIERARCHY
       +
GOOD MICRO-INTERACTIONS
```

Use approximately:

``` text
10% decoration
90% hierarchy + usability + visual polish
```

------------------------------------------------------------------------

# 40. Final Quality Bar

When someone opens the application, their first impression should be:

> "This looks like a premium AI fashion product."

Not:

> "This looks like a developer demo."

The final experience should feel:

``` text
quiet
premium
visual
fast
intelligent
fashion-oriented
```

The most important UX shift is:

> **Do not design a camera-permission page. Design a digital fitting
> room.**

The permission screen is simply the doorway into that experience.
