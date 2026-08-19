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
import { Award, Plus, LayoutDashboard, BookOpen, Users, CreditCard, Settings } from "lucide-react";

export function InstructorLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tDash = useTranslations("instructorDashboard");

  const { user } = useSelector((state: RootState) => state.auth);

  // Check if current route is studio/creation page
  const isStudioPage = pathname.includes("/instructor/courses/new") || pathname.includes("/instructor/courses/create");

  if (isStudioPage) {
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

  const fullName = user?.fullName || user?.name || tDash("defaultInstructorName");
  const email = user?.email || "instructor@coachspace.com";
  const avatarPreview = user?.avatar || null;
  const headline = tInst("defaultHeadline");

  const navItems = [
    { id: "overview", label: tInst("analyticsRevenue"), icon: LayoutDashboard, href: `/${locale}/instructor/dashboard` },
    { id: "courses", label: tInst("courseLifecycle"), icon: BookOpen, href: `/${locale}/instructor/courses` },
    { id: "students", label: tInst("enrolledStudentsNav"), icon: Users, href: `/${locale}/instructor/students` },
    { id: "payout", label: tInst("payoutAndBilling"), icon: CreditCard, href: `/${locale}/instructor/orders` },
    { id: "settings", label: t("accountSettings"), icon: Settings, href: `/${locale}/instructor/settings` },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
      <Header />
      <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="w-full space-y-4 sm:space-y-6">
          
          {/* Top Instructor Workspace Banner / Header Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-start">
              <div className="relative group shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8F3F1] border-2 border-emerald-200/80 overflow-hidden shadow-2xs flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Instructor" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-xl text-[#0F5244]">{fullName.charAt(0)}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900">{fullName}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[10px] font-extrabold flex items-center gap-1">
                    <Award className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>{tInst("verifiedCoach")}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{headline}</p>
                <p className="text-[11px] text-slate-400 font-medium">{email}</p>
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
    </div>
  );
}
