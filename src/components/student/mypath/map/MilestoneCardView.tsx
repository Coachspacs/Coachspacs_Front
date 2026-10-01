"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Check,
  Lock,
  BookOpen,
  SkipForward,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { MilestoneCardViewProps } from "./types";

export function MilestoneCardView({
  milestone,
  idx,
  isExpanded,
  isCompleted,
  isSkipped,
  isActive,
  isEnrolled,
  firstCourse,
  courseTitle,
  courseDesc,
  isAr,
  locale,
  onToggleExpand,
  onToggleCompleted,
  onToggleSkip,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isMobile = false,
}: MilestoneCardViewProps) {
  return (
    <AnimatePresence mode="wait">
      {isExpanded ? (
        /* ------------------------------------------------------------- */
        /* A) EXPANDED STATE (Detailed View with AI Reason & Purchase) */
        /* ------------------------------------------------------------- */
        <motion.div
          key={`expanded-${milestone.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={`${
            isMobile ? "w-full" : "w-64 sm:w-80"
          } rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${
            isCompleted
              ? "bg-emerald-50/95 border-emerald-300/80 text-emerald-950 shadow-[0_12px_32px_-4px_rgba(16,185,129,0.18)]"
              : isActive
                ? "bg-white border-emerald-500/90 ring-2 ring-emerald-500/25 text-slate-900 shadow-[0_18px_42px_-6px_rgba(15,82,68,0.22),0_6px_16px_-3px_rgba(16,185,129,0.15)]"
                : "bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_12px_32px_-4px_rgba(15,82,68,0.10),0_4px_12px_-2px_rgba(0,0,0,0.04)]"
          }`}
        >
          {/* Top Bar: Station Badge + Status Badge + Collapse Action */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                {isAr ? `المحطة ${idx + 1}` : `Stage ${idx + 1}`}
              </span>

              {/* Enrollment status badge */}
              {isEnrolled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <Check className="w-2.5 h-2.5" />
                  <span>{isAr ? "مسجل" : "Enrolled"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold border border-amber-200/70">
                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                  <span>{isAr ? "متاحة للشراء" : "Purchase Req."}</span>
                </span>
              )}
            </div>

            {/* Status / Collapse button */}
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={isAr ? "طي التفاصيل" : "Collapse"}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Course Title & Description */}
          <div className="pt-2.5 space-y-1.5 text-start">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-[#0F5244] shrink-0 mt-0.5" />
              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                {courseTitle}
              </h4>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {courseDesc}
            </p>
          </div>

          {/* Bottom Actions: Play/Buy CTA + Done Toggle */}
          <div className="pt-3 mt-2.5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {firstCourse &&
                (isEnrolled ? (
                  <Link
                    href={`/${locale}/student/learn/${firstCourse.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0F5244] to-[#146654] hover:from-[#09352C] hover:to-[#0F5244] text-white text-xs font-black shadow-[0_4px_12px_rgba(15,82,68,0.25)] active:scale-95 transition-all group cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current text-[#38E09D] group-hover:scale-110 transition-transform" />
                    <span>{isAr ? "ابدأ التعلّم" : "Start Learning"}</span>
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/courses/${firstCourse.slug || firstCourse.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0F5244] to-[#146654] hover:from-[#09352C] hover:to-[#0F5244] text-white text-xs font-black shadow-[0_4px_12px_rgba(15,82,68,0.25)] active:scale-95 transition-all group cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3 text-[#38E09D]" />
                    <span>
                      {isAr ? "شراء الدورة والتسجيل" : "Enroll & Purchase"}
                    </span>
                  </Link>
                ))}

              <button
                type="button"
                onClick={onToggleCompleted}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                  isCompleted
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                    : "bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] border border-emerald-200/60"
                }`}
              >
                {isCompleted
                  ? isAr
                    ? "تراجع"
                    : "Undo"
                  : isAr
                    ? "إنجاز"
                    : "Done"}
              </button>
            </div>

            {/* Skip & Reorder Controls */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/80 text-[10px] text-slate-500">
              <button
                type="button"
                onClick={onToggleSkip}
                className="inline-flex items-center gap-1 hover:text-amber-700 font-bold transition-colors cursor-pointer"
              >
                <SkipForward className="w-3 h-3" />
                <span>
                  {isSkipped
                    ? isAr
                      ? "إلغاء التخطي"
                      : "Unskip"
                    : isAr
                      ? "تخطي هذه المحطة"
                      : "Skip Step"}
                </span>
              </button>

              {/* Step Reorder Controls (Up / Down) */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400">
                  {isAr ? "الترتيب:" : "Reorder:"}
                </span>
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.();
                  }}
                  title={isAr ? "تقديم المحطة للأعلى" : "Move stage up"}
                  className={`p-1 rounded-md border text-xs font-bold transition-all ${
                    canMoveUp
                      ? "bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border-slate-200 cursor-pointer"
                      : "opacity-30 border-transparent text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.();
                  }}
                  title={isAr ? "تأخير المحطة للأسفل" : "Move stage down"}
                  className={`p-1 rounded-md border text-xs font-bold transition-all ${
                    canMoveDown
                      ? "bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border-slate-200 cursor-pointer"
                      : "opacity-30 border-transparent text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <ArrowDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ------------------------------------------------------------- */
        /* B) COMPACT / COLLAPSED STATE (Clean, balanced and elegant)   */
        /* ------------------------------------------------------------- */
        <motion.div
          key={`compact-${milestone.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.02 }}
          onClick={onToggleExpand}
          className={`${
            isMobile ? "w-full" : "w-56 sm:w-68"
          } rounded-2xl px-4 py-3 border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group/compact ${
            isCompleted
              ? "bg-emerald-50/90 border-emerald-200/80 text-emerald-950"
              : isSkipped
                ? "bg-slate-100/90 border-slate-200 text-slate-500 opacity-75"
                : isActive
                  ? "bg-white border-emerald-500/80 ring-2 ring-emerald-500/20 text-slate-900 shadow-md"
                  : "bg-white/95 border-slate-200/90 hover:border-emerald-300 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100/70">
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {isAr ? `المحطة ${idx + 1}` : `Stage ${idx + 1}`}
            </span>

            {isCompleted ? (
              <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                <span>{isAr ? "مكتملة" : "Done"}</span>
              </span>
            ) : isSkipped ? (
              <span className="text-[10px] font-bold text-slate-400">
                {isAr ? "تم التخطي" : "Skipped"}
              </span>
            ) : isActive ? (
              <span className="text-[10px] font-bold text-[#0F5244] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>{isAr ? "الحالية" : "Active"}</span>
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>{isAr ? "قادمة" : "Next"}</span>
              </span>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover/compact:text-[#0F5244] transition-colors">
                {courseTitle}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {milestone.durationWeeks}{" "}
                {isAr ? "أسابيع دراسية" : "weeks of study"}
              </p>
            </div>
            <div className="p-1 rounded-lg bg-slate-100 group-hover/compact:bg-emerald-100 group-hover/compact:text-emerald-800 text-slate-400 transition-colors shrink-0">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MilestoneCardView;
