"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  AlertTriangle,
  X,
  Filter,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { RowCardSkeleton } from "@/components/ui/Skeleton";

export type CourseLifecycleFilter =
  | "all"
  | "active"
  | "published"
  | "pending_review"
  | "draft"
  | "archived";

export type CourseSortOption =
  | "newest"
  | "students"
  | "price_high"
  | "price_low";

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
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  // Category & Sort State (Pure UI/UX enhancements without touching backend)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<CourseSortOption>("newest");

  // 100% Real Derived Statistics from courses array
  const totalCount = courses.length;
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const pendingCount = courses.filter((c) => c.status === "pending_review").length;
  const draftCount = courses.filter(
    (c) => c.status === "draft" || c.status === "rejected"
  ).length;
  const archivedCount = courses.filter((c) => c.status === "archived").length;

  // Dynamic distinct categories from actual courses
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach((c) => {
      const cat = isAr
        ? c.categoryAr || c.category_ar || c.category
        : c.category || c.categoryAr;
      if (cat && typeof cat === "string" && cat.trim().length > 0) {
        cats.add(cat.trim());
      }
    });
    return Array.from(cats);
  }, [courses, isAr]);

  // Filter & Sort courses
  const filteredAndSortedCourses = useMemo(() => {
    return courses
      .filter((c) => {
        // Search query
        if (courseSearch.trim()) {
          const q = courseSearch.toLowerCase();
          const title = (
            c.titleEn ||
            c.titleAr ||
            c.title ||
            ""
          ).toLowerCase();
          if (!title.includes(q)) return false;
        }

        // Status filter
        if (courseFilter === "active") return c.status !== "archived";
        if (courseFilter === "published") return c.status === "published";
        if (courseFilter === "pending_review") return c.status === "pending_review";
        if (courseFilter === "draft")
          return c.status === "draft" || c.status === "rejected";
        if (courseFilter === "archived") return c.status === "archived";

        // Category filter
        if (selectedCategory !== "all") {
          const cat = isAr
            ? c.categoryAr || c.category_ar || c.category
            : c.category || c.categoryAr;
          if (cat !== selectedCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_high") {
          return Number(b.price || 0) - Number(a.price || 0);
        }
        if (sortBy === "price_low") {
          return Number(a.price || 0) - Number(b.price || 0);
        }
        if (sortBy === "students") {
          const aStudents = Number(a.studentsCount || a.students_count || 0);
          const bStudents = Number(b.studentsCount || b.students_count || 0);
          return bStudents - aStudents;
        }
        // Default: newest
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        if (dateA && dateB) return dateB - dateA;
        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [courses, courseSearch, courseFilter, selectedCategory, sortBy, isAr]);

  const hasActiveFilters =
    courseFilter !== "all" ||
    selectedCategory !== "all" ||
    courseSearch.trim() !== "";

  const handleResetFilters = () => {
    setCourseFilter("all");
    setSelectedCategory("all");
    setCourseSearch("");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 4. PAGE HEADER: Title, Subtitle, and Primary CTA (+ إنشاء دورة جديدة)       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1 text-start">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isAr ? "إدارة الدورات" : "Course Management"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isAr
              ? "أنشئ وأدر دوراتك التدريبية وتابع أداءها من مكان واحد"
              : "Create, manage, and track your educational courses all in one place"}
          </p>
        </div>

        <Link
          href={`/${locale}/instructor/courses/new`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4F3A] hover:bg-[#08382E] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md active:scale-98 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{isAr ? "إنشاء دورة جديدة" : "Create New Course"}</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH + FILTERS TOOLBAR: [ البحث... ] [الحالة] [التصنيف] [الترتيب]          */}
      {/* ========================================================================= */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder={
              isAr
                ? "البحث عن دورة بالاسم أو الكلمات المفتاحية..."
                : "Search courses by title or keywords..."
            }
            className="w-full h-10 rounded-xl border border-slate-200/90 bg-slate-50/60 rtl:pr-10 rtl:pl-9 ltr:pl-10 ltr:pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0B4F3A] focus:ring-2 focus:ring-[#0B4F3A]/10 focus:outline-none transition-all shadow-2xs"
          />
          {courseSearch && (
            <button
              type="button"
              onClick={() => setCourseSearch("")}
              className="absolute top-1/2 -translate-y-1/2 rtl:left-2.5 ltr:right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* 1. Status Filter Dropdown */}
          <div className="relative shrink-0">
            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value as CourseLifecycleFilter)
              }
              aria-label={isAr ? "تصفية بالحالة" : "Filter by status"}
              className="h-10 px-3 rtl:pl-8 ltr:pr-8 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:border-[#0B4F3A] focus:outline-none transition-all cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">
                {isAr ? `الحالة: الكل (${totalCount})` : `Status: All (${totalCount})`}
              </option>
              <option value="published">
                {isAr
                  ? `منشور (${publishedCount})`
                  : `Published (${publishedCount})`}
              </option>
              <option value="pending_review">
                {isAr
                  ? `قيد المراجعة (${pendingCount})`
                  : `Under Review (${pendingCount})`}
              </option>
              <option value="draft">
                {isAr ? `مسودة (${draftCount})` : `Draft (${draftCount})`}
              </option>
              <option value="archived">
                {isAr
                  ? `مؤرشف (${archivedCount})`
                  : `Archived (${archivedCount})`}
              </option>
            </select>
            <ChevronDown className="absolute top-1/2 -translate-y-1/2 rtl:left-2.5 ltr:right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* 2. Category Filter Dropdown */}
          {availableCategories.length > 0 && (
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label={isAr ? "تصفية بالتصنيف" : "Filter by category"}
                className="h-10 px-3 rtl:pl-8 ltr:pr-8 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:border-[#0B4F3A] focus:outline-none transition-all cursor-pointer appearance-none shadow-2xs max-w-[150px] truncate"
              >
                <option value="all">
                  {isAr ? "التصنيف: الكل" : "Category: All"}
                </option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 -translate-y-1/2 rtl:left-2.5 ltr:right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* 3. Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CourseSortOption)}
              aria-label={isAr ? "ترتيب الدورات" : "Sort courses"}
              className="h-10 px-3 rtl:pl-8 ltr:pr-8 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-100/70 focus:bg-white focus:border-[#0B4F3A] focus:outline-none transition-all cursor-pointer appearance-none shadow-2xs"
            >
              <option value="newest">
                {isAr ? "ترتيب: الأحدث" : "Sort: Newest"}
              </option>
              <option value="students">
                {isAr ? "الأكثر طلاباً" : "Most Students"}
              </option>
              <option value="price_high">
                {isAr ? "الأعلى سعراً" : "Highest Price"}
              </option>
              <option value="price_low">
                {isAr ? "الأقل سعراً" : "Lowest Price"}
              </option>
            </select>
            <ChevronDown className="absolute top-1/2 -translate-y-1/2 rtl:left-2.5 ltr:right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. COURSE LIST: Redesigned Cards, Empty State, and Skeletons               */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-1">
        {isLoadingCourses ? (
          <div className="space-y-4">
            <RowCardSkeleton count={3} />
          </div>
        ) : filteredAndSortedCourses.length === 0 ? (
          /* 9. Professional Empty States */
          <div className="text-center py-16 px-4 space-y-4 rounded-2xl bg-white border border-dashed border-slate-200 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs text-slate-400 mx-auto flex items-center justify-center">
              {hasActiveFilters ? (
                <Search className="w-7 h-7 text-slate-400" />
              ) : (
                <BookOpen className="w-7 h-7 text-slate-400" />
              )}
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-black text-slate-900">
                {hasActiveFilters
                  ? isAr
                    ? "لم يتم العثور على دورات مطابقة"
                    : "No courses match your search or filter"
                  : isAr
                  ? "لا توجد دورات حتى الآن"
                  : "No courses yet"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                {hasActiveFilters
                  ? isAr
                    ? "جرب البحث بكلمات مختلفة أو قم بإعادة ضبط خيارات التصفية."
                    : "Try searching with different terms or reset your filters."
                  : isAr
                  ? "أنشئ دورتك التدريبية الأولى وشارك خبرتك ومعرفتك مع آلاف الطلاب."
                  : "Create your first course and share your expertise with thousands of students."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
                >
                  {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                </button>
              ) : (
                <Link
                  href={`/${locale}/instructor/courses/new`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0B4F3A] hover:bg-[#08382E] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>{isAr ? "إنشاء دورة جديدة" : "Create New Course"}</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          filteredAndSortedCourses.map((c) => {
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
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50/95 via-rose-50/60 to-white border-s-4 border-rose-500 border border-rose-200/80 text-xs text-rose-900 shadow-2xs space-y-1.5 animate-in fade-in duration-200">
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
                    <p className="font-bold text-rose-900 text-xs sm:text-sm leading-relaxed pr-6 rtl:pr-0 rtl:pl-6">
                      {c.rejectionReason ||
                        (isAr
                          ? "الكورس غير مناسب أو يحتاج لمزيد من التعديلات"
                          : "Course content needs further improvements")}
                    </p>
                  </div>
                )}

                {/* Expanded Enrolled Students Drawer */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0B4F3A]" />
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
                      <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        {isAr
                          ? "لم يسجل أي طالب في هذه الدورة بعد"
                          : "No students enrolled in this course yet"}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {courseStudents.map((st) => (
                          <div
                            key={st.id}
                            className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 flex items-center gap-3 shadow-2xs hover:bg-white hover:border-[#0B4F3A]/30 transition-all"
                          >
                            <div className="w-9 h-9 rounded-full bg-[#0B4F3A]/10 text-[#0B4F3A] font-black text-xs flex items-center justify-center shrink-0 border border-[#0B4F3A]/20">
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
                                  className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
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
                                  className="h-full bg-[#0B4F3A] rounded-full"
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
