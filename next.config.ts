import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
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
