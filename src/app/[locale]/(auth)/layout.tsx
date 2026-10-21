"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

import { tokenManager } from "@/lib/tokenManager";
import { authService } from "@/services/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const lang = isAr ? "AR" : "EN";

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const pathWithoutLocale = pathname.replace(/^\/(?:ar|en)/, "") || "/";
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authPages.some(
    (page) => pathWithoutLocale === page || pathWithoutLocale.startsWith(`${page}/`)
  );

  useEffect(() => {
    let isCancelled = false;

    async function evaluateAuth() {
      if (!isAuthPage) {
        if (!isCancelled) setCheckingAuth(false);
        return;
      }

      const accessToken = tokenManager.getAccessToken();
      const refreshTokenStr = tokenManager.getRefreshToken();
      const isAccessTokenExpired = tokenManager.isTokenExpired(accessToken);

      const localUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let localUser = null;
      try {
        if (localUserStr) localUser = JSON.parse(localUserStr);
      } catch {}

      const activeUser = user || localUser;

      // 1. If access token exists, is NOT expired, and user profile exists -> Safe to redirect away from auth page
      if (accessToken && !isAccessTokenExpired && (isAuthenticated || activeUser)) {
        const role = activeUser?.role || "student";
        const status = activeUser?.approval_status || activeUser?.approvalStatus || "";
        const isAdmin = Boolean(
          activeUser?.is_superuser === true ||
          (activeUser as any)?.isSuperuser === true ||
          role === "admin" ||
          role === "superuser"
        );

        const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const redirectParam = searchParams?.get("redirect");

        let redirectPath = redirectParam || `/${locale}/student`;
        if (isAdmin) {
          redirectPath = (redirectParam && redirectParam.includes("/admin")) ? redirectParam : `/${locale}/admin/cms`;
        } else if (!redirectParam && role === "instructor") {
          redirectPath =
            status === "approved"
              ? `/${locale}/instructor/dashboard`
              : `/${locale}/instructor`;
        }
        router.replace(redirectPath);
        return;
      }

      // 2. If access token is expired or missing, but refresh token exists, attempt silent refresh
      if (refreshTokenStr) {
        try {
          const res = await authService.refreshToken(refreshTokenStr);
          if (isCancelled) return;
          if (res?.access) {
            // Token refreshed successfully! Now safe to redirect
            const role = activeUser?.role || "student";
            const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            const redirectParam = searchParams?.get("redirect");
            const redirectPath = redirectParam || (role === "instructor" ? `/${locale}/instructor` : `/${locale}/student`);
            router.replace(redirectPath);
            return;
          }
        } catch {
          // Refresh token invalid/expired -> Clear stale session completely
          tokenManager.clearTokens();
        }
      } else if (accessToken && isAccessTokenExpired) {
        // Expired access token with no refresh token -> Clear stale tokens
        tokenManager.clearTokens();
      }

      if (!isCancelled) {
        setCheckingAuth(false);
      }
    }

    evaluateAuth();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, user, isAuthPage, locale, router]);

  const toggleLanguage = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    let newPath = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${pathname}`;
    }
    router.push(newPath);
  };

  if (isAuthPage && checkingAuth) {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="flex min-h-screen w-full items-center justify-center bg-slate-50 font-sans"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-dark" />
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex min-h-screen w-full flex-col justify-between bg-slate-50 text-slate-800 selection:bg-brand-dark selection:text-white font-sans overflow-hidden"
    >
      {/* Background SVG Grid Mesh Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#34D399]/20 via-brand-dark/8 to-transparent blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/2 -right-32 -z-10 h-[500px] w-[500px] rounded-full bg-[#D1FAE5]/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 -left-32 -z-10 h-[450px] w-[450px] rounded-full bg-brand-dark/8 blur-3xl" />

      {/* Shared Auth Header */}
      <Header variant="auth" lang={lang} onLanguageToggle={toggleLanguage} />

      {/* Main Centered Content */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-6 my-auto">
        {children}
      </main>

      {/* Shared Auth Minimal Footer */}
      <Footer variant="auth" lang={lang} />
    </div>
  );
}
