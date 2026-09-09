"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Globe, Users, Share2, Mail } from "lucide-react";

interface FooterProps {
  lang?: string;
  variant?: "main" | "auth";
}

export function Footer({ lang, variant = "main" }: FooterProps) {
  const t = useTranslations("footer");
  const headerT = useTranslations("header");
  const currentLocale = useLocale() || (lang ? lang.toLowerCase() : "en");
  const isAr = currentLocale === "ar";

  if (variant === "auth") {
    return (
      <footer
        dir={isAr ? "rtl" : "ltr"}
        className="w-full bg-slate-50/90 backdrop-blur-xs shrink-0 py-2.5 border-t border-slate-200/60 font-sans z-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs font-medium text-slate-500">
            {/* Copyright with Green Dot */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F5244] shrink-0" />
              <span suppressHydrationWarning>
                © {new Date().getFullYear()} Coach Space. All rights reserved.
              </span>
            </div>

            {/* Privacy Policy & Terms Links */}
            <div className="flex items-center gap-3 text-slate-500">
              <Link
                href={`/${currentLocale}/privacy`}
                className="hover:text-slate-900 transition-colors"
              >
                {t("privacyPolicy")}
              </Link>
              <span className="text-slate-300">·</span>
              <Link
                href={`/${currentLocale}/terms`}
                className="hover:text-slate-900 transition-colors"
              >
                {t("termsOfService")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      dir={isAr ? "rtl" : "ltr"}
      className="w-full bg-[#0F5244] text-white shrink-0 border-t border-[#07382E] font-sans"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid with harmonious 12-column layout */}
        <div className="pt-14 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column 1: Brand Logo & Subtitle (4 cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4 text-start">
            <Link
              href={`/${currentLocale}`}
              className="inline-flex items-center gap-3 group cursor-pointer"
            >
              <Image
                src="/images/footer-logo.png"
                alt="Coach Space"
                width={38}
                height={40}
                className="w-auto h-9 sm:h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {headerT("brandName")}
              </span>
            </Link>

            <p className="text-xs sm:text-sm font-medium text-emerald-100/80 leading-relaxed max-w-sm">
              {t("brandSubtitle")}
            </p>

            {/* Direct Support Contact Badge */}
            <div className="pt-1">
              <a
                href="mailto:coachspace4@gmail.com"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200/90 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 w-fit cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#45D1B4]" />
                <span>coachspace4@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Column 2: COMPANY (2 cols) */}
          <div className="space-y-3.5 text-start lg:col-span-2">
            <h4 className="text-xs sm:text-sm font-black text-[#45D1B4] tracking-wider rtl:tracking-normal uppercase">
              {t("company")}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-emerald-100/80">
              <li>
                <Link
                  href={`/${currentLocale}#about`}
                  className="hover:text-white transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}#careers`}
                  className="hover:text-white transition-colors"
                >
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}#blog`}
                  className="hover:text-white transition-colors"
                >
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: SUPPORT (3 cols) */}
          <div className="space-y-3.5 text-start lg:col-span-3">
            <h4 className="text-xs sm:text-sm font-black text-[#45D1B4] tracking-wider rtl:tracking-normal uppercase">
              {t("support")}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-emerald-100/80">
              <li>
                <Link
                  href={`/${currentLocale}#help`}
                  className="hover:text-white transition-colors"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}#safety`}
                  className="hover:text-white transition-colors"
                >
                  {t("safetyCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}#contact`}
                  className="hover:text-white transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONNECT (3 cols) */}
          <div className="space-y-3.5 text-start lg:col-span-3">
            <h4 className="text-xs sm:text-sm font-black text-[#45D1B4] tracking-wider rtl:tracking-normal uppercase">
              {t("connect")}
            </h4>
            <p className="text-xs text-emerald-100/70 font-medium">
              {isAr
                ? "تابعنا وتواصل معنا عبر المنصات الرقمية"
                : "Stay connected across our social channels"}
            </p>
            <div className="flex items-center gap-3 text-emerald-100 pt-1">
              <Link
                href="#"
                aria-label="Website"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-emerald-100 hover:text-white transition-all shadow-2xs hover:scale-105 cursor-pointer"
              >
                <Globe className="w-4 h-4 stroke-[2]" />
              </Link>
              <Link
                href="#"
                aria-label="Community"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-emerald-100 hover:text-white transition-all shadow-2xs hover:scale-105 cursor-pointer"
              >
                <Users className="w-4 h-4 stroke-[2]" />
              </Link>
              <Link
                href="#"
                aria-label="Share"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-emerald-100 hover:text-white transition-all shadow-2xs hover:scale-105 cursor-pointer"
              >
                <Share2 className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-medium text-emerald-200/70">
          <p suppressHydrationWarning className="text-center sm:text-start">
            © {new Date().getFullYear()} {t("rights")}
          </p>

          <div className="flex items-center gap-6">
            <Link
              href={`/${currentLocale}/privacy`}
              className="hover:text-white transition-colors"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href={`/${currentLocale}/terms`}
              className="hover:text-white transition-colors"
            >
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
