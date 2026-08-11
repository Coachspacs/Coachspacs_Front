"use client";

import React, { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle } from "lucide-react";

export interface ArchiveCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseTitle?: string;
}

export function ArchiveCourseModal({
  isOpen,
  onClose,
  onConfirm,
  courseTitle,
}: ArchiveCourseModalProps) {
  const t = useTranslations("archiveModal");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header: Warning Badge + Title */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50/80 border border-rose-100 flex items-center justify-center text-[#0F5244] shrink-0 mt-0.5 shadow-2xs">
            <AlertTriangle className="h-5 w-5 text-emerald-800" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {t("title")}
            </h3>
            {courseTitle && (
              <p className="text-xs font-bold text-slate-400 line-clamp-1">
                {courseTitle}
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed pt-1">
              {t("description")}
            </p>
          </div>
        </div>

        {/* Action Buttons: Cancel + Archive */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm cursor-pointer transition-all active:scale-98"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-98"
          >
            {t("archive")}
          </button>
        </div>
      </div>
    </div>
  );
}
