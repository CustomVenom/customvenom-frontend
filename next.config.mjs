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
        destination: '/dashboard/waivers',
        permanent: true,
      },
      {
        source: '/league/:path*',
        destination: '/dashboard/:path*',
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
    return config;
  },
};

export default nextConfig;
