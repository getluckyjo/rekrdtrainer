import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There's a stray lockfile in the home directory; pin the root so Turbopack
  // doesn't infer its way out of this project.
  turbopack: { root: __dirname },
};

export default nextConfig;
