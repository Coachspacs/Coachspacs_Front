"use client";

import React from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { AnimatedRobotCharacter } from "@/components/student/mypath/AnimatedRobotCharacter";

export interface QuizGeneratingViewProps {
  generationPhase: 1 | 2 | 3 | 4;
  generationProgress: number;
  generationError?: string;
  selectedLessonCount: number;
  questionCount: number;
  onRetry: () => void;
  onAdjustSelection: () => void;
  isAr?: boolean;
}

export function QuizGeneratingView({
  generationPhase,
  generationProgress,
  generationError,
  selectedLessonCount,
  questionCount,
  onRetry,
  onAdjustSelection,
  isAr = false,
}: QuizGeneratingViewProps) {
  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="py-10 text-center space-y-6 max-w-lg mx-auto"
    >
      {/* 3D Robot Mascot Toy with Jet Pulse & Glow */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-emerald-500/20 rounded-full blur-xl" />
          <AnimatedRobotCharacter size="lg" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {generationError
            ? isAr
              ? "تعذر إكمال توليد الاختبار"
              : "Quiz Generation Failed"
            : isAr
            ? "الذكاء الاصطناعي يبني اختبارك الآن..."
            : "AI is Crafting Your Practice Quiz..."}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {generationError ||
            (isAr
              ? `نقوم بتحليل ${selectedLessonCount} دروس لبناء ${questionCount} أسئلة ذكية تقيس مدى استيعابك بدقة.`
              : `Analyzing ${selectedLessonCount} selected lessons to synthesize ${questionCount} targeted questions.`)}
        </p>
      </div>

      {generationError ? (
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? "إعادة المحاولة" : "Try Again"}</span>
          </button>
          <button
            type="button"
            onClick={onAdjustSelection}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>{isAr ? "تعديل الخيارات" : "Adjust Selection"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar Container */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>
                  {generationPhase === 1 &&
                    (isAr
                      ? "استخلاص الأفكار من الدروس المختارة"
                      : "Extracting key concepts...")}
                  {generationPhase === 2 &&
                    (isAr
                      ? "صياغة أسئلة الاختيار من متعدد والصح/خطأ"
                      : "Formulating questions & options...")}
                  {generationPhase === 3 &&
                    (isAr
                      ? "إعداد الشروحات التفصيلية وربط الدروس"
                      : "Calibrating explanations & source lessons...")}
                  {generationPhase === 4 &&
                    (isAr
                      ? "تجهيز الاختبار للمراجعة والحل..."
                      : "Finalizing interactive arena...")}
                </span>
              </span>
              <span className="font-mono text-emerald-700 font-extrabold">
                {generationProgress}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#0F5244] rounded-full"
                initial={{ width: "20%" }}
                animate={{ width: `${generationProgress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {isAr
              ? "يستغرق التوليد بضع ثوانٍ عادةً بفضل محرك الذكاء الاصطناعي السحابي."
              : "Generation typically takes a few seconds via our cloud AI engine."}
          </p>
        </div>
      )}
    </motion.div>
  );
}
