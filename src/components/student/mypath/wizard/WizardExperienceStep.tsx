"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Flame,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";
import { MyPathPreferences, WeeklyCommitment } from "@/types/mypath";
import { RobotJourneyBanner } from "../RobotJourneyBanner";

interface WizardExperienceStepProps {
  t: (key: string) => string;
  isAr: boolean;
  preferences: MyPathPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<MyPathPreferences>>;
  onGenerate: () => void;
  onPrev: () => void;
}

interface HourOption {
  hours: number;
  commitmentKey: WeeklyCommitment;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: any;
  isRecommended?: boolean;
}

const HOUR_OPTIONS: HourOption[] = [
  {
    hours: 4,
    commitmentKey: "3-5",
    titleAr: "2 - 4 ساعات أسبوعياً",
    titleEn: "2 - 4 Hours / Week",
    descAr: "وتيرة مرنة وهادئة تناسب أوقات الفراغ وجداول العمل المزدحمة.",
    descEn: "Flexible and relaxed pace tailored for busy professional schedules.",
    icon: Clock,
  },
  {
    hours: 6,
    commitmentKey: "6-10",
    titleAr: "6 ساعات أسبوعياً",
    titleEn: "6 Hours / Week",
    descAr: "الوتيرة المثالية والموصى بها لتحقيق أفضل توازن بين الدراسة والتطبيق العملي.",
    descEn: "Recommended optimal balance between theory and steady practical execution.",
    icon: Zap,
    isRecommended: true,
  },
  {
    hours: 8,
    commitmentKey: "6-10",
    titleAr: "8 - 10 ساعات أسبوعياً",
    titleEn: "8 - 10 Hours / Week",
    descAr: "إنجاز مكثف وسريع للوصول إلى هدفك وبناء مشاريعك في وقت قياسي.",
    descEn: "Fast-track intensive sprint to achieve milestones and complete projects rapidly.",
    icon: Flame,
  },
  {
    hours: 12,
    commitmentKey: "10+",
    titleAr: "12+ ساعة أسبوعياً",
    titleEn: "12+ Hours / Week",
    descAr: "تفرغ وانغماس كامل لمن يبحث عن التحول المهني والاحتراف المتسارع.",
    descEn: "Full immersion track for rapid career transformation and mastery.",
    icon: Rocket,
  },
];

export function WizardExperienceStep({
  t,
  isAr,
  preferences,
  setPreferences,
  onGenerate,
  onPrev,
}: WizardExperienceStepProps) {
  const currentHours = preferences.weeklyHours || 6;

  return (
    <div className="space-y-6 relative z-10">
      {/* 1. Animated Interactive Scenic Journey Banner with Moving Robot */}
      <RobotJourneyBanner
        currentStepIndex={4}
        totalSteps={4}
        stepBadge={isAr ? "الخطوة 4 من 4 • ساعات الالتزام" : "Step 4 of 4 • Weekly Hours"}
        stepCategory={isAr ? "الوقت المتاح" : "Weekly Commitment"}
        isAr={isAr}
      />

      {/* 2. Step Header (Centered) */}
      <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {isAr ? "كم ساعة تستطيع تخصيصها أسبوعياً للتعلم؟" : "How many hours per week can you dedicate?"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          {isAr
            ? "يستخدم الذكاء الاصطناعي ساعات التزامك لحساب فترات الإنجاز المتوقعة لكل محطة ودورة بدقة."
            : "AI uses your weekly hours to calibrate milestones and calculate realistic completion timelines."}
        </p>
      </div>

      {/* 3. Hours Options Grid */}
      <div className="space-y-3.5 pt-1 max-w-2xl mx-auto" role="radiogroup">
        {HOUR_OPTIONS.map((opt, idx) => {
          const Icon = opt.icon;
          const isSelected = currentHours === opt.hours;

          return (
            <motion.button
              key={opt.hours}
              type="button"
              role="radio"
              aria-checked={isSelected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                soundFx.playOptionSelect();
                setPreferences((prev) => ({
                  ...prev,
                  weeklyHours: opt.hours,
                  hoursPerWeek: opt.commitmentKey,
                }));
              }}
              className={`w-full p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? "bg-white border-2 border-emerald-400 shadow-xs"
                  : "bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              {/* Start Side (Icon + Texts) */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#0F5244] text-white shadow-xs"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {isAr ? opt.titleAr : opt.titleEn}
                    </h3>
                    {opt.isRecommended && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {isAr ? "موصى به" : "Recommended"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    {isAr ? opt.descAr : opt.descEn}
                  </p>
                </div>
              </div>

              {/* End Side (Radio Check Indicator) */}
              <div className="shrink-0 flex items-center">
                {isSelected ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white" />
                )}
              </div>
            </motion.button>
          );
        })}

        {/* AI Guarantee Note */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/80 p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs text-start mt-2">
          <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200/80 text-[#0F5244] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <p className="text-xs text-emerald-950 font-bold leading-relaxed">
            {isAr
              ? "سيقوم الذكاء الاصطناعي بربط مسارك بالدورات المنشورة فعلياً في المنصة لضمان إمكانية التسجيل والدراسة فوراً."
              : "AI maps your roadmap exclusively to active published courses on Coach Space for immediate study."}
          </p>
        </div>
      </div>

      {/* 4. Navigation Buttons */}
      <div
        className={`flex items-center justify-between pt-6 max-w-2xl mx-auto ${
          isAr ? "flex-row-reverse" : ""
        }`}
      >
        <button
          type="button"
          onClick={onPrev}
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-8 py-3 sm:py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>{isAr ? "توليد الخارطة بالذكاء الاصطناعي" : "Generate My Roadmap with AI"}</span>
          <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
        </button>
      </div>
    </div>
  );
}

export default WizardExperienceStep;
