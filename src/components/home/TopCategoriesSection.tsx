"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  PenTool,
  Code,
  BarChart3,
  Target,
  Brain,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function TopCategoriesSection() {
  const t = useTranslations("home");
  const locale = useLocale();

  const categories = [
    {
      id: "design",
      title: t("categoryDesign"),
      icon: PenTool,
      href: `/${locale}/catalog?category=Design`,
    },
    {
      id: "development",
      title: t("categoryDevelopment"),
      icon: Code,
      href: `/${locale}/catalog?category=Development`,
    },
    {
      id: "business",
      title: t("categoryBusiness"),
      icon: BarChart3,
      href: `/${locale}/catalog?category=Management`,
    },
    {
      id: "marketing",
      title: t("categoryMarketing"),
      icon: Target,
      href: `/${locale}/catalog?category=Marketing`,
    },
    {
      id: "growth",
      title: t("categoryGrowth"),
      icon: Brain,
      href: `/${locale}/catalog?category=Leadership`,
    },
  ];

  return (
    <section className="w-full bg-white pt-8 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14 pb-5 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6CF8BB]/20 text-[#0F5244] border border-[#6CF8BB]/40 text-xs font-extrabold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{t("browseByTopic")}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {t("topCategoriesTitle")}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              {t("topCategoriesSubtitle")}
            </p>
          </div>

          <Link
            href={`/${locale}/catalog`}
            className="inline-flex items-center gap-2.5 text-[#0F5244] hover:text-white bg-[#0F5244]/10 hover:bg-[#0F5244] px-5 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300 shadow-2xs hover:shadow-md shrink-0 self-start sm:self-auto group"
          >
            <span>{t("viewAllCategories")}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isLastOnMobile = idx === categories.length - 1;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`group relative bg-white hover:bg-emerald-50/40 rounded-3xl p-6 sm:p-7 min-h-[155px] sm:min-h-[175px] flex flex-col items-center justify-center text-center gap-3 sm:gap-4 border border-slate-200/90 hover:border-[#0F5244]/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0F5244]/12 overflow-hidden ${
                  isLastOnMobile
                    ? "col-span-2 sm:col-span-1 justify-self-center w-full max-w-[280px] sm:max-w-none"
                    : ""
                }`}
              >
                {/* Ambient Soft Glow on Hover */}
                <div className="pointer-events-none absolute -bottom-10 -right-10 w-32 h-32 bg-[#34D399]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Standalone Centered Icon */}
                <Icon className="w-9 h-9 sm:w-10 sm:h-10 text-[#0F5244] group-hover:scale-115 group-hover:-translate-y-1 transition-all duration-300 ease-out" />

                {/* Centered Category Title */}
                <h3 className="text-slate-900 font-extrabold text-base sm:text-lg group-hover:text-[#0F5244] transition-colors leading-snug">
                  {cat.title}
                </h3>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

