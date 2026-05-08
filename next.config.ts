import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained bundle for Docker deployment
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
