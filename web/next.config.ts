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
};

export default nextConfig;
