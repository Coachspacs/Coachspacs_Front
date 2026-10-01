"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface StudioSuccessModalProps {
  isOpen: boolean;
  courseStatus: string;
  locale: string;
  router: any;
  onClose: () => void;
  t: any;
}

export function StudioSuccessModal({
  isOpen,
  courseStatus,
  locale,
  router,
  onClose,
  t,
}: StudioSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#0F5244] flex items-center justify-center mx-auto shadow-sm">
          <Sparkles size={32} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900">
            {courseStatus === "published"
              ? t("courseUpdatedSuccess")
              : t("courseSubmittedSuccess")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {courseStatus === "published"
              ? t("courseUpdatedSuccessDesc")
              : t("courseSubmittedSuccessDesc")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            router.push(`/${locale}/instructor/courses`);
          }}
          className="w-full py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer"
        >
          {t("backToCourses")}
        </button>
      </div>
    </div>
  );
}
