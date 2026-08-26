import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@betterbarmm/ui", "@betterbarmm/editorial"],
  experimental: {
    externalDir: true,
  },
  // The ballot page became the candidates page. Anything already linking to the
  // old address — a post, a message, someone's bookmark — still lands.
  async redirects() {
    return [
      { source: "/ballot", destination: "/candidates", permanent: true },
      { source: "/about", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
