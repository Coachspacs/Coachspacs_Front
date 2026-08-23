"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Users, BookOpen, Star, DollarSign, PlusCircle, LayoutDashboard, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";

export function InstructorStudioWidget() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach");
  const isApproved = (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase() === "approved";

  if (!isInstructor || !isApproved) {
    return null;
  }

  return (
    <section className="w-full py-6 sm:py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Executive Luxury Studio Dashboard Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md shadow-slate-100 transition-all duration-300">
          
          {/* Header & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F5244] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0F5244]/15">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {t("studioLiveOverview")}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-[#0F5244]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t("instructorBadge")}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t("instructorHubSubtitle")}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/${locale}/instructor/courses/new`}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#08382E] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-[#0F5244]/15 transition-all duration-200 cursor-pointer group"
              >
                <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>{t("createNewCourse")}</span>
              </Link>

              <Link
                href={`/${locale}/instructor/dashboard`}
                className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 transition-all duration-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>{t("instructorDashboardBtn")}</span>
              </Link>
            </div>
          </div>

          {/* 4 Refined Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            
            {/* Stat 1: Total Students */}
            <div className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 hover:border-blue-200 shadow-2xs hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Users className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  <TrendingUp className="w-3 h-3" /> +14%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">1,420</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {t("totalStudentsCount")}
              </div>
            </div>

            {/* Stat 2: Active Courses */}
            <div className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 hover:border-emerald-200 shadow-2xs hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center border border-emerald-100">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  2 Drafts
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">6</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {t("activeCoursesCount")}
              </div>
            </div>

            {/* Stat 3: Rating */}
            <div className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 hover:border-amber-200 shadow-2xs hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  184 Reviews
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">4.9 / 5.0</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {t("instructorRatingValue")}
              </div>
            </div>

            {/* Stat 4: Monthly Earnings */}
            <div className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 hover:border-teal-200 shadow-2xs hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  <ArrowUpRight className="w-3 h-3" /> +22%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">$3,850</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {t("monthlyEarningsValue")}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
