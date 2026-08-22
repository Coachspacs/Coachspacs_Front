"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  Sparkles,
  PlusCircle,
  LayoutDashboard,
  Users,
  BookOpen,
  Star,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";

export function InstructorHero() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = user?.name || user?.fullName || user?.email?.split("@")[0] || "";
  const isInstructor = mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach");
  const isApproved = (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase() === "approved";

  if (!isInstructor) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-100/70 via-white to-slate-50 pt-10 sm:pt-14 pb-8 sm:pb-12 border-b border-slate-200/60 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Greeting & Actions (Col 7) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:text-right z-10">
            
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs mb-5 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#0F5244] animate-pulse" />
              <span>{t("welcomeInstructor", { name: displayName })}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isApproved
                    ? "bg-emerald-50 text-[#0F5244] border border-emerald-200/70"
                    : "bg-amber-50 text-amber-900 border border-amber-300"
                }`}
              >
                {isApproved ? t("instructorBadge") : t("instructorPendingBadge")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] mb-4">
              {t("instructorHeroTitle")}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mb-8 font-medium">
              {t("instructorHeroSubtitle")}
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              {isApproved ? (
                <>
                  <Link
                    href={`/${locale}/instructor/courses/new`}
                    className="inline-flex items-center gap-2.5 bg-[#0F5244] hover:bg-[#08382E] active:scale-95 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-lg shadow-[#0F5244]/15 transition-all duration-200 cursor-pointer group"
                  >
                    <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    <span>{t("createNewCourse")}</span>
                  </Link>

                  <Link
                    href={`/${locale}/instructor/dashboard`}
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-200/90 font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-xs transition-all duration-200 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    <span>{t("instructorDashboardBtn")}</span>
                  </Link>
                </>
              ) : (
                <Link
                  href={`/${locale}/instructor/settings`}
                  className="inline-flex items-center gap-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-lg shadow-amber-600/15 transition-all duration-200 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t("instructorPendingBadge")}</span>
                </Link>
              )}
            </div>

          </div>

          {/* Right Column: Studio Command Grid or Pending Card (Col 5) */}
          <div className="lg:col-span-5 w-full">
            {isApproved ? (
              /* Verified Instructor: Sleek 2x2 Bento Performance Card */
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                
                {/* Card Top Strip */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0F5244]/10 text-[#0F5244] flex items-center justify-center font-black text-xs">
                      CS
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{t("studioLiveOverview")}</div>
                      <div className="text-[10px] font-medium text-slate-400">Live Studio Analytics</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                {/* 4 Metrics Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  
                  {/* Metric 1 */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">+14%</span>
                    </div>
                    <div className="text-xl font-black text-slate-900">1,420</div>
                    <div className="text-[11px] font-semibold text-slate-500">{t("totalStudentsCount")}</div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <BookOpen className="w-4 h-4 text-[#0F5244]" />
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border">4 Pub</span>
                    </div>
                    <div className="text-xl font-black text-slate-900">6</div>
                    <div className="text-[11px] font-semibold text-slate-500">{t("activeCoursesCount")}</div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">184</span>
                    </div>
                    <div className="flex items-center gap-1 text-xl font-black text-slate-900">
                      <span>4.9</span>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">{t("instructorRatingValue")}</div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <DollarSign className="w-4 h-4 text-teal-600" />
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">+22%</span>
                    </div>
                    <div className="text-xl font-black text-slate-900">$3,850</div>
                    <div className="text-[11px] font-semibold text-slate-500">{t("monthlyEarningsValue")}</div>
                  </div>

                </div>

                {/* Footer Status */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium">{t("nextPayoutNotice")}</span>
                  <span className="font-black text-[#0F5244]">$3,850.00</span>
                </div>

              </div>
            ) : (
              /* Unverified: Status Progress Card */
              <div className="bg-white rounded-3xl p-6 border border-amber-300/80 shadow-lg shadow-amber-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{t("verificationTrackTitle")}</h3>
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>{t("statusPending")}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  {t("verificationTrackDesc")}
                </p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-2/3" />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
