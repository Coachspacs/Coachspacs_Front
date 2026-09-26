"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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
  GraduationCap,
  Search,
  Plus,
  Smartphone,
  Cloud,
  Flame,
  Coffee,
  Layers,
  Rocket,
  MoreHorizontal,
  Check,
  Compass,
  Share2,
  Play,
  Lock,
  Bookmark,
  FileCode,
  Calendar,
  BarChart3,
  Video,
  Bot,
  User,
  ExternalLink,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { CleanHeroBanner } from "./CleanHeroBanner";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";
import { RobotJourneyBanner } from "./RobotJourneyBanner";
import { soundFx } from "@/lib/soundEffects";
import { generateRoadmapFromPreferences } from "@/lib/myPathGenerator";
import {
  MyPathPreferences,
  GeneratedRoadmap,
  LearningTrack,
  LearningGoal,
  PriorKnowledge,
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

export function MyPathWizard() {
  const t = useTranslations("myPath");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  // Step 1: Landing Overview
  // Step 2: Wizard 1/4 - Goal Assessment
  // Step 3: Wizard 2/4 - Prior Knowledge & Level
  // Step 4: Wizard 3/4 - Time Commitment
  // Step 5: Wizard 4/4 - Skill Focus
  // Step 6: AI Generation Loading
  // Step 7: Final Interactive Roadmap
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  const [preferences, setPreferences] = useState<MyPathPreferences>({
    goal: "job",
    priorKnowledge: "intermediate",
    track: "frontend",
    customTrackName: "",
    level: "intermediate",
    hoursPerWeek: "3-5",
    targetMonths: "3",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [isCustomSkillOpen, setIsCustomSkillOpen] = useState(false);
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(null);
  const [generatingPhase, setGeneratingPhase] = useState<number>(0);
  const [bookmarkedSteps, setBookmarkedSteps] = useState<Record<string, boolean>>({});

  const [isHydrated, setIsHydrated] = useState(false);

  // Restore saved state (preferences, roadmap, and exact active step) on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("coachspace_mypath_preferences");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed) setPreferences((prev) => ({ ...prev, ...parsed }));
      }

      const savedRoadmap = localStorage.getItem("coachspace_student_roadmap");
      if (savedRoadmap) {
        const parsedRoadmap = JSON.parse(savedRoadmap);
        if (parsedRoadmap?.milestones?.length > 0) {
          setRoadmap(parsedRoadmap);
        }
      }

      const savedStep = localStorage.getItem("coachspace_mypath_current_step");
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum >= 1 && stepNum <= 7) {
          setStep(stepNum === 6 ? 5 : (stepNum as 1 | 2 | 3 | 4 | 5 | 6 | 7));
        }
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // Persist current step whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("coachspace_mypath_current_step", String(step));
    } catch {}
  }, [step, isHydrated]);

  // Persist preferences whenever they change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("coachspace_mypath_preferences", JSON.stringify(preferences));
    } catch {}
  }, [preferences, isHydrated]);

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

  // Step 6: AI Generation simulation
  useEffect(() => {
    if (step !== 6) return;
    setGeneratingPhase(1);

    const timer1 = setTimeout(() => setGeneratingPhase(2), 700);
    const timer2 = setTimeout(() => setGeneratingPhase(3), 1400);
    const timer3 = setTimeout(() => {
      const generated = generateRoadmapFromPreferences(preferences);
      setRoadmap(generated);
      try {
        localStorage.setItem("coachspace_student_roadmap", JSON.stringify(generated));
      } catch {}
      soundFx.playCelebration();
      setStep(7);
      triggerConfetti();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step, preferences]);

  const goToNextStep = (next: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    if (next >= 2 && next <= 5) {
      const milestoneIndex = next - 1; // 1, 2, 3, 4
      soundFx.playRobotTravel(milestoneIndex);
    } else {
      soundFx.playStepTransition("forward");
    }
    setStep(next);
  };

  const goToPrevStep = (prev: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    if (prev >= 2 && prev <= 5) {
      const milestoneIndex = prev - 1; // 1, 2, 3, 4
      soundFx.playRobotTravel(milestoneIndex);
    } else {
      soundFx.playStepTransition("backward");
    }
    setStep(prev);
  };

  const handleStartAssessment = () => goToNextStep(2);

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
      soundFx.playCelebration();
      triggerConfetti();
    } else {
      soundFx.playOptionSelect();
    }
  };

  const handleRegenerate = () => {
    const generated = generateRoadmapFromPreferences(preferences);
    setRoadmap(generated);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(generated));
    } catch {}
    soundFx.playCelebration();
    triggerConfetti();
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Goal assessment options
  const goalOptions: { id: LearningGoal; icon: LucideIcon }[] = [
    { id: "job", icon: Briefcase },
    { id: "skills", icon: TrendingUp },
    { id: "exam", icon: GraduationCap },
    { id: "growth", icon: Sparkles },
    { id: "other", icon: MoreHorizontal },
  ];

  // Prior knowledge options
  const levelOptions: {
    id: PriorKnowledge;
    skillLevel: SkillLevel;
    icon: LucideIcon;
    hasRecommended?: boolean;
  }[] = [
    {
      id: "none",
      skillLevel: "beginner",
      icon: BookOpen,
    },
    {
      id: "basic",
      skillLevel: "beginner",
      icon: Code2,
    },
    {
      id: "intermediate",
      skillLevel: "intermediate",
      icon: TrendingUp,
      hasRecommended: true,
    },
    {
      id: "advanced",
      skillLevel: "advanced",
      icon: Award,
    },
  ];

  // Time commitment options
  const hourOptions: {
    id: WeeklyCommitment;
    key: "h1_2" | "h3_5" | "h6_10" | "h10plus";
    icon: LucideIcon;
    hasRecommended?: boolean;
  }[] = [
    { id: "1-2", key: "h1_2", icon: Coffee },
    { id: "3-5", key: "h3_5", icon: Sliders, hasRecommended: true },
    { id: "6-10", key: "h6_10", icon: TrendingUp },
    { id: "10+", key: "h10plus", icon: Flame },
  ];

  // Skill Focus options
  const skillTracks: {
    id: LearningTrack;
    icon: LucideIcon;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: "frontend",
      icon: Code2,
      badge: t("wizard.skills.frontend.badge"),
      badgeColor: "bg-[#0F5244] text-white",
    },
    {
      id: "uiux",
      icon: Palette,
      badge: t("wizard.skills.uiux.badge"),
      badgeColor: "bg-sky-100 text-sky-800 border border-sky-200",
    },
    {
      id: "data",
      icon: TrendingUp,
    },
    {
      id: "mobile",
      icon: Smartphone,
    },
    {
      id: "cloud",
      icon: Cloud,
    },
    {
      id: "backend",
      icon: Database,
    },
  ];

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skillTracks;
    const q = searchQuery.toLowerCase();
    return skillTracks.filter((s) => {
      const title = t(`wizard.skills.${s.id}.title`).toLowerCase();
      const desc = t(`wizard.skills.${s.id}.desc`).toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [searchQuery, t]);

  const handleSelectCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    soundFx.playOptionSelect();
    setPreferences({
      ...preferences,
      track: "custom",
      customTrackName: customSkillInput.trim(),
    });
    setIsCustomSkillOpen(false);
  };

  // Milestone helper stats
  const completedMilestonesCount = roadmap
    ? roadmap.milestones.filter((m) => m.status === "completed").length
    : 0;
  const totalMilestonesCount =
    roadmap && roadmap.milestones.length > 0 ? roadmap.milestones.length : 4;
  const progressPercent =
    totalMilestonesCount > 0
      ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100)
      : 0;

  return (
    <motion.section
      aria-labelledby="mypath-heading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full font-sans"
    >
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden p-5 sm:p-7 transition-all relative">
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
        {/* STEP 2 (WIZARD 1 OF 4): GOAL ASSESSMENT */}
        {/* ========================================================================= */}
        {step === 2 && (
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
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("wizard.step1Pill")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("wizard.step1Title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                {t("wizard.step1Subtitle")}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2 max-w-2xl mx-auto" role="radiogroup">
              {goalOptions.map((opt, idx) => {
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
                      setPreferences({ ...preferences, goal: opt.id });
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
                onClick={() => goToPrevStep(1)}
                className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => goToNextStep(3)}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3 (WIZARD 2 OF 4): PRIOR KNOWLEDGE & LEVEL ASSESSMENT */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 relative z-10">
            {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
            <RobotJourneyBanner
              currentStepIndex={2}
              totalSteps={4}
              stepBadge={t("wizard.step2Badge")}
              stepCategory={t("wizard.step2Pill")}
              isAr={isAr}
            />

            {/* Step Header (Centered) */}
            <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 shadow-2xs">
                <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("wizard.step2Pill")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("wizard.step2Title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                {t("wizard.step2Subtitle")}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2 max-w-2xl mx-auto" role="radiogroup">
              {levelOptions.map((opt, idx) => {
                const Icon = opt.icon;
                const isSelected = preferences.priorKnowledge === opt.id;
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
                      setPreferences({
                        ...preferences,
                        priorKnowledge: opt.id,
                        level: opt.skillLevel,
                      });
                    }}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-white border-2 border-emerald-400 shadow-xs"
                        : "bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
                    }`}
                  >
                    {/* Start Side: Icon + Text */}
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-bold text-slate-900 block truncate">
                            {t(`wizard.levels.${opt.id}.title`)}
                          </span>
                          {opt.hasRecommended && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-600 text-white tracking-wider">
                              {t("wizard.levels.intermediate.recommendedBadge")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 sm:text-slate-500 font-normal line-clamp-1 mt-0.5">
                          {t(`wizard.levels.${opt.id}.desc`)}
                        </p>
                      </div>
                    </div>

                    {/* End Side: Radio Checkmark */}
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
                onClick={() => goToPrevStep(2)}
                className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => goToNextStep(4)}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4 (WIZARD 3 OF 4): TIME COMMITMENT */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6 relative z-10">
            {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
            <RobotJourneyBanner
              currentStepIndex={3}
              totalSteps={4}
              stepBadge={t("wizard.step3Badge")}
              stepCategory={t("wizard.step3Pill")}
              isAr={isAr}
            />

            {/* Step Header (Centered) */}
            <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("wizard.step3Pill")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("wizard.step3Title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                {t("wizard.step3Subtitle")}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2 max-w-2xl mx-auto" role="radiogroup">
              {hourOptions.map((opt, idx) => {
                const Icon = opt.icon;
                const isSelected = preferences.hoursPerWeek === opt.id;
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
                      setPreferences({ ...preferences, hoursPerWeek: opt.id });
                    }}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-white border-2 border-emerald-400 shadow-xs"
                        : "bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
                    }`}
                  >
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

                      <div className="min-w-0 flex-1 space-y-0.5 text-start">
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-bold text-slate-900">
                            {t(`wizard.hours.${opt.key}.title`)}
                          </span>
                          {opt.hasRecommended && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-600 text-white tracking-wider">
                              {t(`wizard.hours.${opt.key}.recommendedBadge`)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 sm:text-slate-500 font-normal line-clamp-1">
                          {t(`wizard.hours.${opt.key}.desc`)}
                        </p>
                      </div>
                    </div>

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
                onClick={() => goToPrevStep(3)}
                className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => goToNextStep(5)}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5 (WIZARD 4 OF 4): SKILL FOCUS & DOMAIN SELECTION */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-6 relative z-10">
            {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
            <RobotJourneyBanner
              currentStepIndex={4}
              totalSteps={4}
              stepBadge={t("wizard.step4Badge")}
              stepCategory={isAr ? "التخصص والمسار" : "Track & Domain"}
              isAr={isAr}
            />

            {/* Step Header (Centered) */}
            <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("wizard.step4Badge")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("wizard.step4Title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                {t("wizard.step4Subtitle")}
              </p>
            </div>

            {/* Search Filter Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("wizard.searchPlaceholder")}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-2xl py-3 ps-10 pe-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 transition-all font-medium"
              />
              <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-200/70 text-slate-600 uppercase tracking-wider">
                  {t("wizard.quickFilter")}
                </span>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 max-w-2xl mx-auto">
              {filteredSkills.map((trackItem, idx) => {
                const Icon = trackItem.icon;
                const isSelected =
                  preferences.track === trackItem.id && !preferences.customTrackName;
                const tagsStr = t(`wizard.skills.${trackItem.id}.tags`);
                const tags = tagsStr ? tagsStr.split(",").map((s) => s.trim()) : [];

                return (
                  <motion.button
                    key={trackItem.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      soundFx.playOptionSelect();
                      setPreferences({
                        ...preferences,
                        track: trackItem.id,
                        customTrackName: "",
                      });
                      setIsCustomSkillOpen(false);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? "bg-white border-2 border-emerald-400 shadow-xs"
                        : "bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#0F5244] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {trackItem.badge && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              trackItem.badgeColor || "bg-[#0F5244] text-white"
                            }`}
                          >
                            {trackItem.badge}
                          </span>
                        )}
                        {isSelected ? (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {t(`wizard.skills.${trackItem.id}.title`)}
                      </h3>
                      <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                        {t(`wizard.skills.${trackItem.id}.desc`)}
                      </p>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Add Custom Skill or Specialty Bar */}
            <div className="space-y-2 pt-1 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setIsCustomSkillOpen(!isCustomSkillOpen)}
                className={`w-full p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  preferences.customTrackName
                    ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/30"
                    : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                      {preferences.customTrackName
                        ? `${t("wizard.customSkillTitle")}: ${preferences.customTrackName}`
                        : t("wizard.customSkillTitle")}
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                      {t("wizard.customSkillDesc")}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-slate-400">
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {isCustomSkillOpen && (
                <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-2xs">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    placeholder={t("wizard.customSkillInputPlaceholder")}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F5244] font-medium"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSelectCustomSkill();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSelectCustomSkill}
                    className="px-4 py-2 rounded-xl bg-[#0F5244] text-white text-xs font-bold hover:bg-[#07382E] transition-colors cursor-pointer shrink-0"
                  >
                    {t("wizard.customSkillConfirm")}
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div
              className={`flex items-center justify-between pt-8 max-w-2xl mx-auto ${
                isAr ? "flex-row-reverse" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => goToPrevStep(4)}
                className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => goToNextStep(6)}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <span>{t("wizard.generateRoadmapBtn")}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: AI GENERATING SIMULATION */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="py-12 flex flex-col items-center justify-center text-center relative z-10 space-y-6">
            <div className="relative">
              <AnimatedRobotCharacter />
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                {t("step4.generatingTitle")}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
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
        {/* STEP 7: CLEAN, CALM, SOFT & ELEGANT ROADMAP MATCHING USER DESIGN */}
        {/* ========================================================================= */}
        {step === 7 && roadmap && (
          <div className="space-y-6 relative z-10 text-start">
            {/* Top Soft Green Container Card */}
            <div className="bg-[#F0FAF6] border border-emerald-200/70 rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden">
              {/* Top Bar inside Container: Back Button + Badge + Edit Button */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPrevStep(5)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                    title={t("back")}
                  >
                    {isAr ? <ArrowRight className="w-3.5 h-3.5 text-slate-600" /> : <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{t("back")}</span>
                  </button>

                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black text-emerald-800 bg-emerald-100/90 border border-emerald-200/80">
                    <Target className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t("roadmap.customCurriculumBadge")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goToPrevStep(2)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t("roadmap.editGoalSchedule")}</span>
                </button>
              </div>

              {/* Title & Detailed Subtitle */}
              <div className="space-y-1.5 max-w-3xl">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F5244] tracking-tight">
                  {preferences.customTrackName ||
                    t(`wizard.skills.${preferences.track || "uiux"}.title`)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {t("roadmap.mainSubtitleDetailed")}
                </p>
              </div>

              {/* White Nested Progress Box */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 text-start">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      {t("roadmap.totalPathProgress")}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      {progressPercent}%{" "}
                      <span className="text-xs sm:text-sm font-bold text-emerald-700 font-sans">
                        {completedMilestonesCount > 0
                          ? t("roadmap.stepsCompleted", { total: roadmap.milestones.length })
                          : `(0 من ${roadmap.milestones.length} مكتملة)`}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const firstIncomplete = roadmap.milestones.find((m) => m.status !== "completed");
                      if (firstIncomplete) handleMilestoneToggle(firstIncomplete.id);
                    }}
                    className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t("roadmap.resumeCurrentStep")}</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0F5244] to-[#10B981] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Bottom Row Metadata */}
                <div className="flex items-center gap-3 sm:gap-5 text-xs font-medium text-slate-500 flex-wrap pt-2 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{preferences.hoursPerWeek} {t("roadmap.hrsWk")}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t("roadmap.levelIntermediateAdvanced")}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{Math.max(1, Math.round(roadmap.estimatedWeeks / 4))} {t("roadmap.months")}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t("roadmap.goalCertificatePortfolio")}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Section Heading: محطات المسار التعليمي */}
            <div className="flex items-center justify-between gap-3 pt-2 text-start">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {t("roadmap.learningRoadmapHeading")}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {t("roadmap.milestonesOverview", { total: roadmap.milestones.length })}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{t("roadmap.activeMilestoneBadge", { step: 1 })}</span>
              </div>
            </div>

            {/* Learning Milestones Vertical List */}
            <div className="space-y-4 pt-1 relative">
              {roadmap.milestones.map((milestone, index) => {
                const isCompleted = milestone.status === "completed";
                const isActive = !isCompleted && index === 0;
                const isCapstone = index === roadmap.milestones.length - 1;
                const firstCourse = milestone.courses && milestone.courses.length > 0 ? milestone.courses[0] : null;

                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`rounded-2xl transition-all p-4 sm:p-5 space-y-3.5 relative ${
                      isCompleted
                        ? "bg-emerald-50/20 border-2 border-emerald-300/80 shadow-2xs"
                        : isActive
                        ? "bg-white border-2 border-emerald-500 shadow-xs ring-2 ring-emerald-500/10"
                        : "bg-white border border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {/* Top Row: Number + Content Column + Action Button */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Right Side: Step Number + Title + Meta */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Step Number Circle */}
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                            isCompleted
                              ? "bg-emerald-600 text-white shadow-xs"
                              : isActive
                              ? "bg-[#0F5244] text-white shadow-xs"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : milestone.stepNumber}
                        </div>

                        {/* Title, Status Meta & Description */}
                        <div className="min-w-0 flex-1 space-y-1 text-start">
                          {/* Status Pill & Hours */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>{t("roadmap.completedBadge")}</span>
                              </span>
                            ) : isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0F5244] border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span>{t("roadmap.activeStepTag")}</span>
                              </span>
                            ) : isCapstone ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Award className="w-3 h-3 text-amber-600" />
                                <span>{t("roadmap.capstoneProjectTag")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                {t("roadmap.upcomingStepTag")}
                              </span>
                            )}

                            <span className="text-[11px] font-semibold text-slate-400">
                              • {t("roadmap.trainingHours", { count: milestone.durationWeeks * 3 })}
                            </span>
                          </div>

                          {/* Milestone Title */}
                          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {isAr ? milestone.titleAr : milestone.title}
                          </h3>

                          {/* Milestone Description */}
                          <p className="text-xs text-slate-500 font-normal leading-relaxed">
                            {isAr ? milestone.descriptionAr : milestone.description}
                          </p>
                        </div>
                      </div>

                      {/* Left Side (in RTL): Action Button & Sub-caption */}
                      <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 self-start sm:self-center">
                        {isActive ? (
                          <>
                            <Link
                              href={`/${locale}/courses/${firstCourse?.slug || firstCourse?.id || "ux-research-foundations"}`}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{t("roadmap.resumeLessonBtn")}</span>
                            </Link>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {t("roadmap.lessonsCompletedCount", { completed: 0, total: 6 })}
                            </span>
                          </>
                        ) : isCompleted ? (
                          <button
                            type="button"
                            onClick={() => handleMilestoneToggle(milestone.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{t("roadmap.completedBadge")}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMilestoneToggle(milestone.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <span>{t("roadmap.previewContentBtn")}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Project Tag + Skills Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100/90 text-xs">
                      {/* Practical Project Pill */}
                      {milestone.projectTitle && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/70">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>{t("roadmap.practicalProjectNum", { num: milestone.stepNumber })}</span>
                        </span>
                      )}

                      {/* Skills Chips */}
                      {(isAr ? milestone.skillsAr : milestone.skills).map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100/90 text-slate-600 border border-slate-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Mentorship Assistance Banner */}
            <div className="bg-[#0F5244] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-start">
              <div className="space-y-1">
                <h3 className="font-black text-sm sm:text-base text-white">
                  {t("roadmap.needReviewBannerTitle")}
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium">
                  {t("roadmap.needReviewBannerDesc")}
                </p>
              </div>

              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0F5244] font-black text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {t("roadmap.request1on1Btn")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
