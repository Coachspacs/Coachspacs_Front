"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw, Home, ChevronDown } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const [showDetails, setShowDetails] = useState(false);
  const tError = useTranslations("errorPages");

  const title = tError("somethingWentWrong");
  const desc = tError("errorDescription");
  const tryAgainText = tError("tryAgain");
  const backHomeText = tError("backToHome");

  useEffect(() => {
    // Log client exception
    console.error("[App Router Error Boundary]:", error);
  }, [error]);

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans"
    >
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icon */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
          <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{tryAgainText}</span>
          </button>

          <Link
            href={`/${locale}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-extrabold transition-all active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>{backHomeText}</span>
          </Link>
        </div>

        {/* Technical Error Details Accordion (for debugging) */}
        {error?.message && (
          <div className="pt-4 border-t border-slate-100 text-start">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span>{isAr ? "تفاصيل تقنية (للمطورين)" : "Technical Details"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${showDetails ? "rotate-180" : ""}`} />
            </button>

            {showDetails && (
              <div className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-40 leading-normal">
                <p className="text-red-400 font-bold">{error.name}: {error.message}</p>
                {error.digest && <p className="text-slate-400 mt-1">Digest: {error.digest}</p>}
                {error.stack && <pre className="mt-2 text-[10px] text-slate-400 whitespace-pre-wrap">{error.stack}</pre>}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
