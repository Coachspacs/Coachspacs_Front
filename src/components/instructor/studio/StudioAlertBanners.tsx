"use client";

import React from "react";
import { Clock, AlertTriangle, CheckCircle2, AlertCircle, X } from "lucide-react";

interface StudioAlertBannersProps {
  isUnderReview: boolean;
  courseStatus: string;
  rejectionReason: string | null;
  saveSuccess: boolean;
  apiError: string | null;
  setApiError: (val: string | null) => void;
  t: any;
  tInst: any;
}

export function StudioAlertBanners({
  isUnderReview,
  courseStatus,
  rejectionReason,
  saveSuccess,
  apiError,
  setApiError,
  t,
  tInst,
}: StudioAlertBannersProps) {
  return (
    <>
      {/* Course Under Review Notification Banner */}
      {isUnderReview && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex items-start gap-3.5 shadow-2xs animate-in fade-in">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-amber-950 text-sm sm:text-base">
                {t("courseUnderReviewBannerTitle")}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[11px] font-black">
                {t("awaitingReviewBadge")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/90 font-medium leading-relaxed">
              {t("courseUnderReviewBannerDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Course Rejected Alert Banner with Rejection Reason */}
      {courseStatus === "rejected" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3.5 shadow-xs animate-in fade-in">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-rose-950 text-sm sm:text-base">
                {t("courseRejectedBannerTitle")}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[11px] font-black">
                {tInst("statusRejected")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-900/90 font-medium leading-relaxed">
              {t("courseRejectedBannerDesc")}
            </p>

            {/* Highlighted Reason Box */}
            <div className="p-3.5 rounded-2xl bg-white border border-rose-200/90 shadow-2xs text-xs font-semibold text-rose-900 leading-relaxed flex items-start gap-2.5">
              <span className="font-black text-rose-950 shrink-0">
                {tInst("rejectionReasonLabel")}
              </span>
              <span className="text-rose-800">
                {rejectionReason || t("rejectionReasonFallback")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Save Draft Success Notification Toast */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-[var(--color-primary-main)] text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-[var(--color-primary-main)] shrink-0" />
          <span>{t("draftSavedSuccess")}</span>
        </div>
      )}

      {/* API Error Notification Toast */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="text-rose-600 hover:text-rose-800 p-1 rounded-lg cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
