"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Zap, Target, Award, TrendingUp } from "lucide-react";
import { CleanHeroBanner } from "../CleanHeroBanner";
import { BenefitItem } from "./types";

interface WizardLandingOverviewProps {
  t: (key: string) => string;
  isAr: boolean;
  locale: string;
  onStartAssessment: () => void;
}

const BENEFITS_CONFIG: readonly BenefitItem[] = [
  {
    id: "personalized",
    icon: Target,
    titleKey: "personalizedTitle",
    descKey: "personalizedDesc",
  },
  {
    id: "courses",
    icon: Award,
    titleKey: "coursesTitle",
    descKey: "coursesDesc",
  },
  {
    id: "flexible",
    icon: TrendingUp,
    titleKey: "flexibleTitle",
    descKey: "flexibleDesc",
  },
];

export function WizardLandingOverview({
  t,
  isAr,
  locale,
  onStartAssessment,
}: WizardLandingOverviewProps) {
  return (
    <div className="flex flex-col items-center text-center relative z-10">
      <CleanHeroBanner isAr={isAr} />

      <h1
        id="mypath-heading"
        className="text-2xl sm:text-[28px] font-black tracking-normal leading-normal mb-1.5 text-[#0F5244]"
      >
        {t("title")}
      </h1>
      <p className="text-xs sm:text-[13px] text-slate-600 max-w-lg mb-5 font-medium leading-relaxed">
        {t("description")}
      </p>

      {/* 3 Benefit Cards */}
      <div className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-start mb-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-3.5">
          <div
            className="w-5.5 h-5.5 rounded-lg bg-[#0F5244] text-white flex items-center justify-center shadow-xs"
            aria-hidden="true"
          >
            <Zap className="w-3 h-3 fill-current" />
          </div>
          <h2 className="text-xs sm:text-[13px] font-black text-slate-900">
            {t("whyTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="list">
          {BENEFITS_CONFIG.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                role="listitem"
                whileHover={{ y: -1.5 }}
                className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-400/80 transition-all shadow-2xs group"
              >
                <div
                  className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-200/60 group-hover:scale-105 transition-transform"
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-[12.5px] font-black text-slate-900 leading-snug">
                    {t(`benefits.${benefit.titleKey}`)}
                  </h3>
                  <p className="text-[11px] sm:text-[11.5px] text-slate-500 leading-relaxed mt-0.5 font-medium">
                    {t(`benefits.${benefit.descKey}`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Action */}
      <div className="w-full flex items-center justify-between pt-1">
        <Link
          href={`/${locale}/student`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t("back")}</span>
        </Link>

        <motion.button
          type="button"
          onClick={onStartAssessment}
          aria-label={t("startAssessment")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_4px_18px_rgba(15,82,68,0.28)] hover:shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5244]"
        >
          <span>{t("startAssessment")}</span>
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
}

export default WizardLandingOverview;
