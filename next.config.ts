import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  // Allow Z.ai preview domains to access the dev server
  allowedDevOrigins: [
    "*.space-z.ai",
    "localhost",
    "127.0.0.1",
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }
      : false,
  },
};

export default nextConfig;
