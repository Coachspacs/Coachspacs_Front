"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Lightbulb,
  SlidersHorizontal,
  Bot,
  Layers,
  GraduationCap,
  Calendar,
  Compass,
} from "lucide-react";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";
import {
  MyPathPreferences,
  GeneratedRoadmap,
  RoadmapApiResponse,
  buildGoalText,
  parseWeeklyHours,
  normalizeBackendRoadmap,
} from "@/types/mypath";
import { roadmapService } from "@/services/roadmapService";
import { generateRoadmapFromPreferences } from "@/lib/myPathGenerator";

interface AiArchitectGenerationScreenProps {
  preferences: MyPathPreferences;
  isAr?: boolean;
  locale?: string;
  isRegenerating?: boolean;
  onComplete: (roadmap?: GeneratedRoadmap) => void;
  onAdjustPreferences?: () => void;
}

export function AiArchitectGenerationScreen({
  preferences,
  isAr = false,
  locale = "en",
  isRegenerating = false,
  onComplete,
  onAdjustPreferences,
}: AiArchitectGenerationScreenProps) {
  const generatedRoadmapRef = React.useRef<GeneratedRoadmap | null>(null);

  // Phase 1 (0-1s), Phase 2 (1-2s), Phase 3 (2-3s), Phase 4 (3-4s)
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [isFinalDone, setIsFinalDone] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(20);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(7);

  // Dynamic career title based on track
  const getCareerTitle = () => {
    if (preferences.customTrackName) return preferences.customTrackName;
    switch (preferences.track) {
      case "uiux":
        return isAr ? "أخصائي تصميم واجهات وتجربة المستخدم (UI/UX Specialist)" : "Senior UI/UX Specialist";
      case "frontend":
        return isAr ? "مطور واجهات أمامية محترف (Frontend Engineer)" : "Frontend Web Architect";
      case "backend":
        return isAr ? "مهندس بنية خلفية وسحابية (Backend Engineer)" : "Backend Cloud Engineer";
      case "fullstack":
        return isAr ? "مطور شامل متكامل (Full-Stack Developer)" : "Full-Stack Software Engineer";
      case "ai":
        return isAr ? "مهندس ذكاء اصطناعي وتعلّم آلة (AI & ML Engineer)" : "AI & Machine Learning Engineer";
      case "data":
        return isAr ? "عالم ومحلل بيانات (Data Scientist)" : "Data Science & Analytics Specialist";
      case "mobile":
        return isAr ? "مطور تطبيقات الموبايل (Mobile App Developer)" : "Cross-Platform Mobile Engineer";
      case "cloud":
        return isAr ? "مهندس حوسبة سحابية (Cloud & DevOps Architect)" : "Cloud & DevOps Architect";
      default:
        return isAr ? "متخصص تقني معتمد" : "Certified Software Professional";
    }
  };

  const getWeeksCount = () => {
    switch (preferences.targetMonths) {
      case "1":
        return isAr ? "4 أسابيع مكثفة" : "4 active weeks";
      case "6":
        return isAr ? "24 أسبوعاً" : "24 active weeks";
      case "3":
      default:
        return isAr ? "12 أسبوعاً منظماً" : "12 active weeks";
    }
  };

  // Trigger backend roadmap generation in parallel with the 4-phase animation
  useEffect(() => {
    let isCancelled = false;

    const generateAsync = async () => {
      try {
        const goal_text = buildGoalText(preferences);
        const weekly_hours = parseWeeklyHours(preferences.hoursPerWeek);
        const current_level =
          preferences.level === "beginner"
            ? "beginner"
            : preferences.level === "advanced"
            ? "advanced"
            : "intermediate";

        let response: RoadmapApiResponse;
        if (isRegenerating) {
          response = await roadmapService.regenerateRoadmap(
            {
              goal_text,
              weekly_hours,
              current_level,
            },
            locale
          );
        } else {
          response = await roadmapService.generateRoadmap(
            {
              goal_text,
              weekly_hours,
              current_level,
            },
            locale
          );
        }

        if (
          !isCancelled &&
          response?.path &&
          response.path.steps &&
          response.path.steps.length > 0
        ) {
          const normalized = normalizeBackendRoadmap(response.path);
          generatedRoadmapRef.current = normalized;
        }
      } catch (err) {
        console.warn("AI roadmap generation fallback to client generator:", err);
      }
    };

    generateAsync();

    return () => {
      isCancelled = true;
    };
  }, [preferences, isRegenerating, locale]);

  useEffect(() => {
    // 1. Initial 1s countdown tick
    const sec1 = setTimeout(() => setSecondsRemaining(6), 1000);

    // 2. Phase 1 -> Phase 2 at 1600ms
    const t1 = setTimeout(() => {
      setPhase(2);
      setProgress(50);
      setSecondsRemaining(5);
    }, 1600);

    const sec2 = setTimeout(() => setSecondsRemaining(4), 2600);

    // 3. Phase 2 -> Phase 3 at 3400ms
    const t2 = setTimeout(() => {
      setPhase(3);
      setProgress(78);
      setSecondsRemaining(3);
    }, 3400);

    const sec3 = setTimeout(() => setSecondsRemaining(2), 4400);

    // 4. Phase 3 -> Phase 4 at 5200ms
    const t3 = setTimeout(() => {
      setPhase(4);
      setProgress(94);
      setSecondsRemaining(1);
    }, 5200);

    // 5. Card 4 completes -> 100% at 6600ms
    const t4 = setTimeout(() => {
      setIsFinalDone(true);
      setProgress(100);
      setSecondsRemaining(0);
    }, 6600);

    // 6. Smooth finish and navigation at 7500ms
    const t5 = setTimeout(() => {
      const finalRoadmap =
        generatedRoadmapRef.current || generateRoadmapFromPreferences(preferences);
      onComplete(finalRoadmap);
    }, 7500);

    return () => {
      clearTimeout(sec1);
      clearTimeout(t1);
      clearTimeout(sec2);
      clearTimeout(t2);
      clearTimeout(sec3);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete, preferences]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      dir={isAr ? "rtl" : "ltr"}
      className="max-w-2xl mx-auto py-6 sm:py-10 px-4 sm:px-6 relative z-10"
    >
      {/* Background soft glow halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* 1. Top Architect Badge */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs text-xs font-bold text-emerald-800"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="tracking-wide">
            {isAr ? "AI ARCHITECT • جاري توليد المسار التعليمي" : "AI ARCHITECT • Generating Learning Path"}
          </span>
        </motion.div>
      </div>

      {/* 2. Cute 3D AI Robot Character */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {/* Subtle glowing disk beneath robot */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-8 bg-emerald-500/15 rounded-full blur-md" />
          <AnimatedRobotCharacter size="lg" />
        </div>
      </div>

      {/* 3. Main Headline & Description */}
      <div className="text-center space-y-2.5 mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {isAr
            ? "الذكاء الاصطناعي يقوم ببناء مسارك التعليمي المخصص..."
            : "AI is creating your personalized learning path..."}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-lg mx-auto leading-relaxed">
          {isAr
            ? "نقوم بتحليل أهدافك، مستواك الحالي، والوقت المتاح لبناء منهج تعليمي متكامل ومتسلسل يضمن وصولك لهدفك بأسرع وقت."
            : "Analyzing your goals, level, and available time to generate a seamless, sequential curriculum."}
        </p>
      </div>

      {/* 4. Progress Section Box */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
            </span>
            <span>
              {phase === 1 && (isAr ? "تحليل الأهداف والمسار المهني" : "Analyzing career goals & skill level")}
              {phase === 2 && (isAr ? "فحص ومطابقة الدورات الأكاديمية" : "Matching available curriculum & labs")}
              {phase === 3 && (isAr ? "تنسيق وترتيب وحدات المسار" : "Curating Path Modules")}
              {phase === 4 && (isAr ? "وضع اللمسات الأخيرة وتخصيص الخطة" : "Finalizing personalized milestones")}
            </span>
          </div>
          <span className="font-mono font-extrabold text-emerald-700">{progress}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#0F5244] rounded-full shadow-inner"
            initial={{ width: "15%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* 5. The 4 Step Cards Checklist */}
      <div className="space-y-3 mb-6">
        {/* Card 1: Analyzing goals */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
            phase >= 1
              ? "bg-white border-slate-200/90 shadow-2xs"
              : "bg-slate-50/60 border-slate-200/40 opacity-60"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                phase >= 1 ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1 text-start">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {isAr ? "تحليل أهدافك وتفضيلاتك" : "Analyzing your goals"}
              </h4>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {isAr ? `المسار المستهدف: ${getCareerTitle()}` : `Identified target career: ${getCareerTitle()}`}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
            {isAr ? "منجز" : "Done"}
          </span>
        </motion.div>

        {/* Card 2: Matching courses */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
            phase >= 2
              ? "bg-white border-slate-200/90 shadow-2xs"
              : "bg-slate-50/60 border-slate-200/40 opacity-70"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                phase >= 2
                  ? "bg-emerald-600 text-white shadow-xs"
                  : phase === 1
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {phase >= 2 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-start">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {isAr ? "مطابقة الكورسات والمسارات المناسبة" : "Matching available courses"}
              </h4>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {isAr
                  ? "تم فحص أكثر من 240 وحدة تعليمية وتطبيق عملي"
                  : "Screened 240+ academy modules & real-world labs"}
              </p>
            </div>
          </div>
          {phase >= 2 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
              {isAr ? "منجز" : "Done"}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? "جاري الفحص..." : "Scanning..."}
            </span>
          )}
        </motion.div>

        {/* Card 3: Building your path */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
            phase >= 3
              ? "bg-white border-slate-200/90 shadow-2xs"
              : "bg-slate-50/60 border-slate-200/40 opacity-70"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                phase >= 3
                  ? "bg-emerald-600 text-white shadow-xs"
                  : phase === 2
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {phase >= 3 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : phase === 2 ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              ) : (
                <Layers className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-start">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {isAr ? "هيكلة وبناء المسار التتابعي" : "Building your path"}
              </h4>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {isAr
                  ? `تنظيم 4 محطات رئيسية عبر ${getWeeksCount()}`
                  : `Optimizing 4 key milestones across ${getWeeksCount()}`}
              </p>
            </div>
          </div>
          {phase >= 3 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
              {isAr ? "منجز" : "Done"}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? "جاري الترتيب..." : "Sequencing..."}
            </span>
          )}
        </motion.div>

        {/* Card 4: Finalizing your plan */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
            phase >= 4
              ? "bg-emerald-50/50 border-emerald-200/80 shadow-2xs"
              : "bg-slate-50/60 border-slate-200/40 opacity-70"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isFinalDone
                  ? "bg-emerald-600 text-white shadow-xs"
                  : phase >= 4
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {isFinalDone ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : phase >= 4 ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              ) : (
                <Sparkles className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-start">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {isAr ? "وضع اللمسات الأخيرة وتخصيص الخطة..." : "Finalizing your plan..."}
              </h4>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {isAr
                  ? "تخصيص بنوك الأسئلة وجدول المواعيد الذكي"
                  : "Tailoring practice quizzes & scheduling calendar"}
              </p>
            </div>
          </div>
          {isFinalDone ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
              {isAr ? "منجز" : "Done"}
            </span>
          ) : phase >= 4 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300/60 shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              {isAr ? "جاري التركيب" : "Synthesizing"}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 shrink-0 flex items-center gap-1.5">
              {isAr ? "قيد الانتظار" : "Pending"}
            </span>
          )}
        </motion.div>
      </div>

      {/* 6. "Did you know?" Tip Callout Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-2xl bg-[#F0FAF6] border border-emerald-200/70 flex items-start gap-3 shadow-2xs mb-6 text-start"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-[#0F5244] flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <p className="text-xs text-emerald-900/90 font-medium leading-relaxed">
          <strong className="font-extrabold text-emerald-950">
            {isAr ? "هل تعلم؟ " : "Did you know? "}
          </strong>
          {isAr
            ? "الطلاب الذين يدرسون وفق مسارات تعليمية موجهة ومنظمة يحققون أهدافهم أسرع بـ 2.4 مرة مقارنة بالتعلم الذاتي غير المنظم."
            : "Learners studying with automated modular roadmaps finish their goals 2.4x faster than self-paced unstructured learners."}
        </p>
      </motion.div>

      {/* 7. Bottom Navigation & Countdown Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60 font-medium">
        {onAdjustPreferences ? (
          <button
            type="button"
            onClick={onAdjustPreferences}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isAr ? "تعديل التفضيلات" : "Adjust preferences"}</span>
          </button>
        ) : (
          <div />
        )}

        <div className="font-mono text-[11px] text-slate-400">
          {isAr
            ? `الوقت التقديري المتبقي: ~${secondsRemaining} ثوانٍ`
            : `Est. remaining: ~${secondsRemaining} seconds`}
        </div>
      </div>
    </motion.div>
  );
}

export default AiArchitectGenerationScreen;
