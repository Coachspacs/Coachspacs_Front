"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Check,
  CheckCircle2,
  Lock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatedRobotCharacter } from "@/components/student/mypath/AnimatedRobotCharacter";
import { LessonItem } from "../../types";

export interface QuizConfigViewProps {
  questionCount: 5 | 10 | 15;
  onQuestionCountChange: (count: 5 | 10 | 15) => void;
  allLessons: LessonItem[];
  selectedLessonIds: number[];
  completedLessonIds?: string[];
  onToggleLesson: (lessonId: number) => void;
  onSelectAllUnlocked: () => void;
  onClearSelected: () => void;
  configError?: string;
  onBack: () => void;
  onStartGeneration: () => void;
  isAr?: boolean;
}

export function QuizConfigView({
  questionCount,
  onQuestionCountChange,
  allLessons,
  selectedLessonIds,
  completedLessonIds = [],
  onToggleLesson,
  onSelectAllUnlocked,
  onClearSelected,
  configError,
  onBack,
  onStartGeneration,
  isAr = false,
}: QuizConfigViewProps) {
  return (
    <motion.div
      key="configure"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* Greeting banner with AI Toy */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/70 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <AnimatedRobotCharacter size="xs" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              {isAr ? "خصص اختبارك التجريبي بالذكاء الاصطناعي" : "Configure Your AI Practice Quiz"}
            </h4>
            <p className="text-xs text-slate-600">
              {isAr
                ? "اختر من 1 إلى 10 دروس من هذه الدورة، وحدد عدد الأسئلة المطلوبة."
                : "Choose 1 to 10 lessons from this course and select question count."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-white transition-colors cursor-pointer shrink-0"
        >
          {isAr ? "← العودة للسجل" : "← Back to Quizzes"}
        </button>
      </div>

      {/* Question Count Selection (5, 10, 15) */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500">
          {isAr ? "1. عدد الأسئلة المطلوبة" : "1. Number of Questions"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              count: 5 as const,
              title: isAr ? "5 أسئلة" : "5 Questions",
              desc: isAr ? "مراجعة سريعة (3 دقائق)" : "Quick Check (~3 mins)",
            },
            {
              count: 10 as const,
              title: isAr ? "10 أسئلة" : "10 Questions",
              desc: isAr ? "اختبار قياسي موصى به" : "Standard (Recommended)",
              popular: true,
            },
            {
              count: 15 as const,
              title: isAr ? "15 سؤال" : "15 Questions",
              desc: isAr ? "اختبار شامل ومتعمق" : "Deep Challenge (~12 mins)",
            },
          ].map((item) => {
            const isSelected = questionCount === item.count;
            return (
              <div
                key={item.count}
                onClick={() => onQuestionCountChange(item.count)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-100/80 border-[var(--color-primary-main)] shadow-sm ring-1 ring-[var(--color-primary-main)]"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {item.popular && (
                  <span className="absolute -top-2.5 end-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[var(--color-primary-dark)] text-white shadow-2xs">
                    {isAr ? "موصى به" : "Popular"}
                  </span>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-black text-slate-900">{item.title}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-[var(--color-primary-main)] bg-[var(--color-primary-dark)] text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson Selection (1 to 10 lessons) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              {isAr ? "2. اختر الدروس المراد تضمينها" : "2. Select Lessons to Include"}
            </label>
            <span className="ms-2 text-xs font-bold text-[var(--color-primary-main)]">
              ({selectedLessonIds.length} / 10 {isAr ? "محددة" : "selected"})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAllUnlocked}
              className="text-xs font-bold text-[var(--color-primary-main)] hover:underline cursor-pointer"
            >
              {isAr ? "تحديد الكل (حتى 10)" : "Select Available (Max 10)"}
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={onClearSelected}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              {isAr ? "إلغاء التحديد" : "Clear"}
            </button>
          </div>
        </div>

        {/* Lessons list container */}
        <div className="border border-slate-200/80 rounded-2xl bg-white max-h-64 overflow-y-auto divide-y divide-slate-100 custom-scrollbar shadow-inner">
          {allLessons.map((lesson, idx) => {
            const numId = Number(lesson.id);
            const isSelected = selectedLessonIds.includes(numId);
            const isDone = completedLessonIds.includes(String(lesson.id));
            const isLocked = Boolean(lesson.is_locked);

            return (
              <div
                key={lesson.id || idx}
                onClick={() => {
                  if (!isLocked) onToggleLesson(numId);
                }}
                className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${
                  isLocked
                    ? "opacity-50 bg-slate-50/50 cursor-not-allowed"
                    : isSelected
                    ? "bg-slate-100/40 hover:bg-slate-100/60 cursor-pointer"
                    : "hover:bg-slate-50 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[var(--color-primary-dark)] border-[var(--color-primary-main)] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {lesson.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {lesson.sectionTitle ||
                        lesson.durationFormatted ||
                        lesson.duration ||
                        `Lesson ${idx + 1}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isDone && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-[var(--color-primary-main)] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--color-primary-main)]" />
                      <span>{isAr ? "مكتمل" : "Completed"}</span>
                    </span>
                  )}
                  {isLocked && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{isAr ? "مقفل" : "Locked"}</span>
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-400">
                    {lesson.durationFormatted ||
                      lesson.duration ||
                      (lesson.duration_minutes ? `${lesson.duration_minutes}:00` : "")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {configError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{configError}</span>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400 text-center sm:text-start">
          {isAr
            ? "يتم توليد الأسئلة فورياً استناداً إلى نصوص وشروحات الدروس المختارة."
            : "Questions are dynamically engineered from selected lesson content and syllabus."}
        </p>

        <button
          type="button"
          disabled={selectedLessonIds.length === 0 || selectedLessonIds.length > 10}
          onClick={onStartGeneration}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-dark hover:bg-[#07382E] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isAr
              ? `توليد الاختبار (${selectedLessonIds.length} دروس)`
              : `Generate Quiz (${selectedLessonIds.length} lessons)`}
          </span>
          {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}
