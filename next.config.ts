import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.114"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.R2_PUBLIC_HOSTNAME || "pub-placeholder.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
