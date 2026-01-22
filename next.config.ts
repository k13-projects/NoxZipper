import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization
  images: {
    unoptimized: false,
  },
  // Ignore TypeScript errors during build (for faster deployments)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
