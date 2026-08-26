import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@betterbarmm/ui", "@betterbarmm/editorial"],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
