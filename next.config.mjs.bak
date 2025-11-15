import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Temporarily bypass Next's built-in ESLint during build;
  // run ESLint via pre-commit or a separate CI step.
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      {
        source: '/league/roster',
        destination: '/dashboard/roster',
        permanent: true,
      },
      {
        source: '/league/waivers',
        destination: '/dashboard/players',
        permanent: true,
      },
      {
        source: '/league/:path*',
        destination: '/dashboard/:path*',
        permanent: true,
      },
      // Redirect old waivers route to consolidated players
      {
        source: '/dashboard/waivers',
        destination: '/dashboard/players',
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      {
        module: /@opentelemetry\/instrumentation/,
        message: /the request of a dependency is an expression/,
      },
    ];
    // Add path aliases for @customvenom packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@customvenom/lib': path.resolve(__dirname, 'packages/lib'),
      '@customvenom/config': path.resolve(__dirname, 'packages/config'),
      '@customvenom/ui': path.resolve(__dirname, 'packages/ui'),
    };
    return config;
  },
  // Fix lucide-react barrel optimization by transpiling it
  // Also transpile local @customvenom packages
  transpilePackages: ['lucide-react', '@customvenom/lib', '@customvenom/ui', '@customvenom/config'],
  // Disable barrel optimization for lucide-react
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
