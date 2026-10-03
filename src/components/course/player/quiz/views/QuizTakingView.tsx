"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
} from "lucide-react";
import { AiQuizDetails } from "@/types/quiz";

export interface QuizTakingViewProps {
  quizDetails: AiQuizDetails;
  currentQuestionIndex: number;
  answersMap: Record<number, number | boolean>;
  onSelectAnswer: (qId: number, answerVal: number | boolean) => void;
  onGoToQuestion: (index: number) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onSubmitQuiz: () => void;
  isSubmitting: boolean;
  submitError?: string;
  showUnansweredConfirm: boolean;
  onCancelUnansweredConfirm: () => void;
  onConfirmSubmitAnyway: () => void;
  isAr?: boolean;
}

export function QuizTakingView({
  quizDetails,
  currentQuestionIndex,
  answersMap,
  onSelectAnswer,
  onGoToQuestion,
  onPrevQuestion,
  onNextQuestion,
  onSubmitQuiz,
  isSubmitting,
  submitError,
  showUnansweredConfirm,
  onCancelUnansweredConfirm,
  onConfirmSubmitAnyway,
  isAr = false,
}: QuizTakingViewProps) {
  const currentQ = quizDetails.questions[currentQuestionIndex];
  if (!currentQ) return null;

  const currentAnswer = answersMap[currentQ.id];

  return (
    <motion.div
      key="taking"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* General notice banner if is_general === true */}
      {quizDetails.is_general && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {quizDetails.notice ||
              (isAr
                ? "تمت صياغة هذا الاختبار استناداً إلى عناوين الدروس وخطة الدورة العامة."
                : "This quiz was built from lesson titles and course curriculum.")}
          </span>
        </div>
      )}

      {/* Header ribbon: Question Tracker & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-black flex items-center justify-center font-mono">
            {currentQuestionIndex + 1}
          </span>
          <span className="text-xs font-bold text-slate-500">
            {isAr ? "من أصل" : "of"} {quizDetails.questions.length} {isAr ? "أسئلة" : "Questions"}
          </span>
        </div>

        {/* Navigation number pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quizDetails.questions.map((q, idx) => {
            const isAnswered = answersMap[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onGoToQuestion(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-xs scale-105"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Card */}
      <div className="space-y-6">
        {/* Question meta badge & text */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
              {currentQ.question_type === "true_false"
                ? isAr
                  ? "صح أم خطأ"
                  : "True / False"
                : isAr
                ? "اختيار من متعدد"
                : "Multiple Choice"}
            </span>
            {currentQ.source_lesson?.title && (
              <span className="text-xs text-slate-400 truncate max-w-xs">
                {currentQ.source_lesson.title}
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-relaxed">
            {currentQ.question_text}
          </h3>
        </div>

        {/* Options rendering */}
        {currentQ.question_type === "true_false" ? (
          /* True / False Options */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                val: true,
                label: isAr ? "صحيح (True)" : "True",
                icon: CheckCircle2,
              },
              {
                val: false,
                label: isAr ? "خطأ (False)" : "False",
                icon: XCircle,
              },
            ].map((tf) => {
              const isSelected = currentAnswer === tf.val;
              const IconComponent = tf.icon;

              return (
                <div
                  key={String(tf.val)}
                  onClick={() => onSelectAnswer(currentQ.id, tf.val)}
                  className={`p-5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    isSelected
                      ? "bg-emerald-50/90 border-emerald-500 shadow-xs ring-2 ring-emerald-500"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <IconComponent
                    className={`w-8 h-8 ${
                      isSelected ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    {tf.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Multiple Choice Options */
          <div className="space-y-2.5">
            {(currentQ.options && currentQ.options.length > 0
              ? currentQ.options
              : ["Option A", "Option B", "Option C", "Option D"]
            ).map((optText, optIdx) => {
              const isSelected = currentAnswer === optIdx;
              const optionLetters = ["A", "B", "C", "D", "E", "F"];

              return (
                <div
                  key={optIdx}
                  onClick={() => onSelectAnswer(currentQ.id, optIdx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
                      : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {optionLetters[optIdx] || optIdx + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                      {optText}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Error Banner */}
      {submitError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Unanswered confirmation warning modal */}
      {showUnansweredConfirm && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isAr
                ? "لديك أسئلة لم تقم بالإجابة عليها بعد. الأسئلة المتروكة تُحسب كإجابة خاطئة."
                : "You have unanswered questions. Any question left out counts as incorrect."}
            </span>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onCancelUnansweredConfirm}
              className="px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100/70"
            >
              {isAr ? "مراجعة الأسئلة" : "Review Questions"}
            </button>
            <button
              type="button"
              onClick={onConfirmSubmitAnyway}
              className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700"
            >
              {isAr ? "تسليم الاختبار على أي حال" : "Submit Anyway"}
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls: Prev / Next / Submit */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentQuestionIndex === 0}
          onClick={onPrevQuestion}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <span>{isAr ? "السابق" : "Previous"}</span>
        </button>

        <div className="flex items-center gap-2">
          {currentQuestionIndex < quizDetails.questions.length - 1 ? (
            <button
              type="button"
              onClick={onNextQuestion}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-[#0F5244] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onSubmitQuiz}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isAr ? "تسليم الاختبار وإنهاء المحاولة" : "Submit Quiz"}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
