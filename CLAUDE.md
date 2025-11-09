# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Progressive Web App (PWA)** magnifier built with Next.js (Pages Router). It provides a fullscreen camera view with hardware-accelerated zoom and flashlight/torch control, designed for GitHub Pages deployment.

## Development Commands

```bash
# Start development server (PWA features disabled in dev mode)
npm run dev

# Build for production (static export for GitHub Pages)
npm run build

# Export static site (runs automatically during deploy)
npm run export

# Deploy to GitHub Pages (builds, exports, and publishes to gh-pages branch)
npm run deploy

# Start production server locally (optional, primarily used with `next start`)
npm start
```

## Architecture

### Next.js Configuration (`next.config.ts`)
- **PWA Setup**: Uses `next-pwa` to generate service worker in `public/` directory
- **Static Export**: Configured with `output: "export"` for GitHub Pages compatibility
- **Image Optimization**: Disabled (`unoptimized: true`) because GitHub Pages doesn't support Next.js Image Optimization
- **TypeScript**: Build errors are ignored (`ignoreBuildErrors: true`)
- **Turbopack**: Enabled with default settings

### Project Structure
- **Pages Router**: Uses traditional Next.js Pages Router (not App Router)
- **Entry Point**: `src/pages/index.tsx` renders the fullscreen magnifier
- **Main Component**: `src/components/MagnifierView.tsx` handles all camera, zoom, and torch logic
- **TypeScript Extensions**: `src/types/media.d.ts` extends `MediaTrackCapabilities` for `zoom` and `torch` properties

### Camera & Media Capabilities

The app uses the **MediaStream API** to access device camera with these key features:

1. **Hardware Zoom** (`MagnifierView.tsx:33-46, 143-155`)
   - Checks if device supports hardware zoom via `MediaTrackCapabilities.zoom`
   - Falls back to CSS `transform: scale()` if hardware zoom unavailable
   - Dynamically reads zoom min/max/step from device capabilities

2. **Torch/Flashlight** (`MagnifierView.tsx:48-61, 206-257`)
   - Toggles camera flash using `track.applyConstraints({ advanced: [{ torch: boolean }] })`
   - Only available on devices that support `torch` in capabilities
   - Visual state changes: white background when ON, dark background when OFF

3. **Autofocus** (`MagnifierView.tsx:74-87`)
   - Attempts to enable continuous autofocus if supported
   - Silently degrades if unavailable (no user-facing errors)

4. **Wake Lock API** (`MagnifierView.tsx:108-116`)
   - Prevents screen from sleeping during use
   - Uses `navigator.wakeLock.request("screen")` (TypeScript types extended inline with `@ts-ignore`)

### UI Behavior

- **Auto-Hide Controls** (`MagnifierView.tsx:158-171`)
  - Settings panel fades out after 4 seconds of inactivity
  - Reappears on any touch/mouse activity
  - Controls remain visible while actively dragging zoom slider

- **Touch-Optimized Slider** (`MagnifierView.tsx:259-316`)
  - Custom range input with visible track, fill, and handle
  - Handles touch events (`onTouchStart`, `onTouchEnd`) for mobile
  - Positioned in a pill-shaped container with glassmorphic backdrop blur

### Type Extensions

**Important**: The app extends browser media types that aren't in standard TypeScript definitions:

- `src/types/media.d.ts` adds `zoom` and `torch` to `MediaTrackCapabilities`
- `src/components/MagnifierView.tsx` adds `focusMode` and `focusDistance` inline
- Wake Lock API uses `@ts-ignore` due to missing types

## Important Implementation Notes

1. **Always use `facingMode: "environment"`** when accessing camera (rear camera on mobile)
2. **Check capabilities before applying constraints** - not all devices support zoom/torch/autofocus
3. **Use `@ts-ignore` or type assertions** when working with cutting-edge media APIs (Wake Lock, torch, focusMode)
4. **Static export requirements**: Avoid server-side features (API routes are not used in production)
5. **PWA manifest**: Located at `public/manifest.webmanifest` - update for branding changes

## Path Aliases

TypeScript is configured with `@/*` pointing to `src/*` (e.g., `@/components/MagnifierView`)

## Styling

- **Tailwind CSS v4** (using `@tailwindcss/postcss`)
- **Safe Area Insets**: Controls use `env(safe-area-inset-bottom)` for iOS notch/home indicator
- **Glassmorphism**: Controls use `backdrop-blur-md` with semi-transparent backgrounds
