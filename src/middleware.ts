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

  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean(authToken && authToken !== 'undefined' && authToken !== 'null');
  const userRole = decodeURIComponent(request.cookies.get('user_role')?.value || 'student').toLowerCase();
  const userStatus = decodeURIComponent(request.cookies.get('user_status')?.value || '').toLowerCase();
  const isInstructor = userRole === 'instructor' || userRole === 'coach';

  // 5. Auth Guest Guard: Prevent logged-in users from accessing login, register, forgot-password, reset-password
  if (isAuthenticated) {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = authPages.some(page => pathWithoutLocale === page || pathWithoutLocale.startsWith(`${page}/`));

    if (isAuthPage) {
      let redirectPath = `/${currentLocale}/student`;
      if (isInstructor) {
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

  // 6. Protected Routes Guard: Protect instructor, student, cart, checkout, account, and profile pages
  const isInstructorRoute = pathWithoutLocale.startsWith('/instructor');
  const isStudentRoute = pathWithoutLocale.startsWith('/student');
  const isCartOrCheckoutRoute =
    pathWithoutLocale === '/cart' ||
    pathWithoutLocale.startsWith('/cart/') ||
    pathWithoutLocale === '/checkout' ||
    pathWithoutLocale.startsWith('/checkout/');
  const isAccountRoute = pathWithoutLocale === '/account' || pathWithoutLocale.startsWith('/account/');
  const isProfileRoute = pathWithoutLocale === '/profile' || pathWithoutLocale.startsWith('/profile/');

  const isProtectedRoute =
    isInstructorRoute ||
    isStudentRoute ||
    (isCartOrCheckoutRoute && !isStudentRoute) ||
    isAccountRoute ||
    isProfileRoute;

  if (isProtectedRoute) {
    // 6.1 If unauthenticated, redirect to login with return path
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/login`;
      url.search = `?redirect=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }

    // 6.2 Strict Role Separation (MVP):
    // Students cannot access instructor routes
    if (isInstructorRoute && !isInstructor) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/student`;
      url.search = '';
      return NextResponse.redirect(url);
    }

    // Instructors cannot access student routes, cart, or checkout
    if ((isStudentRoute || isCartOrCheckoutRoute) && isInstructor) {
      const url = request.nextUrl.clone();
      url.pathname = userStatus === 'approved'
        ? `/${currentLocale}/instructor/dashboard`
        : `/${currentLocale}/instructor`;
      url.search = '';
      return NextResponse.redirect(url);
    }

    // Direct /account and /profile redirects based on role
    if (isAccountRoute || isProfileRoute) {
      const url = request.nextUrl.clone();
      url.pathname = isInstructor
        ? `/${currentLocale}/instructor/settings`
        : `/${currentLocale}/student/settings`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
