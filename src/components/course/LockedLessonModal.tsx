"use client";

import React from "react";
import { X, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

interface LockedLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: () => void;
  lessonTitle: string;
}

export function LockedLessonModal({
  isOpen,
  onClose,
  onEnroll,
  lessonTitle,
}: LockedLessonModalProps) {
  const t = useTranslations("course");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Lock Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0F5244] border border-[#0F5244]/20 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <Lock className="h-8 w-8 stroke-[2.2]" />
        </div>

        {/* Title & Desc */}
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          {t("lockedModalTitle")}
        </h3>

        <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 line-clamp-1 text-emerald-800 bg-emerald-50/80 py-1 px-3 rounded-lg inline-block max-w-full">
          {lessonTitle}
        </p>

        <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed mb-6">
          {t("lockedModalDesc")}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEnroll();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            {t("buyNow")}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            {t("close")}
          </button>
        </div>

      </div>
    </div>
  );
}
