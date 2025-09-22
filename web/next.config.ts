import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  turbopack: {
    root: "C:/Users/spurg/Documents/Marshall-Wace/loan-dashboard/web",
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://api:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
