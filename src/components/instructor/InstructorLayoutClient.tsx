"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { updateUser } from "@/features/auth/slice";
import { getInstructorDashboard } from "@/services/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Award,
  Clock,
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Settings,
  ExternalLink,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { tokenManager } from "@/lib/tokenManager";
import {
  getSavedInstructorOverrides,
  normalizeInstructorSlug,
  getLocalizedHeadline,
} from "@/lib/instructorProfile";

import { InstructorPendingModal } from "@/components/modals/InstructorPendingModal";

export function InstructorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tDash = useTranslations("instructorDashboard");

  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [pendingFeatureName, setPendingFeatureName] = useState<
    string | undefined
  >(undefined);
  const [localOverrides, setLocalOverrides] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    const hasToken = tokenManager.hasSession();
    const localUserStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let localUser = null;
    try {
      if (localUserStr) localUser = JSON.parse(localUserStr);
    } catch {}

    const isUserLoggedIn =
      isAuthenticated || Boolean(hasToken && (user || localUser));
    const activeUser = user || localUser;

    if (!isUserLoggedIn || !activeUser) {
      router.replace(
        `/${locale}/login?redirect=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    if (activeUser.role === "student") {
      router.replace(`/${locale}/student`);
      return;
    }

    if (
      activeUser.headline &&
      (activeUser.headline.toLowerCase().includes("certified instructor") ||
        activeUser.headline.includes("مدرب معتمد") ||
        activeUser.headline.includes("مدرب موثوق") ||
        activeUser.headline.includes("مدرب وخبير معتمد") ||
        activeUser.headline.toLowerCase().includes("student") ||
        activeUser.headline.includes("طالب"))
    ) {
      dispatch(updateUser({ headline: "" }));
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          uObj.headline = "";
          localStorage.setItem("user", JSON.stringify(uObj));
        }
      } catch {}
    }

    // Live sync approval status with backend GET /api/auth/instructor/dashboard
    getInstructorDashboard()
      .then(() => {
        const headlineToSet =
          user?.headline &&
          !user.headline.toLowerCase().includes("student") &&
          !user.headline.includes("طالب") &&
          !user.headline.toLowerCase().includes("certified instructor") &&
          !user.headline.includes("مدرب معتمد") &&
          !user.headline.includes("مدرب موثوق") &&
          !user.headline.includes("مدرب وخبير معتمد")
            ? user.headline
            : "";

        dispatch(
          updateUser({
            role: "instructor",
            approval_status: "approved",
            approvalStatus: "approved",
            headline: headlineToSet,
          }),
        );
        try {
          const uStr = localStorage.getItem("user");
          if (uStr) {
            const uObj = JSON.parse(uStr);
            uObj.role = "instructor";
            uObj.approval_status = "approved";
            uObj.approvalStatus = "approved";
            uObj.headline = headlineToSet;
            localStorage.setItem("user", JSON.stringify(uObj));
          }
        } catch {}
      })
      .catch((err: any) => {
        if (err?.response?.status === 403) {
          dispatch(
            updateUser({
              approval_status: "pending",
              approvalStatus: "pending",
            }),
          );
          try {
            const uStr = localStorage.getItem("user");
            if (uStr) {
              const uObj = JSON.parse(uStr);
              uObj.approval_status = "pending";
              uObj.approvalStatus = "pending";
              localStorage.setItem("user", JSON.stringify(uObj));
            }
          } catch {}
        }
      });

    // Sync saved instructor profile overrides from localStorage if applicable
    const activeSlug =
      activeUser.fullName || activeUser.name
        ? normalizeInstructorSlug(activeUser.fullName || activeUser.name)
        : "";
    const overrides = activeSlug
      ? {
          ...(getSavedInstructorOverrides(activeSlug) || {}),
          ...(getSavedInstructorOverrides(`inst-${activeSlug}`) || {}),
        }
      : {};
    setLocalOverrides(overrides);

    setCheckingAuth(false);
  }, [isAuthenticated, user, locale, pathname, router, dispatch]);

  const approvalStatus = (
    user?.approval_status ||
    user?.approvalStatus ||
    "pending"
  ).toLowerCase();
  const isApproved = approvalStatus === "approved";
  const isSettingsPage =
    pathname.includes("/instructor/settings") ||
    pathname.includes("/instructor/profile");

  // Check if current route is studio/creation page
  const isStudioPage =
    pathname.includes("/instructor/courses/new") ||
    pathname.includes("/instructor/courses/create");

  // If instructor is not approved and navigates to a restricted route, redirect to settings and open modal
  useEffect(() => {
    if (mounted && !checkingAuth && !isApproved && !isSettingsPage) {
      setIsPendingModalOpen(true);
      router.replace(`/${locale}/instructor/settings`);
    }
  }, [mounted, checkingAuth, isApproved, isSettingsPage, locale, router]);

  const fullName =
    (mounted ? user?.fullName || user?.name : "") ||
    localOverrides.name ||
    tDash("defaultInstructorName");

  const email = (mounted ? user?.email : "") || "instructor@coachspace.com";
  const avatarPreview =
    (mounted ? user?.avatar : null) || localOverrides.avatar || null;
  const rawHeadline =
    (mounted ? user?.headline : "") || localOverrides.headline || "";
  const isGenericOrStudentHeadline =
    !rawHeadline ||
    rawHeadline.toLowerCase().includes("student") ||
    rawHeadline.includes("طالب") ||
    rawHeadline.toLowerCase().includes("certified instructor") ||
    rawHeadline.includes("مدرب معتمد") ||
    rawHeadline.includes("مدرب موثوق") ||
    rawHeadline.includes("مدرب وخبير معتمد");

  const headline = isGenericOrStudentHeadline
    ? ""
    : getLocalizedHeadline(rawHeadline, isAr, true);

  const handleRestrictedClick =
    (featureLabel: string) => (e: React.MouseEvent) => {
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
      onClick: !isApproved
        ? handleRestrictedClick(tInst("analyticsRevenue"))
        : undefined,
    },
    {
      id: "courses",
      label: tInst("courseLifecycle"),
      icon: BookOpen,
      href: `/${locale}/instructor/courses`,
      onClick: !isApproved
        ? handleRestrictedClick(tInst("courseLifecycle"))
        : undefined,
    },
    {
      id: "students",
      label: tInst("enrolledStudentsNav"),
      icon: Users,
      href: `/${locale}/instructor/students`,
      onClick: !isApproved
        ? handleRestrictedClick(tInst("enrolledStudentsNav"))
        : undefined,
    },
    {
      id: "payout",
      label: tInst("payoutAndBilling"),
      icon: CreditCard,
      href: `/${locale}/instructor/orders`,
      onClick: !isApproved
        ? handleRestrictedClick(tInst("payoutAndBilling"))
        : undefined,
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
      <main className="flex-grow py-5 sm:py-7 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Compact Top Instructor Header Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 text-start w-full sm:w-auto">
              <div className="relative group shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-50 border border-slate-200/90 overflow-hidden shadow-2xs flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={fullName || "Instructor"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-base text-[#0B4F3A]">
                      {fullName.trim().charAt(0).toUpperCase() || "I"}
                    </span>
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                    isApproved ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {fullName}
                  </h2>
                  {isApproved ? (
                    <VerifiedBadge size="sm" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                      <span>{tInst("underReviewBadge")}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs flex-wrap">
                  {headline ? (
                    <>
                      <span className="truncate max-w-xs">{headline}</span>
                      <span className="text-slate-300">•</span>
                    </>
                  ) : null}
                  <span className="text-[11px] text-slate-400 truncate">{email}</span>
                </div>
              </div>
            </div>

            {isApproved && (
              <Link
                href={`/${locale}/instructors/${user?.id || normalizeInstructorSlug(fullName)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-2xs shrink-0 self-end sm:self-auto"
              >
                <span>{isAr ? "عرض الملف العام" : "Public Profile"}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
              </Link>
            )}
          </div>

          {/* Persistent Dashboard Layout: Right Sidebar (RTL) + Main Dynamic Area */}
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-start">
            <aside className="w-full md:w-64 lg:w-72 shrink-0">
              <Sidebar
                items={navItems}
                user={{
                  name: fullName,
                  role: tInst("roleInstructor"),
                  avatarUrl: avatarPreview,
                  isApproved: isApproved,
                }}
              />
            </aside>

            <div className="flex-1 w-full">{children}</div>
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
