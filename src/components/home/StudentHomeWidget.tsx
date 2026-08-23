"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { BookOpen, CheckCircle2, Award, Play, Sparkles, ArrowRight } from "lucide-react";

export function StudentHomeWidget() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isStudent = mounted && isAuthenticated && (user?.role || "").toLowerCase() === "student";

  if (!isStudent) {
    return null;
  }

  return (
    <section className="w-full py-6 sm:py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Bento Strip Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0F5244]/10 text-[#0F5244] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {t("myLearningProgress")}
            </h2>
          </div>

          <Link
            href={`/${locale}/student/courses`}
            className="text-xs sm:text-sm font-bold text-[#0F5244] hover:underline inline-flex items-center gap-1 group cursor-pointer"
          >
            <span>{t("myLearning")}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 Metric Cards + Continue Learning Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Left: 3 Quick Metric Cards (Col 5) */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3 sm:gap-4">
            
            {/* Metric 1 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">4</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-tight">
                  {t("enrolledCourses")}
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">2</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-tight">
                  {t("completedCourses")}
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">2</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-tight">
                  {t("earnedCertificates")}
                </div>
              </div>
            </div>

          </div>

          {/* Right: Continue Learning Highlight Card (Col 7) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#0F5244] to-[#08382E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6CF8BB]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 z-10 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#6CF8BB] animate-pulse" />
                <span>{t("continueLearningTitle")}</span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white truncate">
                React Enterprise Architecture & Performance
              </h3>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1 max-w-md">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                  <span>{t("lastLesson")}</span>
                  <span className="text-[#6CF8BB]">68%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#6CF8BB] to-emerald-400 rounded-full w-[68%]" />
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/student/courses`}
              className="z-10 bg-[#6CF8BB] hover:bg-[#52e8a6] active:scale-95 text-[#08382E] font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t("continueWatching")}</span>
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}
