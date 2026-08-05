"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface FooterProps {
  lang?: "EN" | "AR";
}

export function Footer({ lang }: FooterProps) {
  const t = useTranslations("footer");
  const locale = useLocale() || "en";
  const isAr = locale === "ar" || lang === "AR";

  return (
    <footer
      dir={isAr ? "rtl" : "ltr"}
      className="w-full shrink-0 border-t border-slate-200/70 bg-white/80 py-2.5 sm:py-3 backdrop-blur-xl transition-all duration-300"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2.5 px-4 sm:flex-row sm:px-6 lg:px-8 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F5244]" />
          </span>
          <p>© 2026 {t("rights")}</p>
        </div>

        <div className="flex items-center gap-5 text-[11px] sm:text-xs">
          <Link
            href="#privacy"
            className="text-slate-500 hover:text-[#0F5244] font-semibold transition-colors duration-200"
          >
            {t("privacyPolicy")}
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="#terms"
            className="text-slate-500 hover:text-[#0F5244] font-semibold transition-colors duration-200"
          >
            {t("termsOfService")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

