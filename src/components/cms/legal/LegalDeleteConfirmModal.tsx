"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface LegalDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clauseIndex: number;
  clauseTitle?: string;
  isAr?: boolean;
}

export function LegalDeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  clauseIndex,
  clauseTitle = "",
  isAr = true,
}: LegalDeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-clause-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-start">
          <h3
            id="delete-clause-title"
            className="text-base sm:text-lg font-black text-slate-900"
          >
            {isAr ? "تأكيد حذف البند القانوني" : "Delete Clause Confirmation"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isAr
              ? `هل أنت متأكد من رغبتك في حذف البند رقم (${clauseIndex + 1}) "${clauseTitle || "بدون عنوان"}"؟ لا يمكن التراجع عن هذه العملية بعد حفظ التغييرات.`
              : `Are you sure you want to delete clause #${clauseIndex + 1} "${clauseTitle || "Untitled"}"? This action cannot be undone once changes are saved.`}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isAr ? "حذف البند" : "Delete Clause"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
