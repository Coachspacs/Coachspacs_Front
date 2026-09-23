"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  Award,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { CleanHeroBanner } from "./CleanHeroBanner";

interface BenefitItem {
  id: string;
  icon: LucideIcon;
  titleKey: "personalizedTitle" | "coursesTitle" | "flexibleTitle";
  descKey: "personalizedDesc" | "coursesDesc" | "flexibleDesc";
  iconBgClass: string;
  iconColorClass: string;
  borderClass: string;
}

const BENEFITS_CONFIG: readonly BenefitItem[] = [
  {
    id: "personalized",
    icon: Target,
    titleKey: "personalizedTitle",
    descKey: "personalizedDesc",
    iconBgClass: "bg-emerald-50 dark:bg-emerald-950/60",
    iconColorClass: "text-[#0F5244] dark:text-[#38E09D]",
    borderClass: "border-emerald-200/60",
  },
  {
    id: "courses",
    icon: Award,
    titleKey: "coursesTitle",
    descKey: "coursesDesc",
    iconBgClass: "bg-teal-50 dark:bg-teal-950/60",
    iconColorClass: "text-teal-700 dark:text-teal-300",
    borderClass: "border-teal-200/60",
  },
  {
    id: "flexible",
    icon: TrendingUp,
    titleKey: "flexibleTitle",
    descKey: "flexibleDesc",
    iconBgClass: "bg-blue-50 dark:bg-blue-950/60",
    iconColorClass: "text-blue-700 dark:text-blue-300",
    borderClass: "border-blue-200/60",
  },
];

export function MyPathWizard() {
  const t = useTranslations("myPath");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  return (
    <motion.section
      aria-labelledby="mypath-heading"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full font-sans"
    >
      {/* Outer Card with pristine luxury styling matching top card width */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.04)] overflow-hidden p-5 sm:p-7 transition-all relative">
        {/* Subtle Ambient Background Gradient */}
        <div 
          className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />

        <div className="flex flex-col items-center text-center relative z-10">
          {/* Clean Minimalist Journey Hero Banner with Animated Robot */}
          <CleanHeroBanner isAr={isAr} />

          {/* Title & Single Concise Description */}
          <h1 
            id="mypath-heading"
            className="text-2xl sm:text-[28px] font-black tracking-normal leading-normal mb-1 text-[#0F5244] dark:text-white"
          >
            {t("title")}
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 max-w-lg mb-4 font-medium leading-relaxed">
            {t("description")}
          </p>

          {/* "Why My Path?" 3 Luxury Benefit Cards (DRY Config Mapping) */}
          <div className="w-full bg-gradient-to-b from-slate-50/90 via-emerald-50/20 to-slate-50/90 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-4.5 text-start mb-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-5.5 h-5.5 rounded-lg bg-gradient-to-br from-[#0F5244] to-[#168E6B] text-white flex items-center justify-center shadow-xs"
                aria-hidden="true"
              >
                <Zap className="w-3 h-3 fill-current" />
              </div>
              <h2 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white">
                {t("whyTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-2" role="list">
              {BENEFITS_CONFIG.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.id}
                    role="listitem"
                    whileHover={{ y: -1.5 }}
                    className="flex items-start gap-3 bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-emerald-400/80 dark:hover:border-emerald-500 transition-all shadow-2xs group"
                  >
                    <div 
                      className={`w-8 h-8 rounded-lg ${benefit.iconBgClass} ${benefit.iconColorClass} flex items-center justify-center shrink-0 border ${benefit.borderClass} group-hover:scale-105 transition-transform`}
                      aria-hidden="true"
                    >
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-[12.5px] font-black text-slate-900 dark:text-white leading-snug">
                        {t(`benefits.${benefit.titleKey}`)}
                      </h3>
                      <p className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5 font-medium">
                        {t(`benefits.${benefit.descKey}`)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer: Start Button */}
          <div className="w-full flex items-center justify-end pt-1">
            <motion.button
              type="button"
              aria-label={t("startAssessment")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#093B30] text-white text-xs sm:text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_18px_rgba(15,82,68,0.28)] hover:shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5244]"
            >
              <span>{t("startAssessment")}</span>
              {isAr ? (
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
