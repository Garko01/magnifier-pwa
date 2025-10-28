import withPWAInit from "next-pwa";

/**
 * Configure next-pwa
 * - Generates service worker for offline support
 * - Disabled in development mode
 */
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/**
 * Next.js configuration for:
 * - React strict mode
 * - Static export for GitHub Pages
 * - Unoptimized images (GitHub Pages lacks Next Image optimization)
 */
const nextConfig = {
  reactStrictMode: true,
  output: "export", // Required for GitHub Pages
  images: {
    unoptimized: true,
  },
  // Remove unsupported keys (Next 16 no longer uses "experimental.turbo" or "eslint")
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
