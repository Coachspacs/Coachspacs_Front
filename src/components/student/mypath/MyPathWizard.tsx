"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Code2,
  Database,
  BrainCircuit,
  Palette,
  Layout,
  type LucideIcon,
} from "lucide-react";
import { CleanHeroBanner } from "./CleanHeroBanner";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";
import { generateRoadmapFromPreferences } from "@/lib/myPathGenerator";
import {
  MyPathPreferences,
  GeneratedRoadmap,
  LearningTrack,
  SkillLevel,
  WeeklyCommitment,
  TargetDuration,
  RoadmapMilestone,
} from "@/types/mypath";

interface BenefitItem {
  id: string;
  icon: LucideIcon;
  titleKey: "personalizedTitle" | "coursesTitle" | "flexibleTitle";
  descKey: "personalizedDesc" | "coursesDesc" | "flexibleDesc";
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

const TRACK_ICONS: Record<LearningTrack, LucideIcon> = {
  frontend: Layout,
  backend: Code2,
  fullstack: Code2,
  ai: BrainCircuit,
  uiux: Palette,
  data: Database,
  business: Briefcase,
};

export function MyPathWizard() {
  const t = useTranslations("myPath");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [preferences, setPreferences] = useState<MyPathPreferences>({
    track: "ai",
    level: "beginner",
    hoursPerWeek: "8",
    targetMonths: "3",
  });
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(null);
  const [generatingPhase, setGeneratingPhase] = useState<number>(0);

  // Restore saved roadmap if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coachspace_student_roadmap");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.milestones?.length > 0) {
          setRoadmap(parsed);
          setPreferences(parsed.preferences || preferences);
          setStep(5);
        }
      }
    } catch {}
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#0F5244", "#10B981", "#38E09D", "#D1FAE5", "#07382E"],
      });
    } catch {}
  };

  // Step 4: AI Generation simulation
  useEffect(() => {
    if (step !== 4) return;
    setGeneratingPhase(1);

    const timer1 = setTimeout(() => setGeneratingPhase(2), 700);
    const timer2 = setTimeout(() => setGeneratingPhase(3), 1400);
    const timer3 = setTimeout(() => {
      const generated = generateRoadmapFromPreferences(preferences);
      setRoadmap(generated);
      try {
        localStorage.setItem("coachspace_student_roadmap", JSON.stringify(generated));
      } catch {}
      setStep(5);
      triggerConfetti();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step, preferences]);

  const handleStartAssessment = () => setStep(2);

  const handleMilestoneToggle = (milestoneId: string) => {
    if (!roadmap) return;
    const updatedMilestones = roadmap.milestones.map((m) => {
      if (m.id === milestoneId) {
        const nextStatus: RoadmapMilestone["status"] =
          m.status === "completed" ? "in_progress" : "completed";
        return { ...m, status: nextStatus };
      }
      return m;
    });

    const updatedRoadmap = { ...roadmap, milestones: updatedMilestones };
    setRoadmap(updatedRoadmap);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(updatedRoadmap));
    } catch {}

    const allCompleted = updatedMilestones.every((m) => m.status === "completed");
    if (allCompleted) {
      triggerConfetti();
    }
  };

  const handleRegenerate = () => {
    const generated = generateRoadmapFromPreferences(preferences);
    setRoadmap(generated);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(generated));
    } catch {}
    triggerConfetti();
  };

  const tracks: LearningTrack[] = ["frontend", "backend", "fullstack", "ai", "uiux", "data", "business"];
  const levels: SkillLevel[] = ["beginner", "intermediate", "advanced"];
  const hourOptions: WeeklyCommitment[] = ["3", "8", "15"];
  const monthOptions: TargetDuration[] = ["1", "3", "6"];

  return (
    <motion.section
      aria-labelledby="mypath-heading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full font-sans"
    >
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden p-5 sm:p-7 transition-all relative">
        {/* Subtle Ambient Background Gradient matching Coach Space emerald tone */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* ========================================================================= */}
        {/* STEP 1: WELCOME & OVERVIEW */}
        {/* ========================================================================= */}
        {step === 1 && (
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

            {/* 3 Benefit Cards (Harmonized to site palette) */}
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
            <div className="w-full flex items-center justify-end pt-1">
              <motion.button
                type="button"
                onClick={handleStartAssessment}
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
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SELECT LEARNING TRACK & EXPERIENCE LEVEL */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 relative z-10 text-start">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  {t("step2Badge")}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {t("step2.title")}
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                  {t("step2.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {t("back")}
              </button>
            </div>

            {/* Track Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900">
                {t("step2.fieldLabel")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {tracks.map((trackKey) => {
                  const Icon = TRACK_ICONS[trackKey] || Code2;
                  const isSelected = preferences.track === trackKey;
                  return (
                    <button
                      key={trackKey}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, track: trackKey })}
                      className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "bg-emerald-50/80 border-[#0F5244] ring-2 ring-[#0F5244]/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "bg-[#0F5244] text-white border-[#0F5244]"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-black block truncate ${isSelected ? "text-[#0F5244]" : "text-slate-900"}`}>
                          {t(`step2.fields.${trackKey}`)}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#0F5244] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-slate-900">
                {t("step2.levelLabel")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {levels.map((lvl) => {
                  const isSelected = preferences.level === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, level: lvl })}
                      className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-[#0F5244] ring-2 ring-[#0F5244]/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black ${isSelected ? "text-[#0F5244]" : "text-slate-900"}`}>
                          {t(`step2.levels.${lvl}`)}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#0F5244]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SCHEDULE & TIME COMMITMENT */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 relative z-10 text-start">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  {t("step3Badge")}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {t("step3.title")}
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                  {t("step3.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {t("back")}
              </button>
            </div>

            {/* Weekly Commitment */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900">
                {t("step3.hoursLabel")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {hourOptions.map((hrs) => {
                  const isSelected = preferences.hoursPerWeek === hrs;
                  return (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, hoursPerWeek: hrs })}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-50/80 border-[#0F5244] ring-2 ring-[#0F5244]/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Clock className={`w-4 h-4 ${isSelected ? "text-[#0F5244]" : "text-slate-500"}`} />
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#0F5244]" />
                        )}
                      </div>
                      <span className={`text-xs font-black ${isSelected ? "text-[#0F5244]" : "text-slate-900"}`}>
                        {t(`step3.hours${hrs}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Duration */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-slate-900">
                {t("step3.targetLabel")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {monthOptions.map((mnth) => {
                  const isSelected = preferences.targetMonths === mnth;
                  return (
                    <button
                      key={mnth}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, targetMonths: mnth })}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-50/80 border-[#0F5244] ring-2 ring-[#0F5244]/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Target className={`w-4 h-4 ${isSelected ? "text-[#0F5244]" : "text-slate-500"}`} />
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#0F5244]" />
                        )}
                      </div>
                      <span className={`text-xs font-black ${isSelected ? "text-[#0F5244]" : "text-slate-900"}`}>
                        {t(`step3.target${mnth}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#38E09D]" />
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: AI GENERATING SIMULATION */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="py-12 flex flex-col items-center justify-center text-center relative z-10 space-y-6">
            <div className="relative">
              <AnimatedRobotCharacter />
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                {t("step4.generatingTitle")}
              </h2>
              <p className="text-xs text-slate-500">
                {t("step4.generatingDesc")}
              </p>
            </div>

            {/* Progress indicators */}
            <div className="w-full max-w-sm space-y-2 text-start">
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                  generatingPhase >= 1
                    ? "bg-emerald-50 border-emerald-300 text-[#0F5244]"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${generatingPhase >= 1 ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{t("step4.stepAnalyzing")}</span>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                  generatingPhase >= 2
                    ? "bg-emerald-50 border-emerald-300 text-[#0F5244]"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${generatingPhase >= 2 ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{t("step4.stepSequencing")}</span>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                  generatingPhase >= 3
                    ? "bg-emerald-50 border-emerald-300 text-[#0F5244]"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${generatingPhase >= 3 ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{t("step4.stepMilestones")}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: INTERACTIVE ROADMAP (THE COMPLETED EXPERIENCE) */}
        {/* ========================================================================= */}
        {step === 5 && roadmap && (
          <div className="space-y-6 relative z-10 text-start">
            {/* Header with Stats & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{t("roadmap.headerTitle")}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t(`step2.fields.${roadmap.preferences.track}`)} •{" "}
                  {t(`step2.levels.${roadmap.preferences.level}`)}
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                  {t("roadmap.headerSubtitle")}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all border border-slate-200"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t("editGoals")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("regenerate")}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-center">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">
                  {t("roadmap.estimatedWeeks")}
                </span>
                <span className="text-sm sm:text-base font-black text-[#0F5244]">
                  {roadmap.estimatedWeeks} {t("roadmap.weeks")}
                </span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {t("step3.hoursLabel")}
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900">
                  {roadmap.hoursPerWeek} {t("roadmap.hoursPerWeek")}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">
                  {t("roadmap.totalMilestones")}
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-700">
                  {roadmap.milestones.filter((m) => m.status === "completed").length} /{" "}
                  {roadmap.milestones.length}
                </span>
              </div>
            </div>

            {/* Milestone Cards Timeline */}
            <div className="space-y-4 pt-2">
              {roadmap.milestones.map((milestone) => {
                const isCompleted = milestone.status === "completed";
                const isInProgress = milestone.status === "in_progress";

                return (
                  <motion.div
                    key={milestone.id}
                    layout
                    className={`rounded-2xl border p-5 transition-all ${
                      isCompleted
                        ? "bg-emerald-50/40 border-emerald-300 shadow-2xs"
                        : isInProgress
                        ? "bg-white border-2 border-[#0F5244] ring-2 ring-[#0F5244]/15 shadow-sm"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isInProgress
                              ? "bg-[#0F5244] text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {milestone.stepNumber}
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-slate-900">
                            {isAr ? milestone.titleAr : milestone.title}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {milestone.durationWeeks} {t("roadmap.weeks")} •{" "}
                            {isCompleted
                              ? t("roadmap.statusCompleted")
                              : isInProgress
                              ? t("roadmap.statusInProgress")
                              : t("roadmap.statusPlanned")}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMilestoneToggle(milestone.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-[#0F5244]"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {isCompleted ? t("roadmap.completedBadge") : t("roadmap.markComplete")}
                        </span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      {isAr ? milestone.descriptionAr : milestone.description}
                    </p>

                    {/* Skills Covered */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                      {(isAr ? milestone.skillsAr : milestone.skills).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Capstone Project Card */}
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#0F5244] shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Capstone Project
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {isAr ? milestone.projectTitleAr : milestone.projectTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Courses List */}
                    {milestone.courses.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {t("roadmap.recommendedCourses")}:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {milestone.courses.map((course) => (
                            <div
                              key={course.id}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <BookOpen className="w-3.5 h-3.5 text-[#0F5244] shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-900 block truncate">
                                    {isAr ? course.titleAr : course.title}
                                  </span>
                                  <span className="text-[10.5px] text-slate-400 block truncate">
                                    {course.instructor} • {course.durationHours}h
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default MyPathWizard;
