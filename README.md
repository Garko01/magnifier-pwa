# PWA Magnifier

A Progressive Web App magnifier built with Next.js, featuring hardware-accelerated zoom and flashlight control.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/pages/index.tsx`. The page auto-updates as you edit the file.

## Features

- **Hardware-Accelerated Zoom**: Uses device camera capabilities for smooth, high-quality zoom
- **Flashlight/Torch Control**: Toggle camera flash on supported devices
- **Auto-Hide Controls**: UI automatically fades out after inactivity for unobstructed viewing
- **Wake Lock**: Prevents screen from sleeping during use
- **PWA Support**: Install on your device for a native app experience

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Building for Production

Build and export the static site:

```bash
npm run build
npm run export
```

## Deploy to GitHub Pages

This project is configured for deployment to GitHub Pages using static export:

```bash
npm run deploy
```

This command will:
1. Build the production version
2. Export the static site
3. Publish to the `gh-pages` branch

**Note**: This project uses `output: "export"` in `next.config.ts` for static site generation. API routes are not supported in production as this is a client-side only PWA.
