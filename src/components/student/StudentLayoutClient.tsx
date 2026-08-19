"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";

export function StudentLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const tStudent = useTranslations("studentSettings");
  const tWs = useTranslations("studentWorkspace");

  const { user } = useSelector((state: RootState) => state.auth);

  // Check if current route is the learning player page (full screen player without dashboard sidebar)
  const isLearnPage = pathname.includes("/student/learn");

  if (isLearnPage) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
        <Header />
        <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  const fullName = user?.fullName || user?.name || (isAr ? "ليلى حسن" : "Alex Johnson");
  const email = user?.email || "student@coachspace.com";
  const avatarPreview = user?.avatar || null;
  const headline = tStudent("defaultHeadline");

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
      <Header />
      <main className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="w-full space-y-4 sm:space-y-6">
          
          {/* Persistent Top Student Profile Header */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
              <div className="relative group shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8F3F1] border-2 border-emerald-200/80 overflow-hidden shadow-2xs flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-xl text-[#0F5244]">{fullName.charAt(0)}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900">{fullName}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[10px] font-extrabold">
                    {tWs("studentAccount")}
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
                user={{
                  name: fullName,
                  role: tStudent("roleStudent"),
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
