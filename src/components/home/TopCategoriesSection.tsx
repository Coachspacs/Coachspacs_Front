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
      href: `/${locale}/categories`,
    },
    {
      id: "development",
      title: t("categoryDevelopment"),
      icon: Code,
      href: `/${locale}/categories`,
    },
    {
      id: "business",
      title: t("categoryBusiness"),
      icon: BarChart3,
      href: `/${locale}/categories`,
    },
    {
      id: "marketing",
      title: t("categoryMarketing"),
      icon: Target,
      href: `/${locale}/categories`,
    },
    {
      id: "growth",
      title: t("categoryGrowth"),
      icon: Brain,
      href: `/${locale}/categories`,
    },
  ];

  return (
    <section className="w-full bg-white pt-6 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14 pb-4 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6CF8BB]/20 text-[#0F5244] border border-[#6CF8BB]/40 text-xs font-extrabold tracking-wider uppercase">
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
            href={`/${locale}/categories`}
            className="inline-flex items-center gap-2.5 text-[#0F5244] hover:text-white bg-[#0F5244]/10 hover:bg-[#0F5244] px-5 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300 shadow-2xs hover:shadow-md shrink-0 self-start sm:self-auto group"
          >
            <span>{t("viewAllCategories")}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-7">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isLastOnMobile = idx === categories.length - 1;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`bg-[#F0F3FF] hover:bg-[#0F5244] rounded-3xl p-6 sm:p-8 min-h-[170px] sm:min-h-[200px] flex flex-col items-center justify-center text-center gap-4 sm:gap-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0F5244]/20 border border-indigo-100/70 hover:border-[#0F5244] group relative overflow-hidden ${
                  isLastOnMobile
                    ? "col-span-2 sm:col-span-1 justify-self-center w-full max-w-[280px] sm:max-w-none"
                    : ""
                }`}
              >
                {/* Glow */}
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#6CF8BB]/0 group-hover:bg-[#6CF8BB]/25 blur-2xl transition-all duration-500 pointer-events-none" />

                {/* Icon Circle */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white group-hover:bg-white/20 flex items-center justify-center shadow-md shadow-slate-200/50 border border-slate-100 group-hover:border-white/30 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-[#0F5244] group-hover:text-white group-hover:rotate-6 transition-all duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-slate-900 font-extrabold text-base sm:text-lg lg:text-xl group-hover:text-white transition-colors leading-tight">
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
