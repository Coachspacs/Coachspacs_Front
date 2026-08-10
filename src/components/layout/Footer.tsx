"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Globe, Users, Share2 } from "lucide-react";

interface FooterProps {
  lang?: string;
  variant?: "main" | "auth";
}

export function Footer({ lang, variant = "main" }: FooterProps) {
  const t = useTranslations("footer");
  const headerT = useTranslations("header");

  if (variant === "auth") {
    return (
      <footer className="w-full bg-slate-50/90 backdrop-blur-xs shrink-0 py-2 sm:py-2.5 border-t border-slate-200/60 font-sans z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs font-medium text-slate-500">
            {/* Copyright with Green Dot */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F5244] shrink-0" />
              <span>© {new Date().getFullYear()} Coach Space Platform. All rights reserved.</span>
            </div>

            {/* Privacy Policy & Terms Links */}
            <div className="flex items-center gap-3 text-slate-500">
              <Link href="#privacy" className="hover:text-slate-900 transition-colors">
                {t("privacyPolicy")}
              </Link>
              <span className="text-slate-300">·</span>
              <Link href="#terms" className="hover:text-slate-900 transition-colors">
                {t("termsOfService")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#0F5244] text-white shrink-0 border-t border-[#07382E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="pt-12 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Subtitle */}
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {headerT("brandName")}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-emerald-100/80 leading-relaxed max-w-xs">
              {t("brandSubtitle")}
            </p>
          </div>

          {/* Column 2: COMPANY */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#45D1B4] tracking-wider uppercase">
              {t("company")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-emerald-100/80">
              <li>
                <Link href="#about" className="hover:text-white transition-colors">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="#careers" className="hover:text-white transition-colors">
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link href="#blog" className="hover:text-white transition-colors">
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: SUPPORT */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#45D1B4] tracking-wider uppercase">
              {t("support")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-emerald-100/80">
              <li>
                <Link href="#help" className="hover:text-white transition-colors">
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link href="#safety" className="hover:text-white transition-colors">
                  {t("safetyCenter")}
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-white transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONNECT */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#45D1B4] tracking-wider uppercase">
              {t("connect")}
            </h4>
            <div className="flex items-center gap-4 text-emerald-100">
              <Link href="#" aria-label="Website" className="hover:text-[#45D1B4] transition-colors">
                <Globe className="w-5 h-5 stroke-[2]" />
              </Link>
              <Link href="#" aria-label="Community" className="hover:text-[#45D1B4] transition-colors">
                <Users className="w-5 h-5 stroke-[2]" />
              </Link>
              <Link href="#" aria-label="Share" className="hover:text-[#45D1B4] transition-colors">
                <Share2 className="w-5 h-5 stroke-[2]" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-medium text-emerald-200/70">
          <p>© {new Date().getFullYear()} {t("rights")}</p>

          <div className="flex items-center gap-6">
            <Link href="#privacy" className="hover:text-white transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="#terms" className="hover:text-white transition-colors">
              {t("termsOfService")}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
