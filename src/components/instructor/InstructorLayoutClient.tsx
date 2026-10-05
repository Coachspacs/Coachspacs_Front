"use client";

import React, { useState, useEffect } from "react";
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
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
} from "lucide-react";
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

    const isAdminUser = Boolean(
      activeUser?.is_superuser === true ||
      (activeUser as any)?.isSuperuser === true ||
      activeUser.role === "admin" ||
      activeUser.role === "superuser"
    );

    if (isAdminUser) {
      router.replace(`/${locale}/admin/cms`);
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
    let isAlreadyApproved = false;
    if (activeUser) {
      const currentHeadline = activeUser.headline || "";
      const isHeadlineOk = 
          !currentHeadline.toLowerCase().includes("student") &&
          !currentHeadline.includes("طالب") &&
          !currentHeadline.toLowerCase().includes("certified instructor") &&
          !currentHeadline.includes("مدرب معتمد") &&
          !currentHeadline.includes("مدرب موثوق") &&
          !currentHeadline.includes("مدرب وخبير معتمد");

      const expectedHeadline = isHeadlineOk ? currentHeadline : "";
      isAlreadyApproved = activeUser.role === "instructor" && 
                          (activeUser.approval_status === "approved" || activeUser.approvalStatus === "approved") &&
                          currentHeadline === expectedHeadline;
    }

    if (!isAlreadyApproved && !(window as any).__hasCheckedInstructorDashboard) {
      (window as any).__hasCheckedInstructorDashboard = true;
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
            if (activeUser?.approval_status !== "pending") {
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
          }
        });
    }

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
    if (mounted && !checkingAuth && isAuthenticated && user && !isApproved && !isSettingsPage) {
      setIsPendingModalOpen(true);
      router.replace(`/${locale}/instructor/settings`);
    }
  }, [mounted, checkingAuth, isAuthenticated, user, isApproved, isSettingsPage, locale, router]);

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
