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

  const currentLocaleMatch = pathname.match(/^\/(ar|en)/);
  const currentLocale = currentLocaleMatch ? currentLocaleMatch[1] : 'en';
  const pathWithoutLocale = pathname.replace(/^\/(?:ar|en)/, '') || '/';

  // 5. Auth Guest Guard: Prevent logged-in users from accessing login, register, forgot-password, reset-password
  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean(authToken && authToken !== 'undefined' && authToken !== 'null');

  if (isAuthenticated) {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = authPages.some(page => pathWithoutLocale === page || pathWithoutLocale.startsWith(`${page}/`));

    if (isAuthPage) {
      const userRole = decodeURIComponent(request.cookies.get('user_role')?.value || 'student');
      const userStatus = decodeURIComponent(request.cookies.get('user_status')?.value || '');

      let redirectPath = `/${currentLocale}/student`;
      if (userRole === 'instructor') {
        redirectPath = userStatus === 'approved'
          ? `/${currentLocale}/instructor/dashboard`
          : `/${currentLocale}/instructor`;
      }

      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // 6. Protected Routes Guard: Protect instructor, student, account, and profile pages
  const isInstructorRoute = pathWithoutLocale.startsWith('/instructor');
  const isStudentRoute = pathWithoutLocale.startsWith('/student');
  const isAccountRoute = pathWithoutLocale === '/account' || pathWithoutLocale.startsWith('/account/');
  const isProfileRoute = pathWithoutLocale === '/profile' || pathWithoutLocale.startsWith('/profile/');

  const isProtectedRoute = isInstructorRoute || isStudentRoute || isAccountRoute || isProfileRoute;

  if (isProtectedRoute) {
    // 6.1 If unauthenticated, redirect to login with return path
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/login`;
      url.search = `?redirect=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }

    // 6.2 Role-Based Access: Students cannot access instructor routes
    const userRole = decodeURIComponent(request.cookies.get('user_role')?.value || 'student');
    if (isInstructorRoute && userRole === 'student') {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/student`;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
