"use client";

import React, { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  courseTitle?: string;
  isLoading?: boolean;
}

export function DeleteCourseModal({
  isOpen,
  onClose,
  onConfirm,
  courseTitle,
  isLoading = false,
}: DeleteCourseModalProps) {
  const t = useTranslations("deleteCourseModal");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-course-modal-title"
      >
        {/* Top Header: Warning/Trash Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5 shadow-2xs">
            <Trash2 className="h-6 w-6 text-rose-600" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 id="delete-course-modal-title" className="text-lg font-black text-slate-900 tracking-tight">
              {t("title")}
            </h3>
            {courseTitle && (
              <p className="text-xs font-bold text-slate-500 line-clamp-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                {courseTitle}
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed pt-1">
              {t("description")}
            </p>
          </div>
        </div>

        {/* Action Buttons: Cancel + Confirm Delete */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm cursor-pointer transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("deleting")}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{t("confirmDelete")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCourseModal;
