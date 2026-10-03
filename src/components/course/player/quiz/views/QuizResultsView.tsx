"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  RotateCcw,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { AnimatedRobotCharacter } from "@/components/student/mypath/AnimatedRobotCharacter";
import {
  NormalizedSubmissionResult,
  calculateQuizScore,
} from "../utils/quizNormalizer";
import { AiQuizQuestion } from "@/types/quiz";

export interface QuizResultsViewProps {
  submissionResult: NormalizedSubmissionResult;
  quizQuestions?: AiQuizQuestion[];
  reviewFilter: "all" | "correct" | "incorrect";
  onFilterChange: (filter: "all" | "correct" | "incorrect") => void;
  onRetakeQuiz: () => void;
  onNewQuiz: () => void;
  onViewHistory: () => void;
  onReviewLesson?: (lessonId: number) => void;
  isAr?: boolean;
}

export function QuizResultsView({
  submissionResult,
  quizQuestions = [],
  reviewFilter,
  onFilterChange,
  onRetakeQuiz,
  onNewQuiz,
  onViewHistory,
  onReviewLesson,
  isAr = false,
}: QuizResultsViewProps) {
  // Guaranteed non-NaN score calculation
  const safeScore = calculateQuizScore(
    submissionResult.score,
    submissionResult.correct_count,
    submissionResult.total_questions
  );

  const totalQuestions =
    submissionResult.total_questions ||
    submissionResult.reviewItems.length ||
    quizQuestions.length ||
    5;

  const correctCount = submissionResult.correct_count ?? 0;
  const incorrectCount = Math.max(0, totalQuestions - correctCount);

  // Filter review items
  const filteredItems = submissionResult.reviewItems.filter((item) => {
    if (reviewFilter === "correct") return item.is_correct;
    if (reviewFilter === "incorrect") return !item.is_correct;
    return true;
  });

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* Hero Results Banner with Mascot */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-6 sm:p-7 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-start">
        <div className="space-y-2 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? "تم تصحيح الاختبار بنجاح" : "Quiz Scored & Reviewed"}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {safeScore >= 80
              ? isAr
                ? "ممتاز! استيعاب استثنائي للدروس 🌟"
                : "Outstanding Mastery! 🌟"
              : safeScore >= 60
              ? isAr
                ? "أداء جيد جداً! استمر بالتقدم 👏"
                : "Great Job! Well done 👏"
              : isAr
              ? "مجهود طيب! راجع الدروس لتعزيز فهمك 💪"
              : "Good Attempt! Review the lessons below 💪"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
            {isAr
              ? `لقد أجبت بشكل صحيح على ${correctCount} من أصل ${totalQuestions} أسئلة.`
              : `You answered ${correctCount} of ${totalQuestions} questions correctly.`}
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 justify-center sm:justify-start">
            <button
              type="button"
              onClick={onRetakeQuiz}
              className="inline-flex items-center gap-1.5 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? "إعادة المحاولة" : "Retake Quiz"}</span>
            </button>

            <button
              type="button"
              onClick={onNewQuiz}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "إنشاء اختبار جديد" : "New Quiz"}</span>
            </button>

            <button
              type="button"
              onClick={onViewHistory}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2.5 rounded-xl cursor-pointer"
            >
              <span>{isAr ? "سجل الاختبارات" : "Quiz History"}</span>
            </button>
          </div>
        </div>

        {/* Score circle badge & AI Mascot Toy */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-emerald-500/80 shadow-lg flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {safeScore}%
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                {isAr ? "النتيجة" : "Score"}
              </span>
            </div>
          </div>
          <AnimatedRobotCharacter size="xs" />
        </div>
      </div>

      {/* Filter buttons: All / Correct / Incorrect */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
          {isAr ? "مراجعة الأسئلة والشروحات التوضيحية" : "Question Review & AI Explanations"}
        </h4>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              reviewFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500"
            }`}
          >
            {isAr ? "الكل" : "All"} ({totalQuestions})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("correct")}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              reviewFilter === "correct"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-500"
            }`}
          >
            {isAr ? "صحيح" : "Correct"} ({correctCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("incorrect")}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              reviewFilter === "incorrect"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-500"
            }`}
          >
            {isAr ? "خاطئ" : "Incorrect"} ({incorrectCount})
          </button>
        </div>
      </div>

      {/* Detailed List of Questions with Explanations and Source Lessons */}
      {filteredItems.length === 0 ? (
        <div className="py-8 px-4 text-center bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-bold text-slate-600">
            {isAr ? "لا توجد أسئلة تطابق هذا التصنيف." : "No questions match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((reviewItem, idx) => {
            const isMultipleChoice = reviewItem.question_type === "multiple_choice";
            const options = reviewItem.options || [];

            // Helper to format selected answer display
            const formatSelectedAnswer = () => {
              if (reviewItem.selected_answer === null || reviewItem.selected_answer === undefined) {
                return isAr ? "لم تتم الإجابة" : "Not answered";
              }
              if (isMultipleChoice) {
                if (
                  typeof reviewItem.selected_answer === "number" &&
                  options[reviewItem.selected_answer]
                ) {
                  return options[reviewItem.selected_answer];
                }
                return String(reviewItem.selected_answer);
              }
              // True / False
              if (typeof reviewItem.selected_answer === "boolean") {
                return reviewItem.selected_answer
                  ? isAr
                    ? "صحيح (True)"
                    : "True"
                  : isAr
                  ? "خطأ (False)"
                  : "False";
              }
              return String(reviewItem.selected_answer);
            };

            // Helper to format correct answer display
            const formatCorrectAnswer = () => {
              if (isMultipleChoice) {
                if (
                  typeof reviewItem.correct_answer === "number" &&
                  options[reviewItem.correct_answer]
                ) {
                  return options[reviewItem.correct_answer];
                }
                return String(reviewItem.correct_answer || "");
              }
              // True / False
              if (typeof reviewItem.correct_answer === "boolean") {
                return reviewItem.correct_answer
                  ? isAr
                    ? "صحيح (True)"
                    : "True"
                  : isAr
                  ? "خطأ (False)"
                  : "False";
              }
              return String(reviewItem.correct_answer || "True");
            };

            return (
              <div
                key={reviewItem.question_id || idx}
                className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                  reviewItem.is_correct
                    ? "bg-white border-emerald-200/80 shadow-2xs"
                    : "bg-white border-rose-200/80 shadow-2xs"
                }`}
              >
                {/* Header: Question Status Badge & Question Text */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          reviewItem.is_correct
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {reviewItem.is_correct ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isAr ? "إجابة صحيحة" : "Correct"}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>{isAr ? "إجابة خاطئة" : "Incorrect"}</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-sm font-black text-slate-900 pt-1 leading-snug">
                      {reviewItem.question_text}
                    </p>
                  </div>
                </div>

                {/* Answer comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Student's answer */}
                  <div
                    className={`p-2.5 rounded-xl border ${
                      reviewItem.is_correct
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                        : "bg-rose-50/70 border-rose-200 text-rose-900"
                    }`}
                  >
                    <span className="text-[10px] font-bold block opacity-75">
                      {isAr ? "إجابتك المختارة:" : "Your Answer:"}
                    </span>
                    <span className="font-bold">{formatSelectedAnswer()}</span>
                  </div>

                  {/* Correct answer */}
                  <div className="p-2.5 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-900">
                    <span className="text-[10px] font-bold block opacity-75">
                      {isAr ? "الإجابة الصحيحة:" : "Correct Answer:"}
                    </span>
                    <span className="font-bold">{formatCorrectAnswer()}</span>
                  </div>
                </div>

                {/* AI Explanation Box */}
                {reviewItem.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? "توضيح الذكاء الاصطناعي:" : "AI Explanation:"}</span>
                    </span>
                    <p className="text-slate-600 leading-relaxed font-normal">
                      {reviewItem.explanation}
                    </p>
                  </div>
                )}

                {/* Source Lesson Shortcut */}
                {reviewItem.source_lesson && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        onReviewLesson &&
                        reviewItem.source_lesson?.id &&
                        onReviewLesson(reviewItem.source_lesson.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isAr
                          ? `مراجعة الدرس: ${reviewItem.source_lesson.title}`
                          : `Review Lesson: ${reviewItem.source_lesson.title}`}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
