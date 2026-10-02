"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Layers,
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
import { soundFx } from "@/lib/soundEffects";

interface AiArchitectGenerationScreenProps {
  preferences: MyPathPreferences;
  isAr?: boolean;
  locale?: string;
  isRegenerating?: boolean;
  onComplete: (roadmap?: GeneratedRoadmap) => void;
  onAdjustPreferences?: () => void;
}

type GenerationStatus = "generating" | "ready" | "unavailable" | "error";

export function AiArchitectGenerationScreen({
  preferences,
  isAr = false,
  locale = "en",
  isRegenerating = false,
  onComplete,
  onAdjustPreferences,
}: AiArchitectGenerationScreenProps) {
  const [status, setStatus] = useState<GenerationStatus>("generating");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [progress, setProgress] = useState<number>(20);
  const [isFinalDone, setIsFinalDone] = useState<boolean>(false);

  const apiFinishedRef = useRef<boolean>(false);
  const responseDataRef = useRef<RoadmapApiResponse | null>(null);

  // Dynamic track name for display
  const getDisplayTrackName = () => {
    if (isAr) {
      return preferences.categoryNameAr || preferences.categoryName || "البرمجة وتطوير البرمجيات";
    }
    return preferences.categoryName || preferences.track || "Programming";
  };

  // Primary Async Generator
  const executeGeneration = async () => {
    setStatus("generating");
    setErrorMessage("");
    apiFinishedRef.current = false;
    responseDataRef.current = null;

    try {
      const goal_text = preferences.goalText?.trim() || buildGoalText(preferences, isAr);
      const weekly_hours = preferences.weeklyHours || parseWeeklyHours(preferences.hoursPerWeek);
      const current_level = preferences.level || "beginner";
      const category = preferences.categoryId || 1;

      let response: RoadmapApiResponse;
      if (isRegenerating) {
        response = await roadmapService.regenerateRoadmap(
          {
            category,
            goal_text,
            weekly_hours,
            current_level,
          },
          locale
        );
      } else {
        response = await roadmapService.generateRoadmap(
          {
            category,
            goal_text,
            weekly_hours,
            current_level,
          },
          locale
        );
      }

      apiFinishedRef.current = true;
      responseDataRef.current = response;

      // Handle response status
      if (response?.status === "ready" && response.path?.steps && response.path.steps.length > 0) {
        const normalized = normalizeBackendRoadmap(response.path);
        setProgress(100);
        setIsFinalDone(true);
        setStatus("ready");
        soundFx.playCelebration();

        // Short celebration delay so the user sees 100% checkmark
        setTimeout(() => {
          onComplete(normalized);
        }, 800);
      } else if (response?.status === "unavailable") {
        setStatus("unavailable");
      } else {
        setStatus("unavailable");
      }
    } catch (err: any) {
      apiFinishedRef.current = true;
      setStatus("error");
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (err?.response?.status === 401
          ? (isAr ? "يرجى تسجيل الدخول بحساب طالب لتوليد المسار التعليمي." : "Please sign in as a student to generate your roadmap.")
          : (isAr ? "حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مجدداً." : "An error occurred connecting to the roadmap engine. Please retry."));
      setErrorMessage(msg);
    }
  };

  useEffect(() => {
    executeGeneration();
  }, []);

  // Visual phases timer (phases 1 -> 2 -> 3 -> 4)
  useEffect(() => {
    if (status !== "generating") return;

    const t1 = setTimeout(() => {
      setPhase(2);
      setProgress(48);
    }, 1200);

    const t2 = setTimeout(() => {
      setPhase(3);
      setProgress(74);
    }, 2800);

    const t3 = setTimeout(() => {
      setPhase(4);
      setProgress(92);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [status]);

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
            {isAr ? "AI ARCHITECT • محرك الذكاء الاصطناعي للمسارات" : "AI ARCHITECT • Learning Path Generator"}
          </span>
        </motion.div>
      </div>

      {/* 2. 3D AI Robot Character */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-8 bg-emerald-500/15 rounded-full blur-md" />
          <AnimatedRobotCharacter size="lg" />
        </div>
      </div>

      {/* 3. Main Headline & Description */}
      <div className="text-center space-y-2.5 mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {status === "unavailable"
            ? (isAr ? "لم نجد دورات كافية مطابقة لهذا الهدف حالياً" : "No published courses match this goal currently")
            : status === "error"
            ? (isAr ? "تعذّر إكمال التوليد الذكي للمسار" : "Roadmap generation could not be completed")
            : (isAr ? "الذكاء الاصطناعي يربط مسارك بالدورات المنشورة..." : "AI is structuring your roadmap with platform courses...")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-lg mx-auto leading-relaxed">
          {status === "unavailable"
            ? (isAr
                ? "يبحث الذكاء الاصطناعي حصرياً في الدورات المنشورة فعلياً في Coach Space. نقترح عليك اختيار مسار آخر متوفر (مثل البرمجة أو التدريب المهني)."
                : "Our AI matches exclusively active published courses on Coach Space. Try selecting another active track such as Programming or Career Coaching.")
            : status === "error"
            ? (errorMessage || (isAr ? "يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً." : "Please verify your session and retry."))
            : (isAr
                ? `نقوم بتحليل هدفك في مسار (${getDisplayTrackName()}) ومطابقته مع الدورات المتاحة لحساب الخطوات بدقة.`
                : `Analyzing your goal in (${getDisplayTrackName()}) and matching available published courses.`)}
        </p>
      </div>

      {/* 4. UNAVAILABLE STATE CARD */}
      {status === "unavailable" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-amber-200/90 shadow-sm p-6 sm:p-8 space-y-4 text-center mb-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {isAr ? "اختر مساراً من التخصصات المتاحة على المنصة" : "Choose from our active platform tracks"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {isAr
                ? "تتوفر على المنصة حالياً دورات منشورة في: البرمجة وتطوير البرمجيات (Programming)، إدارة وتطوير الأعمال (Business)، والتدريب المهني (Career)."
                : "Active courses are available in Programming, Business Coaching, Career Coaching, and Public Speaking."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={onAdjustPreferences}
              className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>{isAr ? "العودة واختيار مسار متوفر" : "Go Back & Select Active Track"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      )}

      {/* 5. ERROR STATE CARD */}
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-rose-200 shadow-sm p-6 sm:p-8 space-y-4 text-center mb-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {isAr ? "حدث خطأ أثناء المعالجة" : "Generation Request Failed"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {errorMessage || (isAr ? "تعذّر إكمال الطلب، يرجى إعادة المحاولة." : "Could not complete request. Please retry.")}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={executeGeneration}
              className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? "إعادة المحاولة" : "Retry"}</span>
            </button>
            <button
              type="button"
              onClick={onAdjustPreferences}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>{isAr ? "تعديل المدخلات" : "Adjust Inputs"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 6. Active Progress Section Box */}
      {(status === "generating" || status === "ready") && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span>
                {phase === 1 && (isAr ? "تحليل الهدف التعليمي والمسار المختار" : "Analyzing goal & selected track")}
                {phase === 2 && (isAr ? "مطابقة الدورات المنشورة في قاعدة البيانات" : "Matching published platform courses")}
                {phase === 3 && (isAr ? "هيكلة وترتيب المراحل والمحطات" : "Sequencing roadmap milestones")}
                {phase === 4 && (isAr ? "تجهيز الخارطة التفاعلية وتخصيصها..." : "Finalizing your interactive map...")}
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
      )}

      {/* 7. Checklist Cards */}
      {(status === "generating" || status === "ready") && (
        <div className="space-y-3 mb-6">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
              phase >= 1 ? "bg-white border-slate-200/90 shadow-2xs" : "bg-slate-50/60 border-slate-200/40 opacity-60"
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
                  {isAr ? "تحليل الهدف والمسار المحدد" : "Analyzing goal & track"}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {isAr ? `المسار المختار: ${getDisplayTrackName()}` : `Selected track: ${getDisplayTrackName()}`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
              {isAr ? "منجز" : "Done"}
            </span>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
              phase >= 2 ? "bg-white border-slate-200/90 shadow-2xs" : "bg-slate-50/60 border-slate-200/40 opacity-70"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  phase >= 2 ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}
              >
                {phase >= 2 ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
              </div>
              <div className="min-w-0 flex-1 text-start">
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {isAr ? "مطابقة الدورات المنشورة في المنصة" : "Matching published platform courses"}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {isAr ? "فحص الدورات المنشورة وتأكيد توفرها للدراسة" : "Screening active database courses"}
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

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
              phase >= 3 ? "bg-white border-slate-200/90 shadow-2xs" : "bg-slate-50/60 border-slate-200/40 opacity-70"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  phase >= 3 ? "bg-emerald-600 text-white shadow-xs" : phase === 2 ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-400"
                }`}
              >
                {phase >= 3 ? <CheckCircle2 className="w-5 h-5" /> : phase === 2 ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : <Layers className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="min-w-0 flex-1 text-start">
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {isAr ? "هيكلة وترتيب المراحل والمحطات" : "Sequencing roadmap milestones"}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {isAr ? `توزيع الساعات (${preferences.weeklyHours || 6} ساعات/أسبوع)` : `Calibrated for ${preferences.weeklyHours || 6}h/week`}
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

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
              phase >= 4 ? "bg-emerald-50/50 border-emerald-200/80 shadow-2xs" : "bg-slate-50/60 border-slate-200/40 opacity-70"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isFinalDone ? "bg-emerald-600 text-white shadow-xs" : phase >= 4 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}
              >
                {isFinalDone ? <CheckCircle2 className="w-5 h-5" /> : phase >= 4 ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : <Sparkles className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="min-w-0 flex-1 text-start">
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {isAr ? "تجهيز الخارطة التفاعلية وحفظ المسار" : "Finalizing your interactive map"}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {isAr ? "ربط خطوات التعلم ومحطات التقييم والمشاريع" : "Linking course stations and projects"}
                </p>
              </div>
            </div>
            {isFinalDone ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs shrink-0">
                {isAr ? "مكتمل" : "Ready"}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {isAr ? "جاري التجهيز..." : "Processing..."}
              </span>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default AiArchitectGenerationScreen;
