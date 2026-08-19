import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Handle /auth/verify-email or /verify-email links sent from backend
  if (pathname.includes('/auth/verify-email')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/auth/verify-email', '/verify-email');
    return NextResponse.redirect(url);
  }

  // 2. Handle Django /account-confirm-email/<key> links
  const accountConfirmMatch = pathname.match(/(?:\/(?:ar|en))?(?:\/auth)?\/account-confirm-email\/([^/]+)/);
  if (accountConfirmMatch) {
    const key = accountConfirmMatch[1];
    const url = request.nextUrl.clone();
    url.pathname = '/verify-email';
    url.search = `?token=${encodeURIComponent(key)}&key=${encodeURIComponent(key)}`;
    return NextResponse.redirect(url);
  }

  // 3. Handle /auth/reset-password or /auth/password/reset
  if (pathname.includes('/auth/reset-password') || pathname.includes('/auth/password/reset')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname
      .replace('/auth/reset-password', '/reset-password')
      .replace('/auth/password/reset', '/reset-password');
    return NextResponse.redirect(url);
  }

  // 4. Handle Django password reset confirmation links: /password-reset/confirm/<uid>/<token>
  const pwResetMatch = pathname.match(/(?:\/(?:ar|en))?(?:\/auth)?\/password-reset\/confirm\/([^/]+)\/([^/]+)/);
  if (pwResetMatch) {
    const uid = pwResetMatch[1];
    const token = pwResetMatch[2];
    const url = request.nextUrl.clone();
    url.pathname = '/reset-password';
    url.search = `?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
