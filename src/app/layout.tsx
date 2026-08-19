import React from 'react';
import { Cairo, Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F5244',
};

export const metadata = {
  metadataBase: new URL('https://coachspace.com'),
  title: {
    default: 'CoachSpace - High Performance Coaching & LMS Platform',
    template: '%s | CoachSpace',
  },
  description: 'Empower your career with top-tier coaching, interactive courses, certified workshops, and verified credentials on CoachSpace.',
  keywords: ['Coaching', 'Online Courses', 'LMS', 'Learning Platform', 'Certificates', 'CoachSpace', 'كوتش سبيس', 'دورات تعليمية'],
  authors: [{ name: 'CoachSpace Team' }],
  creator: 'CoachSpace',
  publisher: 'CoachSpace',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
    url: 'https://coachspace.com',
    siteName: 'CoachSpace',
    title: 'CoachSpace - High Performance Coaching & LMS Platform',
    description: 'Empower your career with top-tier coaching, interactive courses, and verified credentials.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'CoachSpace LMS Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoachSpace - High Performance Coaching & LMS Platform',
    description: 'Empower your career with top-tier coaching and interactive courses.',
    images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'ar-SA': '/ar',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cairo.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://picsum.photos" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
