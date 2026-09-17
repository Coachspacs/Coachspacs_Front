"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  GraduationCap,
  LayoutDashboard,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface InstructorPurchaseNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

export function InstructorPurchaseNoticeModal({
  isOpen,
  onClose,
  courseTitle,
}: InstructorPurchaseNoticeModalProps) {
  const t = useTranslations("instructorModal");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-center animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={t("stayHere")}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Badge Lockup */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200/80 text-amber-700 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{t("badge")}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2.5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {t("title")}
          </h3>

          {courseTitle && (
            <p className="text-xs font-bold text-[#0F5244] bg-[#E8F3F1] px-3 py-1 rounded-lg inline-block line-clamp-1 max-w-full">
              « {courseTitle} »
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
            {t("description")}
          </p>

          <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
            {t("subtext")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Go to Studio */}
          <Link
            href={`/${locale}/instructor/dashboard`}
            onClick={onClose}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer active:scale-98"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>{t("goToStudio")}</span>
          </Link>

          {/* Sign in as student */}
          <Link
            href={`/${locale}/login`}
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer active:scale-98"
          >
            <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{t("signInAsStudent")}</span>
          </Link>
        </div>

        {/* Dismiss Footer Link */}
        <div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {t("stayHere")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstructorPurchaseNoticeModal;
