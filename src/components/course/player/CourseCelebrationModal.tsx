"use client";

import React from "react";
import { Sparkles, Award, X } from "lucide-react";

interface CourseCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCertificate: () => void;
  displayCourseTitle?: string;
  t: any;
}

export function CourseCelebrationModal({
  isOpen,
  onClose,
  onNavigateToCertificate,
  displayCourseTitle,
  t,
}: CourseCelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-slate-200/80 max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top decorative gradient glow */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Glowing Trophy / Badge Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 via-emerald-500/15 to-emerald-600/20 border border-amber-300/40 flex items-center justify-center shadow-lg">
          <div className="absolute inset-0 rounded-3xl bg-amber-400/10 animate-ping" style={{ animationDuration: "3s" }} />
          <Award className="w-10 h-10 text-amber-500 shrink-0 drop-shadow-md" />
        </div>

        {/* Title and message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% {t("completeBadge")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("courseCompletedTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            {displayCourseTitle ? `${t("courseCompletedSubtitle")} (${displayCourseTitle})` : t("courseCompletedSubtitle")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onNavigateToCertificate}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#0F5244] hover:bg-[#0b3d32] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>{t("viewAndDownloadCertificate")}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
          >
            {t("continueReview")}
          </button>
        </div>
      </div>
    </div>
  );
}
