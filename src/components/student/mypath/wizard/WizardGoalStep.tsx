"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  GraduationCap,
  Sparkles,
  MoreHorizontal,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";
import { MyPathPreferences, LearningGoal } from "@/types/mypath";
import { RobotJourneyBanner } from "../RobotJourneyBanner";
import { GoalOptionItem } from "./types";

interface WizardGoalStepProps {
  t: (key: string) => string;
  isAr: boolean;
  preferences: MyPathPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<MyPathPreferences>>;
  onNext: () => void;
  onPrev: () => void;
}

const GOAL_OPTIONS: readonly GoalOptionItem[] = [
  { id: "job", icon: Briefcase },
  { id: "skills", icon: TrendingUp },
  { id: "exam", icon: GraduationCap },
  { id: "growth", icon: Sparkles },
  { id: "other", icon: MoreHorizontal },
];

export function WizardGoalStep({
  t,
  isAr,
  preferences,
  setPreferences,
  onNext,
  onPrev,
}: WizardGoalStepProps) {
  return (
    <div className="space-y-6 relative z-10">
      {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
      <RobotJourneyBanner
        currentStepIndex={1}
        totalSteps={4}
        stepBadge={t("wizard.step1Badge")}
        stepCategory={t("wizard.step1Pill")}
        isAr={isAr}
      />

      {/* Step Header (Centered) */}
      <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t("wizard.step1Title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          {t("wizard.step1Subtitle")}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-3 pt-2 max-w-2xl mx-auto" role="radiogroup">
        {GOAL_OPTIONS.map((opt, idx) => {
          const Icon = opt.icon;
          const isSelected = preferences.goal === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                soundFx.playOptionSelect();
                setPreferences({ ...preferences, goal: opt.id as LearningGoal });
              }}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? "bg-white border-2 border-emerald-400 shadow-xs"
                  : "bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              {/* Start Side (Icon + Texts) */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#0F5244] text-white shadow-xs"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <span className="text-sm sm:text-base font-bold text-slate-900 block truncate">
                    {t(`wizard.goals.${opt.id}.title`)}
                  </span>
                  <p className="text-xs text-slate-400 sm:text-slate-500 font-normal line-clamp-1 mt-0.5">
                    {t(`wizard.goals.${opt.id}.desc`)}
                  </p>
                </div>
              </div>

              {/* End Side (Radio Checkmark) */}
              <div className="shrink-0 flex items-center ps-2">
                {isSelected ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-slate-200 bg-white" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div
        className={`flex items-center justify-between pt-8 max-w-2xl mx-auto ${
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
          className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <span>{t("continue")}</span>
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default WizardGoalStep;
