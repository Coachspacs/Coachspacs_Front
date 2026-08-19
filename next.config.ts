import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  compress: true,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 4,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85, 90, 100],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async redirects() {
    return [
      {
        source: '/auth/verify-email',
        destination: '/verify-email',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const targetUrl =
      process.env.BACKEND_API_URL ||
      process.env.API_BASE_URL ||
      (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : null) ||
      'https://coachspace-back.onrender.com/api';

    return [
      {
        source: '/api/:path*',
        destination: `${targetUrl.replace(/\/+$/, '')}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
