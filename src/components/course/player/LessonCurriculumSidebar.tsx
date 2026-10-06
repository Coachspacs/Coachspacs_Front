"use client";

import React from "react";
import {
  BookOpen,
  Search,
  X,
  ChevronUp,
  Check,
  Lock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { SectionItem, LessonItem } from "./types";

interface LessonCurriculumSidebarProps {
  theaterMode: boolean;
  sidebarOpen: boolean;
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredSections: SectionItem[];
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  allLessons: LessonItem[];
  activeLessonIndex: number;
  completedLessonIds: string[];
  onSelectLesson: (index: number) => void;
  setIsPlaying: (val: boolean) => void;
  onOpenAiQuiz?: () => void;
  isAr: boolean;
  t: any;
}

export function LessonCurriculumSidebar({
  theaterMode,
  sidebarOpen,
  completedCount,
  totalLessons,
  progressPercent,
  searchQuery,
  setSearchQuery,
  filteredSections,
  openSections,
  setOpenSections,
  allLessons,
  activeLessonIndex,
  completedLessonIds,
  onSelectLesson,
  setIsPlaying,
  onOpenAiQuiz,
  isAr,
  t,
}: LessonCurriculumSidebarProps) {
  return (
    <div className="w-full shrink-0">
      <div className="w-full bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
        {/* Sidebar Header: Course Content & Overall Progress */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                  {t("courseContent")}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {t("lessonsCompleted", { count: completedCount, total: totalLessons })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-slate-800">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Minimal Progress Bar with Green Fill */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-dark h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Lesson Search Input Field */}
          <div className="relative flex items-center pt-0.5">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center justify-center">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchLessons")}
              className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-lg ps-9 pe-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title={t("clear")}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* AI Practice Quiz Launcher Button */}
          {onOpenAiQuiz && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenAiQuiz}
                className="w-full group/quiz p-2.5 rounded-xl bg-gradient-to-r from-slate-50 via-teal-50/50 to-white hover:from-slate-100/70 hover:to-slate-50/60 border border-slate-200/90 hover:border-slate-300 transition-all flex items-center justify-between gap-2.5 shadow-2xs cursor-pointer text-start"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-dark)] text-white flex items-center justify-center shrink-0 shadow-xs group-hover/quiz:scale-105 transition-transform">
                    <Sparkles size={14} className="animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 group-hover/quiz:text-brand-dark truncate">
                        {isAr ? "اختبار الذكاء الاصطناعي" : "AI Practice Quiz"}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-[var(--color-primary-main)] text-[9px] font-black uppercase">
                        AI
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      {isAr ? "اختبر فهمك عبر أسئلة مخصصة" : "Test your knowledge from lessons"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-slate-400 group-hover/quiz:text-[var(--color-primary-main)] transition-colors">
                  {isAr ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Connected Vertical Timeline Curriculum */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
          {filteredSections.length === 0 ? (
            <div className="py-12 text-center px-4 space-y-2">
              <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search size={18} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                {t("noLessonsFound")}
              </p>
            </div>
          ) : (
            filteredSections.map((section, sIdx) => {
              const secId = String(section.id || `sec-${sIdx}`);
              const isOpenSection = openSections[secId] ?? true;
              const secTitle = isAr
                ? section.title_ar || section.title || t("sectionDefault", { index: sIdx + 1 })
                : section.title_en || section.title || t("sectionDefault", { index: sIdx + 1 });
              const secLessons = section.lessons || [];
              const secCompleted = secLessons.filter((l) =>
                completedLessonIds.includes(String(l.id))
              ).length;

              return (
                <div key={secId} className="bg-white">
                  {/* Section Header Accordion */}
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections((prev) => ({
                        ...prev,
                        [secId]: !prev[secId],
                      }))
                    }
                    className="w-full px-4 py-3 flex items-center justify-between text-start bg-slate-50/60 hover:bg-slate-100/70 transition-all cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                      <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600 flex items-center justify-center shrink-0">
                        {String(sIdx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {secTitle}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5 font-mono">
                          {secCompleted}/{secLessons.length} {t("completed")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpenSection ? "rotate-0" : "rotate-180 rtl:-rotate-180"
                      }`}
                    >
                      <ChevronUp size={14} />
                    </div>
                  </button>

                  {/* Connected Vertical Timeline for Lessons */}
                  {isOpenSection && (
                    <div className="relative px-3 py-3">
                      {/* Continuous Vertical Timeline Line Centered with Circle Markers */}
                      {secLessons.length > 1 && (
                        <div className="absolute top-8 bottom-8 left-[31px] rtl:left-auto rtl:right-[31px] w-0.5 bg-slate-200 z-0" />
                      )}

                      <div className="space-y-1 relative z-10">
                        {secLessons.map((lesson, lIdx) => {
                          const globalIndex = allLessons.findIndex((l) => String(l.id) === String(lesson.id));
                          const isActive = globalIndex === activeLessonIndex;
                          const isDone = completedLessonIds.includes(String(lesson.id));
                          const isLocked = !!lesson.is_locked;
                          const lesTitle = isAr
                            ? lesson.title_ar || lesson.title || t("lessonDefault", { index: lIdx + 1 })
                            : lesson.title_en || lesson.title || t("lessonDefault", { index: lIdx + 1 });

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (!isLocked) {
                                  onSelectLesson(globalIndex);
                                  setIsPlaying(true);
                                }
                              }}
                              className={`relative flex items-center gap-3 py-2 px-2 rounded-lg transition-colors ${
                                isLocked
                                  ? "opacity-60 cursor-not-allowed"
                                  : "cursor-pointer group hover:bg-slate-50"
                              } ${isActive ? "bg-slate-50/90" : ""}`}
                            >
                              {/* Numbered Circular Marker on the Timeline */}
                              <div
                                className={`w-6 h-6 rounded-full shrink-0 relative z-10 flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                                  isDone
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : isActive
                                    ? "bg-brand-dark text-white ring-4 ring-brand-dark/20 shadow-xs"
                                    : isLocked
                                    ? "bg-slate-100 border border-slate-200 text-slate-400"
                                    : "bg-white border border-slate-300 text-slate-600 group-hover:border-slate-500"
                                }`}
                              >
                                {isDone ? (
                                  <Check size={11} strokeWidth={3} />
                                ) : isLocked ? (
                                  <Lock size={10} />
                                ) : (
                                  <span>{globalIndex + 1}</span>
                                )}
                              </div>

                              {/* Lesson Title and Meta */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`text-xs truncate block leading-tight ${
                                      isActive
                                        ? "font-bold text-slate-950"
                                        : isDone
                                        ? "text-slate-500 font-medium"
                                        : isLocked
                                        ? "text-slate-400 font-medium"
                                        : "text-slate-700 font-medium group-hover:text-slate-950"
                                    }`}
                                  >
                                    {lesTitle}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                                  <span>{lesson.duration || `${lesson.duration_minutes || 5}:00`}</span>
                                  {lesson.is_preview && (
                                    <span className="text-[var(--color-primary-main)] font-bold">· {t("free")}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
