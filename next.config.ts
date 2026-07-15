import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true, // TODO: re-enable after fixing remaining TS issues
  },
  reactStrictMode: true,
  // Strip console.* calls from production builds (keep console.error for real errors)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }
      : false,
  },
};

export default nextConfig;
