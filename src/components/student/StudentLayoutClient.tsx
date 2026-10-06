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

    const isAdminUser = Boolean(
      activeUser?.is_superuser === true ||
      (activeUser as any)?.isSuperuser === true ||
      activeUser?.role === "admin" ||
      activeUser?.role === "superuser"
    );

    if (isAdminUser) {
      router.replace(`/${locale}/admin/cms`);
      return;
    }

    const isInstructorUser =
      activeUser?.role === "instructor" || activeUser?.role === "coach";

    if (
      !isInstructorUser &&
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
          <div className="h-8 w-8 border-4 border-[var(--color-primary-main)] border-t-transparent rounded-full animate-spin" />
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
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans print:bg-white print:min-h-0">
      <div className="print:hidden">
        <Header />
      </div>
      <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full print:p-0 print:m-0 print:max-w-none print:w-full">
        
        {/* Modern Portal Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start print:block print:p-0 print:m-0 print:w-full">
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24 print:hidden">
            <Sidebar
              user={{
                name: fullName,
                role: displayHeadline,
                avatarUrl: avatarPreview,
                email: email,
              }}
            />
          </aside>

          <div className="flex-1 w-full min-w-0 print:p-0 print:m-0 print:w-full">
            {children}
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
