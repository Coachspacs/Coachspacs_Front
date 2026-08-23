"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { AlertTriangle, X } from "lucide-react";

export function InstructorStatusBanner() {
  const t = useTranslations("home");
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = mounted && isAuthenticated && user?.role === "instructor";
  const isApproved = (user?.approval_status || (user as any)?.approvalStatus) === "approved";

  // Only show for logged in instructors who are pending approval / unverified
  if (!isInstructor || isApproved || dismissed) {
    return null;
  }

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-400/30 text-amber-950 px-4 py-3 sm:py-3.5 transition-all">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        
        {/* Message only */}
        <div className="flex items-center gap-3 text-left rtl:text-right">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 border border-amber-400/30">
            <AlertTriangle className="w-4 h-4 animate-pulse text-amber-600" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-amber-900">
            {t("instructorBannerTitle")}
          </span>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("dismissBanner")}
          title={t("dismissBanner")}
          className="p-1.5 rounded-lg text-amber-800/70 hover:text-amber-900 hover:bg-amber-200/50 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
