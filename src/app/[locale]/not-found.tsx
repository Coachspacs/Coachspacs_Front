"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Home, BookOpen } from "lucide-react";

export default function LocaleNotFound() {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const tError = useTranslations("errorPages");

  const title = tError("pageNotFound");
  const desc = tError("pageNotFoundDesc");

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans"
    >
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Visual 404 Display */}
        <div className="space-y-2">
          <span className="text-6xl sm:text-7xl font-black text-[#0F5244]/20 tracking-tighter">
            404
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            {desc}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/${locale}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>{isAr ? "الرئيسية" : "Home"}</span>
          </Link>

          <Link
            href={`/${locale}/catalog`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-extrabold transition-all active:scale-98"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isAr ? "تصفح الدورات" : "Browse Courses"}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
