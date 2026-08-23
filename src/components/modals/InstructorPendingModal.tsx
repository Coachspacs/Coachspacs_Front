"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  Mail,
  AlertCircle,
  X,
  Info
} from "lucide-react";
import { authService } from "@/services/auth";
import { updateUser } from "@/features/auth/slice";

export interface InstructorPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function InstructorPendingModal({
  isOpen,
  onClose,
  featureName,
}: InstructorPendingModalProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("instructorPendingModal");
  const router = useRouter();
  const dispatch = useDispatch();

  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "info" | "error";
    message: string;
  } | null>(null);

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

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setFeedback(null);

    try {
      const { user: updatedUser, approval_status } = await authService.syncCurrentUserProfile();
      dispatch(updateUser(updatedUser));

      if (approval_status === "approved") {
        setFeedback({
          type: "success",
          message: t("statusApproved"),
        });
        setTimeout(() => {
          onClose();
          router.push(`/${locale}/instructor/dashboard`);
        }, 1200);
      } else if (approval_status === "rejected") {
        setFeedback({
          type: "error",
          message: t("statusRejected"),
        });
      } else {
        setFeedback({
          type: "info",
          message: t("statusStillPending"),
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "info",
        message: t("statusCheckError"),
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-150 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={t("close")}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8 rtl:pr-0 rtl:pl-8">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {t("title")}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{t("pendingBadge")}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {featureName
                ? t("featureUnavailableWithName", { feature: featureName })
                : t("featureUnavailableDefault")}
            </p>
          </div>
        </div>

        {/* Informative Notice Box */}
        <div className="rounded-2xl bg-amber-50/40 border border-amber-200/50 p-4 space-y-3">
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {t("description")}
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/70 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{t("reviewDuration")}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/70 shadow-2xs">
              <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{t("emailNotification")}</span>
            </div>
          </div>
        </div>

        {/* Live Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : feedback.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedback.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            {t("stayInSettings")}
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white font-bold text-xs shadow-xs transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            <span>
              {isChecking
                ? t("checking")
                : t("checkStatus")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
