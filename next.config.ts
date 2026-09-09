import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const backendUrl =
  process.env.BACKEND_API_URL ||
  process.env.API_BASE_URL ||
  (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api'
    ? process.env.NEXT_PUBLIC_API_URL
    : '');

let backendHost: string | null = null;
if (backendUrl && backendUrl.startsWith('http')) {
  try {
    backendHost = new URL(backendUrl).hostname;
  } catch {
    backendHost = null;
  }
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  compress: true,
  serverExternalPackages: ['axios'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      ...(backendHost
        ? [
            {
              protocol: 'https' as const,
              hostname: backendHost,
              pathname: '/**',
            },
            {
              protocol: 'http' as const,
              hostname: backendHost,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    if (!backendUrl) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/+$/, '')}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
