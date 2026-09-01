"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Maximize,
  Minimize,
} from "lucide-react";

interface CoursePlayerSubHeaderProps {
  locale: string;
  isAr: boolean;
  t: (key: string) => string;
  courseTitle: string;
  activeLesson: any;
  progressPercent: number;
  theaterMode: boolean;
  onToggleTheaterMode: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeLessonIndex: number;
  totalLessons: number;
}

export function CoursePlayerSubHeader({
  locale,
  isAr,
  t,
  courseTitle,
  activeLesson,
  progressPercent,
  theaterMode,
  onToggleTheaterMode,
  sidebarOpen,
  onToggleSidebar,
  activeLessonIndex,
  totalLessons,
}: CoursePlayerSubHeaderProps) {
  return (
    <div className="sticky top-16 z-40 w-full bg-white/95 border-b border-slate-200/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 shadow-2xs transition-all">
      {/* Left: Back to Courses Button + Breadcrumbs / Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <Link
          href={`/${locale}/student/courses`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-extrabold transition-all border border-slate-200/60 shadow-2xs cursor-pointer shrink-0"
          title={t("backToCourses")}
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 text-slate-500 shrink-0" />
          <span className="hidden sm:inline">{t("backToCourses")}</span>
        </Link>

        <span className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

        {/* Breadcrumb Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 truncate">
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-[#0F5244] text-[10px] font-black uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {activeLesson?.sectionTitle || (isAr ? "القسم الرئيسي" : "Main Section")}
            </span>
            <span
              className="text-xs sm:text-sm font-extrabold text-slate-800 truncate max-w-xs md:max-w-sm lg:max-w-md"
              title={courseTitle}
            >
              {courseTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Progress & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theater Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheaterMode}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            theaterMode
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs"
          }`}
          title={
            theaterMode
              ? isAr
                ? "الوضع الافتراضي"
                : "Default View"
              : isAr
              ? "وضع المسرح الموسع"
              : "Theater Mode"
          }
        >
          {theaterMode ? <Minimize size={13} /> : <Maximize size={13} />}
          <span className="text-[11px]">
            {theaterMode
              ? isAr
                ? "عادي"
                : "Default"
              : isAr
              ? "مسرح"
              : "Theater"}
          </span>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/70 text-xs font-bold shadow-2xs">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold text-slate-500">
              <span className="hidden sm:inline">{isAr ? "إنجازك:" : "Progress:"}</span>
              <span className="font-mono text-emerald-700 font-black">{progressPercent}%</span>
            </div>
            <div className="w-14 sm:w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-[#0F5244] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Claim Certificate if 100% */}
        {progressPercent === 100 && (
          <Link
            href={`/${locale}/student/certificates/cert-8849`}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm animate-bounce"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">{t("claimCertificate")}</span>
          </Link>
        )}

        {/* Toggle Curriculum Sidebar */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            sidebarOpen
              ? "bg-[#0F5244] border-[#0F5244] text-white shadow-sm"
              : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs"
          }`}
          title={sidebarOpen ? t("collapseSidebar") : t("expandSidebar")}
        >
          <BookOpen size={14} />
          <span className="hidden xl:inline">{t("courseContent")}</span>
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
              sidebarOpen ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {activeLessonIndex + 1}/{totalLessons}
          </span>
        </button>
      </div>
    </div>
  );
}
