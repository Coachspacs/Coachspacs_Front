"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { TopCategoriesSectionData } from "@/types/cms";

interface TopCategoriesSectionProps {
  data?: TopCategoriesSectionData;
}

export function TopCategoriesSection({ data }: TopCategoriesSectionProps = {}) {
  const t = useTranslations("home");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const titleText = (isAr ? data?.title_ar : data?.title_en) || t("topCategoriesTitle");
  const subtitleText = (isAr ? data?.subtitle_ar : data?.subtitle_en) || t("topCategoriesSubtitle");

  const defaultCategories = [
    {
      id: "fitness-coaching",
      title: t("catFitness"),
      href: `/${locale}/courses?category=Fitness%20Coaching`,
    },
    {
      id: "career-coaching",
      title: t("catCareer"),
      href: `/${locale}/courses?category=Career%20Coaching`,
    },
    {
      id: "nutrition",
      title: isAr ? "التغذية" : "Nutrition",
      href: `/${locale}/courses?category=Nutrition`,
    },
    {
      id: "life-mindfulness",
      title: t("catLife"),
      href: `/${locale}/courses?category=Life%20%26%20Mindfulness`,
    },
    {
      id: "programming",
      title: t("catProgramming"),
      href: `/${locale}/courses?category=Programming`,
    },
  ];

  const [categories, setCategories] = useState<{ id: string | number; title: string; href: string }[]>(defaultCategories);

  useEffect(() => {
    let isSubscribed = true;

    categoryService
      .getCategories(locale)
      .then((data) => {
        if (!isSubscribed) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.name,
            href: `/${locale}/courses?category=${item.id}`,
          }));
          setCategories(mapped);
        }
      })
      .catch((err) => {
        console.warn("[TopCategoriesSection] Failed to load categories from API:", err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [locale]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  if (data?.is_visible === false) {
    return null;
  }

  return (
    <section suppressHydrationWarning className="w-full bg-white pt-8 pb-16 sm:pb-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12 pb-5 border-b border-slate-100"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6CF8BB]/20 text-[#0F5244] border border-[#6CF8BB]/40 text-xs font-extrabold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{t("browseByTopic")}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {titleText}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              {subtitleText}
            </p>
          </div>

          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center gap-2.5 text-[#0F5244] hover:text-white bg-[#0F5244]/10 hover:bg-[#0F5244] px-5 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300 shadow-2xs hover:shadow-md shrink-0 self-start sm:self-auto group"
          >
            <span>{t("viewAllCategories")}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Dynamic Clean Categories Grid (No hardcoded icons) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          suppressHydrationWarning
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5"
        >
          {categories.map((cat, idx) => {
            const isLastOnMobile = idx === categories.length - 1;

            return (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                className={
                  isLastOnMobile
                    ? "col-span-2 sm:col-span-1 justify-self-center w-full max-w-[280px] sm:max-w-none"
                    : "w-full"
                }
              >
                <Link
                  href={cat.href}
                  className="group relative bg-white hover:bg-gradient-to-b hover:from-emerald-50/30 hover:to-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 min-h-[105px] sm:min-h-[120px] flex flex-col items-center justify-center text-center border border-slate-200/90 hover:border-[#0F5244]/35 shadow-2xs hover:shadow-lg hover:shadow-emerald-950/8 transition-all duration-300 hover:-translate-y-1 overflow-hidden w-full h-full block"
                >
                  {/* Subtle ambient corner light */}
                  <div className="pointer-events-none absolute -top-8 -right-8 w-20 h-20 bg-emerald-400/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top-Right Arrow Indicator */}
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-5 h-5 rounded-full bg-slate-100 group-hover:bg-[#0F5244] text-slate-400 group-hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xs scale-75 group-hover:scale-100">
                    <ArrowUpRight className="w-3 h-3 rtl:-rotate-90" />
                  </div>

                  {/* Dynamic Category Title */}
                  <h3 className="relative z-10 text-slate-900 font-black text-sm sm:text-base group-hover:text-[#0F5244] transition-colors leading-snug px-2">
                    {cat.title}
                  </h3>

                  {/* Subtle dynamic bottom accent line on hover */}
                  <div className="absolute bottom-0 inset-x-8 h-0.5 bg-[#0F5244] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}



