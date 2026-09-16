"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  Mail,
  Lock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface FooterProps {
  lang?: string;
  variant?: "main" | "auth";
}

// Crisp SVG icons for social media platforms
function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8m1.39 9.74v-8.37H5.07v8.37z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
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
        className="w-full bg-white/80 backdrop-blur-md shrink-0 py-3.5 border-t border-slate-200/80 font-sans z-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-500">
            {/* Copyright */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F5244] shrink-0" />
              <span suppressHydrationWarning>
                © {new Date().getFullYear()} Coach Space. {t("rights")}
              </span>
            </div>

            {/* Privacy Policy & Terms Links */}
            <div className="flex items-center gap-4 text-slate-500">
              <Link
                href={`/${currentLocale}/certificates/verify`}
                className="hover:text-[#0F5244] font-semibold transition-colors duration-150"
              >
                {t("verifyCertificate")}
              </Link>
              <span className="text-slate-300">·</span>
              <Link
                href={`/${currentLocale}/privacy`}
                className="hover:text-[#0F5244] font-semibold transition-colors duration-150"
              >
                {t("privacyPolicy")}
              </Link>
              <span className="text-slate-300">·</span>
              <Link
                href={`/${currentLocale}/terms`}
                className="hover:text-[#0F5244] font-semibold transition-colors duration-150"
              >
                {t("termsOfService")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Official Real Social Links with tailored brand colors on hover/active
  const socialLinks = [
    {
      name: "Instagram",
      handle: "@coachspace0",
      href: "https://www.instagram.com/coachspace0?stkn=bWt5MmJ5OW1hYWQ2",
      icon: InstagramIcon,
      cardClass:
        "hover:border-[#E1306C]/50 hover:bg-gradient-to-r hover:from-white/[0.08] hover:to-[#E1306C]/15 active:scale-[0.98] group/insta",
      iconBoxClass:
        "bg-white/[0.08] text-white group-hover/insta:bg-gradient-to-tr group-hover/insta:from-[#F58529] group-hover/insta:via-[#DD2A7B] group-hover/insta:to-[#8134AF] group-hover/insta:shadow-md group-hover/insta:shadow-pink-900/30 transition-all duration-200",
      textHoverClass: "group-hover/insta:text-pink-100",
      arrowHoverClass: "group-hover/insta:text-pink-300",
    },
    {
      name: "LinkedIn",
      handle: "Coach Space",
      href: "https://www.linkedin.com/company/coach-space",
      icon: LinkedInIcon,
      cardClass:
        "hover:border-[#0A66C2]/60 hover:bg-gradient-to-r hover:from-white/[0.08] hover:to-[#0A66C2]/15 active:scale-[0.98] group/linkedin",
      iconBoxClass:
        "bg-white/[0.08] text-white group-hover/linkedin:bg-[#0A66C2] group-hover/linkedin:shadow-md group-hover/linkedin:shadow-sky-900/30 transition-all duration-200",
      textHoverClass: "group-hover/linkedin:text-sky-100",
      arrowHoverClass: "group-hover/linkedin:text-sky-300",
    },
  ];

  return (
    <footer
      dir={isAr ? "rtl" : "ltr"}
      className="relative w-full bg-[#0F5244] text-white shrink-0 font-sans border-t border-[#07382E]"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid: 3-column layout */}
        <div className="pt-12 sm:pt-14 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">
          
          {/* Column 1: Brand Identity & Support (5 cols on Desktop, 2 cols on Tablet) */}
          <div className="md:col-span-2 lg:col-span-5 space-y-4 text-start">
            {/* Elegant Glassmorphic Brand Box */}
            <Link
              href={`/${currentLocale}`}
              className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 hover:border-[#45D1B4]/40 backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center group-hover:bg-[#45D1B4]/15 group-hover:border-[#45D1B4]/30 transition-all duration-200 shrink-0">
                <Image
                  src="/images/brand-logo-white.png"
                  alt="Coach Space"
                  width={32}
                  height={32}
                  className="w-auto h-5 sm:h-5.5 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none group-hover:text-white transition-colors">
                {headerT("brandName")}
              </span>
            </Link>

            <p className="text-[13px] sm:text-sm font-normal text-emerald-100/75 leading-relaxed max-w-md antialiased">
              {t("brandSubtitle")}
            </p>

            {/* Eye-catching & Stylish Support Contact Pill */}
            <div className="pt-1">
              <a
                href="mailto:coachspace4@gmail.com"
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/20 hover:border-[#45D1B4]/40 text-emerald-100 transition-all duration-200 group cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 rounded-md bg-[#45D1B4]/20 flex items-center justify-center text-[#45D1B4] group-hover:bg-[#45D1B4] group-hover:text-[#0F5244] transition-colors duration-200 shrink-0">
                  <Mail className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium font-sans tracking-wide text-emerald-100/90 group-hover:text-white transition-colors">
                  coachspace4@gmail.com
                </span>
              </a>
            </div>
          </div>

          {/* Column 2: Explore Platform (3 cols on Desktop, 1 col on Tablet) */}
          <div className="md:col-span-1 lg:col-span-3 space-y-4 text-start">
            <h4 className="text-xs sm:text-sm font-bold text-[#45D1B4] tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45D1B4]" />
              {t("explore")}
            </h4>
            <ul className="space-y-2.5 text-[13px] sm:text-sm font-normal text-emerald-100/80">
              <li>
                <Link
                  href={`/${currentLocale}/courses`}
                  className="inline-flex items-center gap-2 text-emerald-100/80 hover:text-[#45D1B4] group transition-colors duration-150"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 rtl:rotate-180 group-hover:text-[#45D1B4] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform duration-150" />
                  <span>{t("courses")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/categories`}
                  className="inline-flex items-center gap-2 text-emerald-100/80 hover:text-[#45D1B4] group transition-colors duration-150"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 rtl:rotate-180 group-hover:text-[#45D1B4] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform duration-150" />
                  <span>{t("categories")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/certificates/verify`}
                  className="inline-flex items-center gap-2 text-emerald-100/80 hover:text-[#45D1B4] group transition-colors duration-150"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 rtl:rotate-180 group-hover:text-[#45D1B4] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform duration-150" />
                  <span>{t("verifyCertificate")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Follow Us (4 cols on Desktop, 1 col on Tablet) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-4 text-start">
            <h4 className="text-xs sm:text-sm font-bold text-[#45D1B4] tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45D1B4]" />
              {t("connect")}
            </h4>
            <p className="text-[13px] text-emerald-100/70 font-normal leading-relaxed">
              {t("connectSubtitle")}
            </p>

            {/* Compact & Elegant Social Media Cards with Brand Colors on Hover & Click */}
            <div className="space-y-2 pt-0.5">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-emerald-100 transition-all duration-200 cursor-pointer ${item.cardClass}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBoxClass}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-start">
                        <p className="text-xs font-semibold text-white leading-tight">
                          {item.name}
                        </p>
                        <p
                          className={`text-[11px] text-emerald-200/70 transition-colors duration-150 ${item.textHoverClass}`}
                        >
                          {item.handle}
                        </p>
                      </div>
                    </div>
                    <ExternalLink
                      className={`w-3.5 h-3.5 text-emerald-200/40 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all duration-150 shrink-0 ${item.arrowHoverClass}`}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Perfectly aligned Copyright, Legal links, and SSL status */}
        <div className="border-t border-white/[0.08] py-5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs font-medium text-emerald-200/75">
          
          {/* Copyright */}
          <div
            className="flex items-center gap-2 text-center md:text-start shrink-0 order-2 md:order-1"
            suppressHydrationWarning
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#45D1B4] shrink-0" />
            <span>
              © {new Date().getFullYear()} Coach Space. {t("rights")}
            </span>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-emerald-200/85 order-1 md:order-2">
            <Link
              href={`/${currentLocale}/privacy`}
              className="hover:text-[#45D1B4] transition-colors duration-150"
            >
              {t("privacyPolicy")}
            </Link>
            <span className="text-emerald-400/20 select-none">·</span>
            <Link
              href={`/${currentLocale}/terms`}
              className="hover:text-[#45D1B4] transition-colors duration-150"
            >
              {t("termsOfService")}
            </Link>
            <span className="text-emerald-400/20 select-none">·</span>
            <Link
              href={`/${currentLocale}/certificates/verify`}
              className="hover:text-[#45D1B4] transition-colors duration-150"
            >
              {t("verifyCertificate")}
            </Link>
          </div>

          {/* SSL Security Badge */}
          <div className="flex items-center justify-center md:justify-end gap-1.5 text-[11px] text-emerald-200/75 font-medium shrink-0 order-3">
            <div className="w-4 h-4 rounded-full bg-[#45D1B4]/15 border border-[#45D1B4]/25 flex items-center justify-center text-[#45D1B4] shrink-0">
              <Lock className="w-2.5 h-2.5" />
            </div>
            <span className="tracking-wide">SSL 256-bit Encrypted</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
