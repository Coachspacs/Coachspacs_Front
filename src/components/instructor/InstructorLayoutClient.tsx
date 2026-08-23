"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { Award, Clock, Plus, LayoutDashboard, BookOpen, Users, CreditCard, Settings } from "lucide-react";
import { InstructorPendingModal } from "@/components/modals/InstructorPendingModal";
import { tokenManager } from "@/lib/tokenManager";
import { useRouter } from "next/navigation";

export function InstructorLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tDash = useTranslations("instructorDashboard");

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [mounted, setMounted] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [isPendingModalOpen, setIsPendingModalOpen] = React.useState(false);
  const [pendingFeatureName, setPendingFeatureName] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setMounted(true);
    const hasToken = tokenManager.hasSession();
    const localUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let localUser = null;
    try {
      if (localUserStr) localUser = JSON.parse(localUserStr);
    } catch {}

    const isUserLoggedIn = isAuthenticated || Boolean(hasToken && (user || localUser));
    const activeUser = user || localUser;

    if (!isUserLoggedIn || !activeUser) {
      router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (activeUser.role === "student") {
      router.replace(`/${locale}/student`);
      return;
    }

    setCheckingAuth(false);
  }, [isAuthenticated, user, locale, pathname, router]);

  const approvalStatus = (user?.approval_status || user?.approvalStatus || "pending").toLowerCase();
  const isApproved = approvalStatus === "approved";
  const isSettingsPage = pathname.includes("/instructor/settings") || pathname.includes("/instructor/profile");

  // Check if current route is studio/creation page
  const isStudioPage = pathname.includes("/instructor/courses/new") || pathname.includes("/instructor/courses/create");

  // If instructor is not approved and navigates to a restricted route, redirect to settings and open modal
  React.useEffect(() => {
    if (mounted && !checkingAuth && !isApproved && !isSettingsPage) {
      setIsPendingModalOpen(true);
      router.replace(`/${locale}/instructor/settings`);
    }
  }, [mounted, checkingAuth, isApproved, isSettingsPage, locale, router]);

  const fullName = (mounted ? (user?.fullName || user?.name) : "") || tDash("defaultInstructorName");
  const email = (mounted ? user?.email : "") || "instructor@coachspace.com";
  const avatarPreview = mounted ? (user?.avatar || null) : null;
  const headline = (mounted ? user?.headline : "") || tInst("defaultHeadline");

  const handleRestrictedClick = (featureLabel: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setPendingFeatureName(featureLabel);
    setIsPendingModalOpen(true);
  };

  const navItems = [
    {
      id: "overview",
      label: tInst("analyticsRevenue"),
      icon: LayoutDashboard,
      href: `/${locale}/instructor/dashboard`,
      onClick: !isApproved ? handleRestrictedClick(tInst("analyticsRevenue")) : undefined,
    },
    {
      id: "courses",
      label: tInst("courseLifecycle"),
      icon: BookOpen,
      href: `/${locale}/instructor/courses`,
      onClick: !isApproved ? handleRestrictedClick(tInst("courseLifecycle")) : undefined,
    },
    {
      id: "students",
      label: tInst("enrolledStudentsNav"),
      icon: Users,
      href: `/${locale}/instructor/students`,
      onClick: !isApproved ? handleRestrictedClick(tInst("enrolledStudentsNav")) : undefined,
    },
    {
      id: "payout",
      label: tInst("payoutAndBilling"),
      icon: CreditCard,
      href: `/${locale}/instructor/orders`,
      onClick: !isApproved ? handleRestrictedClick(tInst("payoutAndBilling")) : undefined,
    },
    {
      id: "settings",
      label: t("accountSettings"),
      icon: Settings,
      href: `/${locale}/instructor/settings`,
    },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#0F5244] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isStudioPage && isApproved) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex flex-col font-sans">
        <Header />
        <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
      <Header />
      <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="w-full space-y-4 sm:space-y-6">
          
          {/* Top Instructor Workspace Banner / Header Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-start">
              <div className="relative group shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Instructor" className="w-full h-full object-cover" />
                  ) : (
                    <span suppressHydrationWarning className="font-black text-xl text-slate-700">{fullName.charAt(0)}</span>
                  )}
                </div>
                <span className={`absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 border-2 border-white rounded-full ${isApproved ? "bg-emerald-500" : "bg-amber-400"}`} />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 suppressHydrationWarning className="text-base sm:text-lg font-black text-slate-900">{fullName}</h1>
                  {isApproved ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[10px] font-extrabold flex items-center gap-1">
                      <Award className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>{tInst("verifiedCoach")}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                      <span>{isAr ? "قيد المراجعة" : "Under Review"}</span>
                    </span>
                  )}
                </div>
                <p suppressHydrationWarning className="text-xs text-slate-500 font-medium">{headline}</p>
                <p suppressHydrationWarning className="text-[11px] text-slate-400 font-medium">{email}</p>
              </div>
            </div>
          </div>

          {/* Persistent Dashboard Layout: Left Sidebar + Main Dynamic Area */}
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-10 items-start">
            <aside className="w-full md:w-64 shrink-0">
              <Sidebar
                items={navItems}
                user={{
                  name: fullName,
                  role: tInst("roleInstructor"),
                  avatarUrl: avatarPreview,
                }}
              />
            </aside>

            <div className="flex-1 w-full">
              {children}
            </div>
          </div>

        </div>
      </main>
      <Footer />

      {/* Pending Approval Modal */}
      <InstructorPendingModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        featureName={pendingFeatureName}
      />
    </div>
  );
}
