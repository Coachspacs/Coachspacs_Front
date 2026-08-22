"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { CheckCircle2, Clock, Lock, ShieldCheck } from "lucide-react";

export function InstructorPendingWidget() {
  const t = useTranslations("home");
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach");
  const isApproved = (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase() === "approved";

  // Only show for instructors that are not approved yet
  if (!isInstructor || isApproved) {
    return null;
  }

  return (
    <section className="w-full py-8 sm:py-10 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-[32px] p-7 sm:p-10 border border-amber-300/70 shadow-xl shadow-amber-500/5">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-7 border-b border-amber-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t("verificationTrackTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-2xl">
                  {t("verificationTrackDesc")}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-amber-100/80 text-amber-900 border border-amber-300 px-4 py-2 rounded-full text-xs font-black shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>{t("statusPending")}</span>
            </div>
          </div>

          {/* 3 Step Track Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Step 1: Account Created (Completed) */}
            <div className="bg-white border-2 border-emerald-300/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t("statusCompleted")}</span>
                </span>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">
                  1. {t("stepAccountCreated")}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t("stepAccountCreatedDesc")}
                </p>
              </div>
            </div>

            {/* Step 2: Admin Review (In Progress) */}
            <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg shadow-amber-400/10 ring-4 ring-amber-400/15">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                  <span>{t("statusPending")}</span>
                </span>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">
                  2. {t("stepAdminReview")}
                </div>
                <p className="text-xs text-amber-700 font-medium mt-1">
                  {t("stepAdminReviewDesc")}
                </p>
              </div>
            </div>

            {/* Step 3: Publish Courses (Locked until approved) */}
            <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between opacity-80">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  <span>{t("statusLocked")}</span>
                </span>
              </div>
              <div>
                <div className="text-sm font-black text-slate-800">
                  3. {t("stepPublishActive")}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t("stepPublishActiveDesc")}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
