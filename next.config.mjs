/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Temporarily bypass Next's built-in ESLint during build;
  // run ESLint via pre-commit or a separate CI step.
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /@opentelemetry\/instrumentation/, message: /the request of a dependency is an expression/ },
    ]
    return config
  },
};

export default nextConfig;

