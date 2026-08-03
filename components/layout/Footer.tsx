"use client";

import Link from "next/link";

interface FooterProps {
  lang?: "EN" | "AR";
}

export function Footer({ lang = "EN" }: FooterProps) {
  const isAr = lang === "AR";

  return (
    <footer
      dir={isAr ? "rtl" : "ltr"}
      className="w-full shrink-0 border-t border-slate-200/70 bg-white/80 py-2.5 sm:py-3 backdrop-blur-xl transition-all duration-300"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2.5 px-4 sm:flex-row sm:px-6 lg:px-8 text-xs text-slate-500 font-medium">
        {/* Left: Copyright with Subtle Emerald Active Dot */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F5244]" />
          </span>
          <p>© 2026 {isAr ? "منصة كوتش سبيس. جميع الحقوق محفوظة." : "Coach Space Platform. All rights reserved."}</p>
        </div>

        {/* Right: Clean Minimal Links */}
        <div className="flex items-center gap-5 text-[11px] sm:text-xs">
          <Link
            href="#privacy"
            className="text-slate-500 hover:text-[#0F5244] font-semibold transition-colors duration-200"
          >
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="#terms"
            className="text-slate-500 hover:text-[#0F5244] font-semibold transition-colors duration-200"
          >
            {isAr ? "شروط الخدمة" : "Terms of Service"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
