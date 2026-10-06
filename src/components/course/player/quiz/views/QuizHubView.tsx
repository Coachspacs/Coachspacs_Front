"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  HelpCircle,
  Award,
} from "lucide-react";
import { AnimatedRobotCharacter } from "@/components/student/mypath/AnimatedRobotCharacter";
import { AiQuizListItem } from "@/types/quiz";

export interface QuizHubViewProps {
  pastQuizzes: AiQuizListItem[];
  isLoadingPastQuizzes: boolean;
  onCreateNew: () => void;
  onOpenQuiz: (quizId: number) => void;
  isAr?: boolean;
}

export function QuizHubView({
  pastQuizzes,
  isLoadingPastQuizzes,
  onCreateNew,
  onOpenQuiz,
  isAr = false,
}: QuizHubViewProps) {
  return (
    <motion.div
      key="hub"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* Hero Greeting with AI Mascot */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-start flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 text-[var(--color-primary-main)] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary-main)]" />
            <span>{isAr ? "مدربك الذكي الشخصي" : "Your AI Study Companion"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isAr
              ? "اختبر استيعابك وتدرب بذكاء على دروسك"
              : "Practice & Master Course Lessons with AI"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
            {isAr
              ? "يقوم الروبوت الذكي بتحليل الدروس المختارة وإنشاء أسئلة تفاعلية فورية تقيس فهمك الحقيقي وتقدم شروحات توضيحية لكل سؤال."
              : "Select any lessons from this course. The AI robot analyzes key concepts and crafts targeted practice questions with instant feedback."}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 bg-brand-dark hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? "إنشاء اختبار تجريبي جديد" : "Create New Practice Quiz"}</span>
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3D Animated AI Mascot Toy */}
        <div className="shrink-0 flex justify-center">
          <div className="relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-1000/20 rounded-full blur-md" />
            <AnimatedRobotCharacter size="md" />
          </div>
        </div>
      </div>

      {/* Past Quizzes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-primary-main)]" />
            <span>
              {isAr
                ? "الاختبارات التي تم إنشاؤها لهذه الدورة"
                : "Previous Quizzes for this Course"}
            </span>
          </h4>
          <span className="text-xs text-slate-400 font-medium font-mono">
            {pastQuizzes.length} {isAr ? "اختبار" : "quizzes"}
          </span>
        </div>

        {isLoadingPastQuizzes ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 text-[var(--color-primary-main)] animate-spin" />
            <p className="text-xs font-bold">
              {isAr ? "جاري تحميل سجل الاختبارات..." : "Loading previous quizzes..."}
            </p>
          </div>
        ) : pastQuizzes.length === 0 ? (
          <div className="py-10 px-4 text-center bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 border border-slate-200 flex items-center justify-center mx-auto shadow-2xs">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                {isAr
                  ? "لم تقم بإنشاء اختبارات لهذه الدورة بعد"
                  : "No practice quizzes generated yet"}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isAr
                  ? "اضغط على زر 'إنشاء اختبار' لاختيار الدروس وتوليد أول اختبار تجريبي لك."
                  : "Click 'Create New Quiz' above to pick lessons and generate your first AI practice quiz."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pastQuizzes.map((quiz) => {
              const hasAttempt = Boolean(
                quiz.latest_attempt || quiz.latest_score !== undefined
              );
              const scoreVal = quiz.latest_attempt?.score ?? quiz.latest_score;
              const isScoreGood = typeof scoreVal === "number" && scoreVal >= 70;

              return (
                <div
                  key={quiz.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        #{quiz.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          quiz.status === "ready"
                            ? "bg-slate-100 text-[var(--color-primary-main)] border border-slate-200/70"
                            : quiz.status === "failed"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Award className="w-4 h-4 text-[var(--color-primary-main)]" />
                      <span>
                        {quiz.question_count || 5} {isAr ? "أسئلة" : "Questions"}
                      </span>
                      {quiz.is_general && (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {isAr ? "شامل" : "General"}
                        </span>
                      )}
                    </div>

                    {hasAttempt && typeof scoreVal === "number" ? (
                      <div className="flex items-center gap-2 pt-1">
                        <div
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            isScoreGood
                              ? "bg-slate-200/80 text-[var(--color-primary-main)] border border-slate-300"
                              : "bg-amber-100/80 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {Math.round(scoreVal)}% {isScoreGood ? "✓" : ""}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {isAr ? "النتيجة الأخيرة" : "Latest score"}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 pt-1">
                        {isAr ? "جاهز للحل الآن" : "Ready to take"}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : ""}
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenQuiz(quiz.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-dark text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <span>
                        {hasAttempt
                          ? isAr
                            ? "عرض النتيجة"
                            : "Review"
                          : isAr
                          ? "ابدأ الاختبار"
                          : "Take Quiz"}
                      </span>
                      {isAr ? (
                        <ChevronLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
