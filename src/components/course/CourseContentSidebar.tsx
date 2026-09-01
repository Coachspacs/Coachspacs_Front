"use client";

import React from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
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
  t: (key: string) => string;
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
  className = "",
}: CourseContentSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside
      className={`w-full lg:w-88 xl:w-96 shrink-0 bg-white border border-slate-200/90 rounded-3xl shadow-xs flex flex-col overflow-hidden self-start lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] transition-all z-20 ${className}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
            <BookOpen size={16} className="text-[#0F5244]" />
            <span>{t("courseContent")}</span>
          </h3>
          <span className="text-[11px] font-extrabold text-[#0F5244] bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
            {completedCount}/{totalLessons} {isAr ? "مكتمل" : "done"}
          </span>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchLessons")}
            className="w-full bg-white border border-slate-200 rounded-xl pl-8.5 rtl:pr-8.5 pr-3 rtl:pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Sections & Lessons List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 divide-y divide-slate-100">
        {filteredSections.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {isAr ? "لا توجد نتائج مطابقة لبحثك." : "No lessons match your search."}
          </div>
        ) : (
          filteredSections.map((section: any, sIdx: number) => {
            const secId = section.id || `sec-${sIdx}`;
            const isOpenSection = openSections[secId] ?? true;
            const secTitle = isAr
              ? section.title_ar || section.title || `القسم ${sIdx + 1}`
              : section.title_en || section.title || `Section ${sIdx + 1}`;
            const secLessons = section.lessons || [];
            const secCompleted = secLessons.filter((l: any) =>
              completedLessonIds.includes(String(l.id))
            ).length;

            return (
              <div key={secId} className="pt-3 first:pt-0">
                {/* Section Header Accordion */}
                <button
                  type="button"
                  onClick={() => onToggleSection(secId)}
                  className="w-full p-2.5 flex items-center justify-between text-left rtl:text-right hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-2 rtl:pl-2">
                    <h4 className="text-xs font-black text-slate-900 truncate">{secTitle}</h4>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      {secCompleted}/{secLessons.length} {isAr ? "دروس مكتملة" : "completed"}
                    </span>
                  </div>
                  {isOpenSection ? (
                    <ChevronUp size={15} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Section Lessons */}
                {isOpenSection && (
                  <div className="mt-1 space-y-1">
                    {secLessons.map((lesson: any) => {
                      const globalIndex = allLessons.findIndex((l) => l.id === lesson.id);
                      const isActive = globalIndex === activeLessonIndex;
                      const isDone = completedLessonIds.includes(String(lesson.id));
                      const lesTitle = isAr
                        ? lesson.title_ar || lesson.title
                        : lesson.title_en || lesson.title;

                      return (
                        <div
                          key={lesson.id}
                          className={`p-2.5 rounded-xl flex items-center justify-between gap-2.5 text-xs transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-white text-[#0F5244] font-extrabold border-s-4 border-[#0F5244] shadow-2xs"
                              : "text-slate-700 hover:bg-slate-50 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Checkbox / Completion Icon */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleLessonCompletion(lesson.id);
                              }}
                              className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                isDone
                                  ? "bg-emerald-600 text-white shadow-2xs"
                                  : "border-2 border-slate-300 hover:border-emerald-500 bg-white"
                              }`}
                              title={isDone ? t("completed") : t("markCompleted")}
                            >
                              {isDone && <Check size={11} strokeWidth={3} />}
                            </button>

                            {/* Lesson Title button */}
                            <button
                              type="button"
                              onClick={() => onSelectLesson(globalIndex)}
                              className="text-left rtl:text-right min-w-0 flex-1 truncate cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping shrink-0" />
                                )}
                                <span className="truncate block leading-tight">{lesTitle}</span>
                              </div>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {lesson.is_preview && (
                              <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.2 rounded">
                                {isAr ? "معاينة" : "Free"}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              {lesson.duration || `${lesson.duration_minutes || 5}:00`}
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
