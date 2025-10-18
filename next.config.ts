import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingRoot: undefined, // Silence lockfile warning
};

export default nextConfig;
