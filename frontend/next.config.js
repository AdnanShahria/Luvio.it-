/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Transpile shared workspace package
  transpilePackages: ['@luvio/shared'],

  // Image optimization — allow R2 images served via Worker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'luvio.it',
      },
      {
        protocol: 'https',
        hostname: '**.luvio.it',
      },
      {
        // Local dev: images served via Wrangler dev server
        protocol: 'http',
        hostname: 'localhost',
        port: '2223',
      },
    ],
  },

  // API proxy for development (avoids CORS issues)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:2223/api/:path*',
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=self, microphone=(), geolocation=self' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
