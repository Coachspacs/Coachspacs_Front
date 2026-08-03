"use client";

import { Globe } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
  lang?: "EN" | "AR";
  onLanguageToggle?: () => void;
}

export function Header({ lang = "EN", onLanguageToggle }: HeaderProps) {
  const isAr = lang === "AR";

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 transition-all duration-300">
      <div className="h-[64px] w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand: Logo Image + Website Name */}
          <div className="flex items-center">
            <Logo showText={true} isAr={isAr} />
          </div>

          {/* Right Control: Language Switcher Only */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onLanguageToggle}
              aria-label={isAr ? "Switch to English" : "التحويل إلى العربية"}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#0F5244]/40 hover:text-[#0F5244] hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/15"
            >
              <Globe size={15} className="shrink-0 text-[#0F5244] transition-transform duration-300 group-hover:rotate-45" />
              <span>{isAr ? "English" : "العربية"}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
