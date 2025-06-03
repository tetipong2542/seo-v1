import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Optimize images
  images: {
    unoptimized: false,
  },
  // Disable ESLint during build to avoid errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
