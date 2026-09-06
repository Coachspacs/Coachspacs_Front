"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Layers,
  Clock,
  Edit2,
  Archive,
  Sparkles,
  AlertTriangle,
  X,
  Filter,
  Check,
} from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { RowCardSkeleton } from "@/components/ui/Skeleton";

type CourseLifecycleFilter =
  | "all"
  | "active"
  | "published"
  | "pending_review"
  | "draft"
  | "archived";

interface InstructorCoursesTabProps {
  courses: any[];
  isLoadingCourses: boolean;
  courseFilter: CourseLifecycleFilter;
  setCourseFilter: (filter: CourseLifecycleFilter) => void;
  courseSearch: string;
  setCourseSearch: (search: string) => void;
  students: any[];
  expandedCourseStudentsId: string | null;
  setExpandedCourseStudentsId: (id: string | null) => void;
  handleSubmitForReview: (courseId: string) => void;
  submittingCourseId: string | number | null;
  handleArchiveCourse: (course: any) => void;
  setDeleteModalCourse: (course: any) => void;
}

export function InstructorCoursesTab({
  courses,
  isLoadingCourses,
  courseFilter,
  setCourseFilter,
  courseSearch,
  setCourseSearch,
  students,
  expandedCourseStudentsId,
  setExpandedCourseStudentsId,
  handleSubmitForReview,
  submittingCourseId,
  handleArchiveCourse,
  setDeleteModalCourse,
}: InstructorCoursesTabProps) {
  const tInst = useTranslations("instructorSettings");
  const tDash = useTranslations("instructorDashboard");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  // Filter count statistics
  const totalCount = courses.length;
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const pendingCount = courses.filter((c) => c.status === "pending_review").length;
  const draftCount = courses.filter((c) => c.status === "draft" || c.status === "rejected").length;
  const archivedCount = courses.filter((c) => c.status === "archived").length;

  const filterTabs: {
    id: CourseLifecycleFilter;
    label: string;
    count: number;
    dotColor: string;
  }[] = [
    {
      id: "all",
      label: tInst("allCoursesFilter") || (isAr ? "جميع الدورات" : "All Courses"),
      count: totalCount,
      dotColor: "bg-slate-400",
    },
    {
      id: "published",
      label: tInst("statusPublished") || (isAr ? "منشورة ومعتمدة" : "Published"),
      count: publishedCount,
      dotColor: "bg-emerald-500",
    },
    {
      id: "pending_review",
      label: tInst("statusPendingReview") || (isAr ? "قيد المراجعة" : "In Review"),
      count: pendingCount,
      dotColor: "bg-amber-500",
    },
    {
      id: "draft",
      label: tInst("statusDraft") || (isAr ? "مسودات" : "Drafts"),
      count: draftCount,
      dotColor: "bg-slate-400",
    },
    {
      id: "archived",
      label: tInst("statusArchived") || (isAr ? "المؤرشفة" : "Archived"),
      count: archivedCount,
      dotColor: "bg-rose-400",
    },
  ];

  // Filter courses by search and status
  const filteredCourses = courses.filter((c) => {
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      const title = (c.titleEn || c.titleAr || c.title || "").toLowerCase();
      if (!title.includes(q)) return false;
    }

    if (courseFilter === "active") return c.status !== "archived";
    if (courseFilter === "published") return c.status === "published";
    if (courseFilter === "pending_review") return c.status === "pending_review";
    if (courseFilter === "draft") return c.status === "draft" || c.status === "rejected";
    if (courseFilter === "archived") return c.status === "archived";
    return true; // "all"
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Sleek Header (Clean, unboxed & modern) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {tInst("courseLifecycleManagement")}
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#0F5244] border border-emerald-100 text-[11px] font-bold">
              {totalCount} {isAr ? "دورات" : "courses"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {tInst("lifecycleManagementSubtitle")}
          </p>
        </div>

        <Link
          href={`/${locale}/instructor/courses/new`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md active:scale-98 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{tDash("createNewCourse")}</span>
        </Link>
      </div>

      {/* 2. Unified Search Bar + Status Filter Bar (نظام سيرش بار وفلاتر مدمجة) */}
      <div className="space-y-3">
        {/* Modern Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute top-1/2 -translate-y-1/2 rtl:right-4 ltr:left-4 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder={
              isAr
                ? "ابحث في دوراتك التدريبية بالاسم أو الكلمات المفتاحية..."
                : "Search your courses by title or keyword..."
            }
            className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/70 rtl:pr-11 rtl:pl-10 ltr:pl-11 ltr:pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all shadow-2xs"
          />
          {courseSearch && (
            <button
              type="button"
              onClick={() => setCourseSearch("")}
              className="absolute top-1/2 -translate-y-1/2 rtl:left-3.5 ltr:right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Minimalist Interactive Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = courseFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCourseFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#0F5244] text-white shadow-2xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 font-semibold"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-[#45D1B4]" : tab.dotColor
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-500 border border-slate-200/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* 3. Course Cards List or Clean Empty State */}
      <div className="space-y-4 pt-1">
        {isLoadingCourses ? (
          <div className="space-y-4">
            <RowCardSkeleton count={3} />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-slate-400 mx-auto flex items-center justify-center">
              <Archive className="w-7 h-7 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                {courseFilter === "archived"
                  ? tInst("noArchivedCourses")
                  : courseSearch.trim()
                    ? isAr
                      ? "لم يتم العثور على دورات مطابقة للبحث"
                      : "No courses match your search"
                    : tInst("noCoursesInTab")}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {courseFilter === "archived"
                  ? tInst("noArchivedCoursesNotice")
                  : courseSearch.trim()
                    ? isAr
                      ? "جرب البحث بكلمات أخرى أو قم بإلغاء الفلتر."
                      : "Try searching with different terms or reset your filter."
                    : tInst("noCoursesInTabDesc")}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {courseSearch.trim() || courseFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setCourseFilter("all");
                    setCourseSearch("");
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                >
                  {isAr ? "عرض جميع الدورات" : "View All Courses"}
                </button>
              ) : (
                <Link
                  href={`/${locale}/instructor/courses/new`}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{tDash("createNewCourse")}</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          filteredCourses.map((c) => {
            const courseStudents = students.filter((s) => s.courseId === c.id);
            const isExpanded = expandedCourseStudentsId === c.id;

            return (
              <CourseCard
                key={c.id}
                course={c}
                variant="instructor-row"
                isAr={isAr}
                isExpandedStudents={isExpanded}
                onToggleExpandStudents={() =>
                  setExpandedCourseStudentsId(isExpanded ? null : String(c.id))
                }
                onSubmitReview={(id) => handleSubmitForReview(String(id))}
                isSubmittingReview={submittingCourseId === c.id}
                onOpenArchiveModal={handleArchiveCourse}
                onOpenDeleteModal={setDeleteModalCourse}
              >
                {/* Rejection Alert Box */}
                {c.status === "rejected" && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/95 via-rose-50/60 to-white border-s-4 border-rose-500 border border-rose-200/80 text-xs text-rose-900 shadow-2xs space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-rose-950 text-xs sm:text-sm">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>
                          {tInst("rejectionReasonLabel") ||
                            (isAr ? "سبب الرفض:" : "Rejection Reason:")}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-full">
                        {isAr ? "إشعار من الإدارة" : "Admin Notice"}
                      </span>
                    </div>
                    <p className="font-extrabold text-rose-900 text-xs sm:text-sm leading-relaxed pr-6 rtl:pr-0 rtl:pl-6">
                      {c.rejectionReason ||
                        (isAr
                          ? "الكورس غير مناسب"
                          : "Course content is not suitable")}
                    </p>
                  </div>
                )}

                {/* Expanded Enrolled Students Drawer */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0F5244]" />
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          {isAr
                            ? `الطلاب المسجلون في هذه الدورة (${courseStudents.length})`
                            : `Enrolled Students in this Course (${courseStudents.length})`}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        {isAr ? "محدث تلقائياً" : "Auto-synced"}
                      </span>
                    </div>

                    {courseStudents.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        {isAr
                          ? "لم يسجل أي طالب في هذه الدورة بعد"
                          : "No students enrolled in this course yet"}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {courseStudents.map((st) => (
                          <div
                            key={st.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 shadow-2xs hover:bg-white hover:border-[#0F5244]/30 transition-all"
                          >
                            <div className="w-9 h-9 rounded-full bg-[#0F5244]/10 text-[#0F5244] font-black text-xs flex items-center justify-center shrink-0 border border-[#0F5244]/20">
                              {st.avatar ? (
                                <img
                                  src={st.avatar}
                                  alt={st.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                st.name.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {st.name}
                                </p>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    st.status === "completed"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {st.status === "completed"
                                    ? isAr
                                      ? "مكتمل"
                                      : "Completed"
                                    : `${st.progress}%`}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                {st.email}
                              </p>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-[#0F5244] rounded-full"
                                  style={{ width: `${st.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CourseCard>
            );
          })
        )}
      </div>
    </div>
  );
}

export default InstructorCoursesTab;
