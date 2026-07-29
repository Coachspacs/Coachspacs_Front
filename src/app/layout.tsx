import React from 'react';
import '@/styles/globals.css';

export const metadata = {
  title: 'CoachSpace - High Performance Coaching & LMS',
  description: 'Empower your career with top-tier coaching, interactive courses, and verified credentials.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
