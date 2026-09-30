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
  Lightbulb,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { CleanHeroBanner } from "./CleanHeroBanner";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";
import { RobotJourneyBanner } from "./RobotJourneyBanner";
import { AiArchitectGenerationScreen } from "./AiArchitectGenerationScreen";
import { InteractiveCurriculumMap } from "./InteractiveCurriculumMap";
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

  const handleGenerationComplete = () => {
    const generated = generateRoadmapFromPreferences(preferences);
    setRoadmap(generated);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(generated));
    } catch {}
    soundFx.playCelebration();
    setStep(7);
    triggerConfetti();
  };

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

  const handleReorderMilestones = (newMilestones: RoadmapMilestone[]) => {
    if (!roadmap) return;
    const updatedRoadmap = { ...roadmap, milestones: newMilestones };
    setRoadmap(updatedRoadmap);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(updatedRoadmap));
    } catch {}
  };

  const handleRegenerate = () => {
    goToPrevStep(2);
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

  // Experience assessment quick suggestion prompts
  const quickExperienceIdeas = isAr
    ? [
        { id: "beginner", text: "+ مبتدئ بالكامل بدون مشاريع سابقة" },
        { id: "practice", text: "+ قمت ببناء مشاريع وتطبيقات تدريبية" },
        { id: "exp1", text: "+ خبرة عملية وتطبيقية من 1 إلى 2 سنة" },
        { id: "production", text: "+ عملت على تطبيقات ومشاريع حقيقية للعملاء" },
      ]
    : [
        { id: "beginner", text: "+ Total beginner (No prior projects)" },
        { id: "practice", text: "+ Built tutorial & practice projects" },
        { id: "exp1", text: "+ 1-2 years hands-on experience" },
        { id: "production", text: "+ Shipped real client/production apps" },
      ];

  const quickToolsIdeas = isAr
    ? [
        { id: "none", text: "+ لم أستخدم أدوات برمجية بعد" },
        { id: "html_css", text: "+ HTML & CSS" },
        { id: "js_ts", text: "+ JavaScript / TypeScript" },
        { id: "react_next", text: "+ React / Next.js" },
        { id: "python", text: "+ Python" },
        { id: "sql_db", text: "+ SQL / قواعد بيانات" },
        { id: "figma", text: "+ Figma / تصميم واجهات" },
        { id: "git", text: "+ Git & GitHub" },
      ]
    : [
        { id: "none", text: "+ No prior coding tools yet" },
        { id: "html_css", text: "+ HTML & CSS" },
        { id: "js_ts", text: "+ JavaScript / TypeScript" },
        { id: "react_next", text: "+ React / Next.js" },
        { id: "python", text: "+ Python" },
        { id: "sql_db", text: "+ SQL & Databases" },
        { id: "figma", text: "+ Figma / UI Tools" },
        { id: "git", text: "+ Git & GitHub" },
      ];

  // Hours per week options
  const hoursOptions: {
    id: WeeklyCommitment;
    title: string;
    desc: string;
    icon: LucideIcon;
    badge?: string;
  }[] = [
    {
      id: "1-2",
      title: isAr ? "1–2 ساعة / أسبوعياً" : "1–2 Hours / Week",
      desc: isAr ? "وتيرة هادئة تناسب الأوقات المزدحمة" : "Light pace for busy schedules",
      icon: Clock,
    },
    {
      id: "3-5",
      title: isAr ? "3–5 ساعات / أسبوعياً" : "3–5 Hours / Week",
      desc: isAr ? "وتيرة متوازنة لاكتساب المهارات بانتظام" : "Balanced pace for steady learning",
      icon: Flame,
      badge: isAr ? "موصى به" : "Recommended",
    },
    {
      id: "6-10",
      title: isAr ? "6–10 ساعات / أسبوعياً" : "6–10 Hours / Week",
      desc: isAr ? "مسار سريع وتطبيقات مكثفة" : "Fast-track with intense practice",
      icon: Rocket,
    },
    {
      id: "10+",
      title: isAr ? "أكثر من 10 ساعات" : "10+ Hours / Week",
      desc: isAr ? "انغماس كامل واحتراف في أسرع وقت" : "Full immersion for rapid mastery",
      icon: Zap,
    },
  ];

  // Skill Focus options
  const skillTracks: {
    id: LearningTrack;
    icon: LucideIcon;
    badge?: string;
    badgeColor?: string;
  }[] = useMemo(() => [
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
  ], [t]);

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skillTracks;
    const q = searchQuery.toLowerCase();
    return skillTracks.filter((s) => {
      const title = t(`wizard.skills.${s.id}.title`).toLowerCase();
      const desc = t(`wizard.skills.${s.id}.desc`).toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [searchQuery, t, skillTracks]);

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
      <div
        className={`transition-all relative ${
          step === 7
            ? "bg-transparent border-0 p-0 shadow-none"
            : "bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden p-5 sm:p-7"
        }`}
      >
        {/* Subtle Ambient Background Gradient matching Coach Space emerald tone */}
        {step !== 7 && (
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
        )}

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
        {/* STEP 3 (WIZARD 2 OF 4): SKILL FOCUS & TRACK SELECTION */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 relative z-10">
            {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
            <RobotJourneyBanner
              currentStepIndex={2}
              totalSteps={4}
              stepBadge={isAr ? "الخطوة 2 من 4 • اختيار المسار" : "Step 2 of 4 • Select Track"}
              stepCategory={isAr ? "التخصص والمسار" : "Track & Domain"}
              isAr={isAr}
            />

            {/* Step Header (Centered) */}
            <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("wizard.step4Title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                {isAr
                  ? "حدد التخصص أو المجال الذي ترغب بتعلمه لنقوم بطرح أسئلة الخبرة وبناء محطات التعلم المناسبة له."
                  : "Select your desired track so AI can calibrate your experience assessment and custom milestones."}
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
                className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl py-3 ps-10 pe-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-medium"
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
                    className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-medium"
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
        {/* STEP 4 (WIZARD 3 OF 4): KNOWLEDGE LEVEL ASSESSMENT */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6 relative z-10">
            {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
            <RobotJourneyBanner
              currentStepIndex={3}
              totalSteps={4}
              stepBadge={isAr ? "الخطوة 3 من 4 • تقييم المستوى" : "Step 3 of 4 • Skill Level"}
              stepCategory={isAr ? "المستوى الحالي" : "Current Level"}
              isAr={isAr}
            />

            {/* Step Header (Centered) */}
            <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("wizard.step2Title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                {t("wizard.step2Subtitle")}
              </p>
            </div>

            {/* Level Options List */}
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
                        <div className="w-5 h-5.5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-slate-200 bg-white" />
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
        {/* STEP 5 (WIZARD 4 OF 4): PRACTICAL EXPERIENCE & TECH STACK (FINAL STEP) */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-6 relative z-10">
            {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
            <RobotJourneyBanner
              currentStepIndex={4}
              totalSteps={4}
              stepBadge={isAr ? "الخطوة 4 من 4 • تقييم الخبرة" : "Step 4 of 4 • Experience Assessment"}
              stepCategory={isAr ? "الخبرة السابقة" : "Prior Experience"}
              isAr={isAr}
            />

            {/* Step Header */}
            <div className="text-center max-w-xl mx-auto pt-3 sm:pt-5 pb-1 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {isAr ? "أخبرنا عن خبرتك العملية ومشاريعك السابقة" : "Tell us about your prior experience and background"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "تساعدنا هذه الإجابات في تحديد نقطة انطلاقك الدقيقة وتخطي المواضيع التي تتقنها مسبقاً لتوفير وقتك."
                  : "These details allow the AI to pinpoint your exact starting point and bypass concepts you already know."}
              </p>
            </div>

            {/* Question 1 & Question 2 Cards (Without Quick Suggestions) */}
            <div className="space-y-5 pt-1 max-w-2xl mx-auto">
              {/* Question 1 Card: Previous Experience & Projects */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300/90 shadow-[0_6px_24px_-4px_rgba(15,82,68,0.06)] hover:shadow-[0_12px_32px_-6px_rgba(15,82,68,0.12)] p-5 sm:p-6 space-y-4 transition-all duration-300 text-start group"
              >
                <div className="flex items-baseline gap-2 text-start">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    <span className="text-emerald-700 font-black me-2 text-base sm:text-lg inline-block">1.</span>
                    {isAr
                      ? "ما هي خبرتك السابقة أو المشاريع التي قمت ببنائها في هذا التخصص؟"
                      : "What is your prior experience or projects built in this field?"}
                  </h3>
                </div>

                {/* Textarea */}
                <div className="relative group/input">
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={preferences.previousExperience || preferences.targetProjectOutcome || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreferences({
                        ...preferences,
                        previousExperience: val,
                        targetProjectOutcome: val,
                      });
                    }}
                    placeholder={
                      isAr
                        ? "مثال: بنيت مواقع شخصية بسيطة، طبّقت مشاريع دورات تدريبية، أو ليس لدي أي خبرة أو مشاريع سابقة بعد..."
                        : "e.g., Built personal landing pages, completed tutorial practice projects, or no prior projects yet..."
                    }
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all resize-none font-medium leading-relaxed shadow-2xs"
                  />
                  <div className="flex items-center justify-between pt-1.5 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isAr ? "كلما كان وصفك واضحاً، كانت نقطة البداية أكثر ملاءمة" : "Precise answers help AI set your exact starting milestone"}
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      {(preferences.previousExperience || preferences.targetProjectOutcome || "").length} / 500
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Question 2 Card: Tech Stack & Tools Used */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300/90 shadow-[0_6px_24px_-4px_rgba(15,82,68,0.06)] hover:shadow-[0_12px_32px_-6px_rgba(15,82,68,0.12)] p-5 sm:p-6 space-y-4 transition-all duration-300 text-start group"
              >
                <div className="flex items-baseline gap-2 text-start">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    <span className="text-emerald-700 font-black me-2 text-base sm:text-lg inline-block">2.</span>
                    {isAr
                      ? "ما هي الأدوات، اللغات، أو التقنيات (Tech Stack) التي تجيدها أو استخدمتها سابقاً؟"
                      : "What tools, programming languages, or tech stacks have you used?"}
                  </h3>
                </div>

                {/* Textarea */}
                <div className="relative group/input">
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={preferences.toolsAndTechStack || preferences.learningChallenges || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreferences({
                        ...preferences,
                        toolsAndTechStack: val,
                        learningChallenges: val,
                      });
                    }}
                    placeholder={
                      isAr
                        ? "مثال: أساسيات HTML/CSS، لغة JavaScript، تصاميم Figma، مكتبة React، أو لا توجد أدوات سابقة..."
                        : "e.g., HTML/CSS basics, JavaScript, React, Figma UI, Git, or Python..."
                    }
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all resize-none font-medium leading-relaxed shadow-2xs"
                  />
                  <div className="flex items-center justify-between pt-1.5 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isAr ? "يساعد الذكاء الاصطناعي على بناء تطبيقات ومشاريع تناسب خبرتك التقنية" : "Helps AI recommend appropriate toolchains and exercises"}
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      {(preferences.toolsAndTechStack || preferences.learningChallenges || "").length} / 500
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Security & Privacy AI Guarantee Note */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/80 p-3.5 sm:p-4 flex items-center gap-3.5 shadow-xs text-start">
                <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200/80 text-[#0F5244] flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                  {isAr
                    ? "كافة بياناتك وخبرتك السابقة تُستخدم حصرياً لمعايرة مسارك التعليمي الذكي وتخطي الأساسيات المكررة."
                    : "Your experience inputs are strictly encrypted and used exclusively by AI to calibrate your custom curriculum."}
                </p>
              </div>
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
        {/* STEP 6: AI GENERATING SIMULATION (AI ARCHITECT SCREEN) */}
        {/* ========================================================================= */}
        {step === 6 && (
          <AiArchitectGenerationScreen
            preferences={preferences}
            isAr={isAr}
            onComplete={handleGenerationComplete}
            onAdjustPreferences={() => goToPrevStep(5)}
          />
        )}

        {/* ========================================================================= */}
        {/* STEP 7: CREATIVE INTERACTIVE VISUAL CURRICULUM ROADMAP */}
        {/* ========================================================================= */}
        {step === 7 && roadmap && (
          <InteractiveCurriculumMap
            roadmap={roadmap}
            preferences={preferences}
            isAr={isAr}
            locale={locale}
            onMilestoneToggle={handleMilestoneToggle}
            onReorderMilestones={handleReorderMilestones}
            onRegenerate={handleRegenerate}
            onEditPreferences={() => goToPrevStep(5)}
          />
        )}
      </div>
    </motion.section>
  );
}
