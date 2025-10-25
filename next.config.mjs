/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Temporarily bypass Next's built-in ESLint during build;
  // run ESLint via pre-commit or a separate CI step.
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;

