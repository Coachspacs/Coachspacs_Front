"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  Award,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";
import { MyPathPreferences, SkillLevel } from "@/types/mypath";
import { RobotJourneyBanner } from "../RobotJourneyBanner";

interface WizardLevelStepProps {
  t: (key: string) => string;
  isAr: boolean;
  preferences: MyPathPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<MyPathPreferences>>;
  onNext: () => void;
  onPrev: () => void;
}

interface LevelOption {
  level: SkillLevel;
  icon: any;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr?: string;
  badgeEn?: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    level: "beginner",
    icon: BookOpen,
    titleAr: "مبتدئ (Beginner)",
    titleEn: "Beginner",
    descAr: "أبدأ من نقطة الصفر أو لدي معرفة بسيطة جداً، وأريد تأسيس المفاهيم الأساسية أولاً.",
    descEn: "Starting from scratch or with minimal knowledge, focusing on building solid fundamentals.",
    badgeAr: "نقطة البداية الأولى",
    badgeEn: "Foundational",
  },
  {
    level: "intermediate",
    icon: TrendingUp,
    titleAr: "متوسط (Intermediate)",
    titleEn: "Intermediate",
    descAr: "أمتلك أساسيات جيدة، وأرغب في الانتقال لبناء مشاريع متكاملة وتطوير مهارات عملية أعمق.",
    descEn: "Good grasp of fundamentals, looking to build practical projects and advance core competencies.",
    badgeAr: "الأكثر اختياراً",
    badgeEn: "Most Popular",
  },
  {
    level: "advanced",
    icon: Award,
    titleAr: "متقدم (Advanced)",
    titleEn: "Advanced",
    descAr: "لدي خبرة عملية راسخة، وأسعى لإتقان الأنماط المتقدمة والحلول المعمارية والاحترافية.",
    descEn: "Solid industry experience, aiming to master high-level patterns and advanced architecture.",
    badgeAr: "مستوى احترافي",
    badgeEn: "Mastery",
  },
];

export function WizardLevelStep({
  t,
  isAr,
  preferences,
  setPreferences,
  onNext,
  onPrev,
}: WizardLevelStepProps) {
  const currentLevel = preferences.level || "beginner";

  return (
    <div className="space-y-6 relative z-10">
      {/* 1. Animated Interactive Scenic Journey Banner with Moving Robot */}
      <RobotJourneyBanner
        currentStepIndex={3}
        totalSteps={4}
        stepBadge={isAr ? "الخطوة 3 من 4 • تقييم مستواك" : "Step 3 of 4 • Skill Level"}
        stepCategory={isAr ? "المستوى الحالي" : "Current Level"}
        isAr={isAr}
      />

      {/* 2. Step Header (Centered) */}
      <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isAr ? "ما هو مستواك الحالي في هذا المجال؟" : "What is your current level in this domain?"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          {isAr
            ? "يساعد تحديد المستوى في البدء بالمواضيع المناسبة وتخطي الأساسيات المكررة لتوفير وقتك."
            : "Selecting your level ensures the AI starts with appropriate courses and avoids redundant basics."}
        </p>
      </div>

      {/* 3. Level Options List */}
      <div className="space-y-3.5 pt-1 max-w-2xl mx-auto" role="radiogroup">
        {LEVEL_OPTIONS.map((opt, idx) => {
          const Icon = opt.icon;
          const isSelected = currentLevel === opt.level;

          return (
            <motion.button
              key={opt.level}
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
                  level: opt.level,
                  priorKnowledge: opt.level === "beginner" ? "basic" : opt.level,
                }));
              }}
              className={`w-full p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? "bg-white border-2 border-slate-200 shadow-xs"
                  : "bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              {/* Start Side (Icon + Texts) */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[var(--color-primary-main)] text-white shadow-xs"
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
                    {opt.badgeAr && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-slate-100 text-brand-dark"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isAr ? opt.badgeAr : opt.badgeEn}
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
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white" />
                )}
              </div>
            </motion.button>
          );
        })}
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
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-[var(--color-primary-main)] hover:bg-[var(--color-primary-dark)] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <span>{t("continue")}</span>
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default WizardLevelStep;
