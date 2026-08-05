"use client";

import { Globe } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useTranslations, useLocale } from "next-intl";

interface HeaderProps {
  lang?: "EN" | "AR";
  onLanguageToggle?: () => void;
}

export function Header({ lang, onLanguageToggle }: HeaderProps) {
  const t = useTranslations("header");
  const locale = useLocale() || "en";
  const isAr = locale === "ar" || lang === "AR";

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 transition-all duration-300">
      <div className="h-[64px] w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Logo showText={true} isAr={isAr} />
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={onLanguageToggle}
              aria-label={t("switchLanguageLabel")}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#0F5244]/40 hover:text-[#0F5244] hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/15"
            >
              <Globe size={15} className="shrink-0 text-[#0F5244] transition-transform duration-300 group-hover:rotate-45" />
              <span>{t("switchLanguage")}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

