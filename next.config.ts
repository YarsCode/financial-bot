import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mammoth'],
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
