"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Sparkles, Play, BookOpen, Award, TrendingUp } from "lucide-react";

interface StudentOverviewTabProps {
  courses: any[];
  isLoading?: boolean;
}

export function StudentOverviewTab({
  courses,
  isLoading = false,
}: StudentOverviewTabProps) {
  const tWs = useTranslations("studentWorkspace");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const completedCount = courses.filter((c) => c.isCompleted).length;
  const inProgressCount = courses.filter((c) => !c.isCompleted).length;
  const continueCourse = courses.find((c) => !c.isCompleted) || courses[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {tWs("overviewSubtitle")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {isAr
            ? "نظرة عامة على تقدمك الأكاديمي، الدورات المسجل بها والشهادات المكتسبة"
            : "Overview of your learning progress, active enrollments, and certificates"}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Enrolled */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0F5244]/30 transition-all flex items-start justify-between gap-3 min-w-0 overflow-hidden">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
              {tWs("enrolled")}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {courses.length}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-[#0F5244] bg-emerald-50 px-2 py-0.5 rounded-md mt-2.5 inline-flex items-center gap-1 border border-emerald-100 max-w-full truncate">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span className="truncate">{isAr ? "دورة تدريبية" : "Courses enrolled"}</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-100/80">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0F5244]/30 transition-all flex items-start justify-between gap-3 min-w-0 overflow-hidden">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
              {isAr ? "قيد التقدم" : "In Progress"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-950 leading-tight">
              {inProgressCount}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-2.5 inline-flex items-center gap-1 border border-blue-100 max-w-full truncate">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span className="truncate">{isAr ? "دروس نشطة" : "Active courses"}</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
            <Play className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Certificates */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0F5244]/30 transition-all flex items-start justify-between gap-3 min-w-0 overflow-hidden sm:col-span-2 xl:col-span-1">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
              {tWs("certificatesCount")}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 leading-tight">
              {completedCount}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-2.5 inline-flex items-center gap-1 border border-emerald-100 max-w-full truncate">
              <Award className="w-3 h-3 shrink-0" />
              <span className="truncate">{tWs("earned")}</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/80">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Hero Continue Learning Card */}
      {courses.length > 0 && continueCourse ? (
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0F5244] to-[#07382E] text-white space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 end-0 -mt-8 -me-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-white/10 backdrop-blur-xs">
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </span>
            <h3 className="text-xs font-black text-emerald-200 uppercase tracking-wider">
              {tWs("continueLearning")}
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
            <div className="space-y-2 max-w-xl min-w-0 flex-1">
              <h4 className="text-lg sm:text-2xl font-black leading-tight line-clamp-2">
                {continueCourse.title}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium line-clamp-1">
                {continueCourse.lastLessonTitle ||
                  (isAr ? "تابع من حيث توقفت في الدرس الأخير" : "Pick up right where you left off")}
              </p>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-36 sm:w-48 h-2 bg-white/20 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${continueCourse.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-200">
                  {continueCourse.progress}%
                </span>
              </div>
            </div>

            <Link
              href={`/${locale}/student/learn/${continueCourse.id}`}
              className="px-6 py-3 rounded-2xl bg-white text-[#0F5244] hover:bg-emerald-50 text-xs font-black flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer shadow-md active:scale-98"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{tWs("myCoursesBtn")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {tWs("startJourneyTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              {tWs("startJourneySubtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs font-black shadow-xs hover:shadow-sm transition-all shrink-0 active:scale-98"
          >
            <BookOpen className="w-4 h-4" />
            <span>{tWs("exploreCourses")}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
