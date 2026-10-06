"use client";

import React, { useEffect } from "react";
import { History, RotateCcw, X, Clock, User, Shield, FileText, CheckCircle } from "lucide-react";
import { LegalPagesContent } from "@/types/cms";

export interface LegalVersionSnapshot {
  id: string;
  savedAt: string;
  savedBy: string;
  data: LegalPagesContent;
}

interface LegalVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: LegalVersionSnapshot[];
  onRestore: (snapshot: LegalVersionSnapshot) => void;
  isAr?: boolean;
}

export function LegalVersionHistoryModal({
  isOpen,
  onClose,
  versions = [],
  onRestore,
  isAr = true,
}: LegalVersionHistoryModalProps) {
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
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-brand-dark flex items-center justify-center shrink-0 border border-slate-200/80">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 id="history-modal-title" className="text-base sm:text-lg font-black text-slate-900">
                {isAr ? "سجل النسخ السابقة للصفحات القانونية" : "Legal Pages Version History"}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {isAr
                  ? "استعراض واستعادة النسخ المنشورة والمحفوظة مسبقاً"
                  : "Review and restore previously published snapshots"}
              </p>
            </div>
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

        {/* Version List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {versions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-600">
                {isAr ? "لا توجد نسخ سابقة محفوظة بعد" : "No previous versions saved yet"}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isAr
                  ? "يتم حفظ لقطة (Snapshot) تلقائياً مع كل عملية نشر للسياسات القانونية."
                  : "A snapshot is automatically recorded every time you publish legal updates."}
              </p>
            </div>
          ) : (
            versions.map((ver, idx) => {
              const privacyClausesCount = ver.data?.privacy?.sections?.length || 0;
              const termsClausesCount = ver.data?.terms?.sections?.length || 0;
              const formattedDate = new Date(ver.savedAt).toLocaleString(isAr ? "ar-EG" : "en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={ver.id || idx}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1.5 text-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900">
                        {formattedDate}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-brand-dark bg-slate-100/80 px-2 py-0.5 rounded-full">
                          {isAr ? "أحدث نسخة" : "Latest"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ver.savedBy || "Admin"}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-brand-dark" />
                        <span>{isAr ? `${privacyClausesCount} بند خصوصية` : `${privacyClausesCount} Privacy clauses`}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-brand-dark" />
                        <span>{isAr ? `${termsClausesCount} بند شروط` : `${termsClausesCount} Terms clauses`}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          isAr
                            ? "هل تريد استعادة هذه النسخة في المحرر؟ سيتم استبدال المسودة الحالية ببيانات هذه النسخة."
                            : "Restore this version into the editor? This will replace current draft content with this snapshot."
                        )
                      ) {
                        onRestore(ver);
                        onClose();
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-brand-dark text-slate-700 hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isAr ? "استعادة هذه النسخة" : "Restore Version"}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
