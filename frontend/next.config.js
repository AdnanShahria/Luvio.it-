/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide Next.js dev indicators
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },

  // Enable React strict mode for development
  reactStrictMode: true,

  // Transpile shared workspace package
  transpilePackages: ['@luvio/shared'],

  // Image optimization
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
    ],
  },

  // API proxy for development (avoids CORS issues)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8788/api/:path*',
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
