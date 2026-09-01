"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";

export function StudentLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const locale = useLocale() || "en";
  const router = useRouter();
  const isAr = locale === "ar";
  const tStudent = useTranslations("studentSettings");
  const tWs = useTranslations("studentWorkspace");

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const localUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let localUser = null;
    try {
      if (localUserStr) localUser = JSON.parse(localUserStr);
    } catch {}

    const isUserLoggedIn = isAuthenticated || Boolean(localToken && (user || localUser));
    const activeUser = user || localUser;

    if (!isUserLoggedIn || !activeUser) {
      router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const userRole = (activeUser.role || "").toLowerCase();
    if (userRole === "instructor" || userRole === "coach") {
      const status = (activeUser.approval_status || activeUser.approvalStatus || "").toLowerCase();
      router.replace(status === "approved" ? `/${locale}/instructor/dashboard` : `/${locale}/instructor`);
      return;
    }

    setCheckingAuth(false);
  }, [isAuthenticated, user, locale, pathname, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Check if current route is the learning player page (dedicated classroom layout with its own unified header & light bar)
  const isLearnPage = pathname.includes("/student/learn");

  if (isLearnPage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        {children}
      </div>
    );
  }

  const fullName = (mounted ? user?.fullName || user?.name : "") || tWs("studentUserFallback");
  const email = (mounted ? user?.email : "") || "student@coachspace.com";
  const avatarPreview = mounted ? user?.avatar || null : null;
  const rawHeadline = mounted ? user?.headline : "";
  const displayHeadline =
    !rawHeadline ||
    rawHeadline === "Student & Lifelong Learner" ||
    rawHeadline === "Data Science & AI Enthusiast"
      ? tStudent("defaultHeadline")
      : rawHeadline;

  const isInstructor = (user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Top Profile Banner Card */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 mb-6 lg:mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            
            {/* User Details (Avatar + Name + Localized Bio + Email) */}
            <div className="flex items-center gap-4 text-center sm:text-start flex-col sm:flex-row">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 border-2 border-emerald-300 overflow-hidden shadow-xs flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={fullName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-xl sm:text-2xl text-emerald-700">
                      {fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-base sm:text-xl font-black text-slate-900">{fullName}</h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">{displayHeadline}</p>
                <p className="text-[11px] text-slate-400 font-medium">{email}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modern Portal Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24">
            <Sidebar
              user={{
                name: fullName,
                role: tStudent("roleStudent"),
                avatarUrl: avatarPreview,
              }}
            />
          </aside>

          <div className="flex-1 w-full min-w-0">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
