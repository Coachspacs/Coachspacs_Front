"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

import { tokenManager } from "@/lib/tokenManager";

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
    const hasToken = tokenManager.hasSession();
    const localUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let localUser = null;
    try {
      if (localUserStr) localUser = JSON.parse(localUserStr);
    } catch {}

    const isUserLoggedIn = isAuthenticated || Boolean(hasToken && (user || localUser));
    const activeUser = user || localUser;

    if (isAuthPage && isUserLoggedIn && activeUser) {
      const role = activeUser.role || "student";
      const status = activeUser.approval_status || activeUser.approvalStatus || "";

      let redirectPath = `/${locale}/student`;
      if (role === "instructor") {
        redirectPath =
          status === "approved"
            ? `/${locale}/instructor/dashboard`
            : `/${locale}/instructor`;
      }
      router.replace(redirectPath);
    } else {
      setCheckingAuth(false);
    }
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
          <Loader2 className="h-8 w-8 animate-spin text-[#0F5244]" />
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex min-h-screen w-full flex-col justify-between bg-slate-50 text-slate-800 selection:bg-[#0F5244] selection:text-white font-sans overflow-hidden"
    >
      {/* Background SVG Grid Mesh Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#34D399]/20 via-[#0F5244]/8 to-transparent blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/2 -right-32 -z-10 h-[500px] w-[500px] rounded-full bg-[#D1FAE5]/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 -left-32 -z-10 h-[450px] w-[450px] rounded-full bg-[#0F5244]/8 blur-3xl" />

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
