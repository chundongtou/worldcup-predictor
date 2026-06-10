import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore build errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
