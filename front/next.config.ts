import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(__dirname, "..");
const useMonorepoTurbopackRoot = existsSync(
  path.join(monorepoRoot, "node_modules"),
);

const nextConfig: NextConfig = {
  ...(useMonorepoTurbopackRoot
    ? { turbopack: { root: monorepoRoot } }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
