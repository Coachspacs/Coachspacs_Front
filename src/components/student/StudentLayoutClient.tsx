"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { updateUser } from "@/features/auth/slice";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { tokenManager } from "@/lib/tokenManager";

export function StudentLayoutClient({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
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
    const hasToken = tokenManager.hasSession();
    const localUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let localUser = null;
    try {
      if (localUserStr) localUser = JSON.parse(localUserStr);
    } catch {}

    const isUserLoggedIn = isAuthenticated || hasToken || Boolean(user || localUser);
    const activeUser = user || localUser;

    if (!isUserLoggedIn && !hasToken) {
      router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (
      activeUser?.headline &&
      (activeUser.headline.toLowerCase().includes("certified instructor") ||
        activeUser.headline.toLowerCase().includes("instructor") ||
        activeUser.headline.includes("مدرب") ||
        activeUser.headline.includes("مدرب معتمد") ||
        activeUser.headline.includes("مدرب موثوق") ||
        activeUser.headline.includes("مدرب وخبير معتمد") ||
        activeUser.headline.includes("شغوف") ||
        activeUser.headline.toLowerCase().includes("lifelong"))
    ) {
      const studentLabel = isAr ? "طالب" : "Student";
      dispatch(updateUser({ headline: studentLabel }));
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          uObj.headline = studentLabel;
          localStorage.setItem("user", JSON.stringify(uObj));
        }
      } catch {}
    }

    setCheckingAuth(false);
  }, [isAuthenticated, user, locale, pathname, router, dispatch, isAr]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Check if current route is the learning player page or checkout page
  const isLearnPage = pathname.includes("/student/learn");
  const isCheckoutPage = pathname.includes("/student/checkout");

  if (isLearnPage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        {children}
      </div>
    );
  }

  if (isCheckoutPage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  const fullName = (mounted ? user?.fullName || user?.name : "") || tWs("studentUserFallback");
  const email = (mounted ? user?.email : "") || "student@coachspace.com";
  const rawAvatar = mounted ? user?.avatar : null;
  const avatarPreview =
    typeof rawAvatar === "string" && rawAvatar.trim().length > 0 ? rawAvatar.trim() : null;
  const rawHeadline = (mounted ? user?.headline : "") || "";
  const isGenericOrInstructorHeadline =
    !rawHeadline ||
    rawHeadline.toLowerCase().includes("certified instructor") ||
    rawHeadline.toLowerCase().includes("instructor") ||
    rawHeadline.includes("مدرب") ||
    rawHeadline.includes("مدرب معتمد") ||
    rawHeadline.includes("مدرب موثوق") ||
    rawHeadline.includes("مدرب وخبير معتمد") ||
    rawHeadline === "Student & Lifelong Learner" ||
    rawHeadline === "Data Science & AI Enthusiast" ||
    rawHeadline.toLowerCase().includes("student") ||
    rawHeadline.includes("طالب");

  const isInstructor = (user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach";

  const displayHeadline = isInstructor
    ? (isAr ? "مدرب معتمد" : "Certified Instructor")
    : isGenericOrInstructorHeadline
    ? (isAr ? "طالب" : "Student")
    : rawHeadline;

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
                role: isInstructor ? (isAr ? "مدرب" : "Instructor") : tStudent("roleStudent"),
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
