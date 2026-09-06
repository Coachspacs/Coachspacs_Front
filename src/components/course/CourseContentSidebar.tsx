"use client";

import React from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
  Clock,
  X,
  Sparkles,
  Lock,
} from "lucide-react";

interface CourseContentSidebarProps {
  isOpen: boolean;
  completedCount: number;
  totalLessons: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredSections: any[];
  openSections: Record<string, boolean>;
  onToggleSection: (sectionId: string) => void;
  allLessons: any[];
  activeLessonIndex: number;
  onSelectLesson: (index: number) => void;
  completedLessonIds: string[];
  onToggleLessonCompletion: (lessonId: string | number) => void;
  isAr: boolean;
  t: (key: string, values?: Record<string, any>) => string;
  onClose?: () => void;
  className?: string;
}

export function CourseContentSidebar({
  isOpen,
  completedCount,
  totalLessons,
  searchQuery,
  onSearchChange,
  filteredSections,
  openSections,
  onToggleSection,
  allLessons,
  activeLessonIndex,
  onSelectLesson,
  completedLessonIds,
  onToggleLessonCompletion,
  isAr,
  t,
  onClose,
  className = "",
}: CourseContentSidebarProps) {
  if (!isOpen) return null;

  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <aside className={`w-full h-full bg-white flex flex-col overflow-hidden select-none font-sans ${className}`}>
      {/* 1. Studio Header: Circular Ring / Progress & Live Stats */}
      <div className="p-5 border-b border-slate-100/90 bg-gradient-to-b from-slate-50/70 to-white space-y-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#0F5244] shadow-xs shrink-0">
              <BookOpen size={17} className="text-[#0F5244]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                <span>{t("courseContent")}</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold truncate">
                {t("lessonsCompletedShort", { count: completedCount, total: totalLessons })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Progress Percentage Badge */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl shrink-0">
              <Sparkles size={12} className="text-emerald-600 shrink-0" />
              <span className="font-mono text-xs font-black text-[#0F5244]">
                {progressPercent}%
              </span>
            </div>

            {/* Collapse Sidebar Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title={t("collapseSidebarTooltip")}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Studio Progress Bar with Glowing Head */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-600 via-[#0F5244] to-[#45D1B4] h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>{t("courseProgress")}</span>
            <span className="font-mono text-slate-600 font-bold">{completedCount}/{totalLessons}</span>
          </div>
        </div>

        {/* Enhanced Search Input */}
        <div className="relative pt-0.5">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pr-3.5 pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchLessons")}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 rounded-2xl pl-10 rtl:pr-10 pr-8 rtl:pl-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pl-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Curriculum Sections */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/90 custom-scrollbar">
        {filteredSections.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
              <Search size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">
                {t("noLessonsFound")}
              </p>
              <p className="text-[11px] text-slate-400">
                {t("noMatchingLessonsDesc")}
              </p>
            </div>
          </div>
        ) : (
          filteredSections.map((section: any, sIdx: number) => {
            const secId = section.id || `sec-${sIdx}`;
            const isOpenSection = openSections[secId] ?? true;
            const secTitle = isAr
              ? section.title_ar || section.title || t("sectionDefault", { index: sIdx + 1 })
              : section.title_en || section.title || t("sectionDefault", { index: sIdx + 1 });
            const secLessons = section.lessons || [];
            const secCompleted = secLessons.filter((l: any) =>
              completedLessonIds.includes(String(l.id))
            ).length;

            return (
              <div key={secId} className="bg-white">
                {/* Section Header Accordion */}
                <button
                  type="button"
                  onClick={() => onToggleSection(secId)}
                  className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-start bg-slate-50/70 hover:bg-slate-100/80 transition-all cursor-pointer border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 text-[10px] font-mono font-black text-slate-600 flex items-center justify-center shrink-0 shadow-2xs">
                      {String(sIdx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 truncate">
                        {secTitle}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5 font-mono">
                        {secCompleted}/{secLessons.length} {t("completed")}
                      </span>
                    </div>
                  </div>
                  <div className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpenSection ? "rotate-0" : "rotate-180 rtl:-rotate-180"}`}>
                    <ChevronUp size={15} />
                  </div>
                </button>

                {/* Section Lessons List */}
                {isOpenSection && (
                  <div className="divide-y divide-slate-50">
                    {secLessons.map((lesson: any, lIdx: number) => {
                      const globalIndex = allLessons.findIndex((l) => l.id === lesson.id);
                      const isActive = globalIndex === activeLessonIndex;
                      const isDone = completedLessonIds.includes(String(lesson.id));
                      const lesTitle = isAr
                        ? lesson.title_ar || lesson.title || t("lessonDefault", { index: lIdx + 1 })
                        : lesson.title_en || lesson.title || t("lessonDefault", { index: lIdx + 1 });

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(globalIndex)}
                          className={`px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-xs transition-all cursor-pointer group ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-white text-[#0F5244] font-bold border-s-4 border-[#0F5244] shadow-xs"
                              : "text-slate-700 hover:bg-slate-50/90 border-s-4 border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Checkbox / Completion Icon */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleLessonCompletion(lesson.id);
                              }}
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                isDone
                                  ? "bg-[#0F5244] text-white shadow-2xs scale-100 hover:bg-emerald-700"
                                  : "border-2 border-slate-300 hover:border-emerald-600 bg-white"
                              }`}
                              title={isDone ? t("completed") : t("markCompleted")}
                            >
                              {isDone && <Check size={11} strokeWidth={3} />}
                            </button>

                            {/* Lesson Title & Live Playing Wave */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 truncate">
                                {isActive && (
                                  <span className="flex items-center gap-0.5 shrink-0" title={t("playing")}>
                                    <span className="w-1 h-3 bg-emerald-600 rounded-full animate-pulse" />
                                    <span className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse delay-75" />
                                    <span className="w-1 h-2 bg-emerald-700 rounded-full animate-pulse delay-150" />
                                  </span>
                                )}
                                <span
                                  className={`truncate block leading-tight ${
                                    isActive
                                      ? "font-black text-[#0F5244]"
                                      : isDone
                                      ? "text-slate-500 font-medium"
                                      : "text-slate-700 font-semibold group-hover:text-slate-900"
                                  }`}
                                >
                                  {lesTitle}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {lesson.is_preview && (
                              <span className="text-[9px] font-black text-[#0F5244] bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
                                {t("free")}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 font-medium flex items-center gap-1">
                              <Clock size={10} className="text-slate-300" />
                              <span>{lesson.duration || `${lesson.duration_minutes || 5}:00`}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

