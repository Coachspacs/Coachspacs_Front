"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { BookOpen, Search, Filter } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { StudentCourseCardSkeleton } from "@/components/ui/Skeleton";

interface StudentCoursesTabProps {
  courses: any[];
  isLoading?: boolean;
  initialFilter?: "all" | "in_progress" | "completed";
}

export function StudentCoursesTab({
  courses,
  isLoading = false,
  initialFilter = "all",
}: StudentCoursesTabProps) {
  const tWs = useTranslations("studentWorkspace");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [courseFilter, setCourseFilter] = useState<
    "all" | "in_progress" | "completed"
  >(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialFilter) {
      setCourseFilter(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const f = params.get("filter");
      if (f === "in_progress" || f === "completed" || f === "all") {
        setCourseFilter(f);
      }
    }
  }, []);

  const filteredCourses = courses.filter((course) => {
    // Status filter
    if (courseFilter === "in_progress" && course.isCompleted) return false;
    if (courseFilter === "completed" && !course.isCompleted) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = String(course.title || "").toLowerCase();
      const instructor = String(course.instructor || "").toLowerCase();
      return title.includes(q) || instructor.includes(q);
    }
    return true;
  });

  const inProgressCount = courses.filter((c) => !c.isCompleted).length;
  const completedCount = courses.filter((c) => c.isCompleted).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="space-y-4">
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {tWs("enrolledCourses")}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200/80 text-xs font-black shadow-2xs">
                {courses.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isAr
                ? "متابعة تقدمك التعليمي واستكمال الدروس المتبقية في دوراتك"
                : "Track your progress and continue learning your enrolled courses"}
            </p>
          </div>
        </div>

        {/* Controls Bar: Search & Filter Segmented Control */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث في دوراتك..." : "Search courses..."}
              className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/60 rtl:pr-10 ltr:pl-10 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Filter Segmented Control */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/60 overflow-x-auto max-w-full scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setCourseFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                courseFilter === "all"
                  ? "bg-white text-[#0F5244] shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{isAr ? "الكل" : "All"}</span>
              <span className="ms-1.5 text-[10px] opacity-75 font-semibold">
                ({courses.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCourseFilter("in_progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                courseFilter === "in_progress"
                  ? "bg-white text-[#0F5244] shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{isAr ? "قيد التقدم" : "In Progress"}</span>
              <span className="ms-1.5 text-[10px] opacity-75 font-semibold">
                ({inProgressCount})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCourseFilter("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                courseFilter === "completed"
                  ? "bg-white text-[#0F5244] shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{isAr ? "مكتملة" : "Completed"}</span>
              <span className="ms-1.5 text-[10px] opacity-75 font-semibold">
                ({completedCount})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <StudentCourseCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center border border-slate-200/80 rounded-3xl p-8 space-y-4 bg-white shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-base font-extrabold text-slate-800">
                {searchQuery.trim()
                  ? isAr
                    ? "لا توجد نتائج تطابق بحثك"
                    : "No courses match your query"
                  : courseFilter !== "all"
                  ? isAr
                    ? "لا توجد دورات في هذا التصنيف"
                    : "No courses in this category"
                  : tWs("noCoursesEnrolled")}
              </h3>
              <p className="text-xs text-slate-400">
                {courses.length === 0
                  ? isAr
                    ? "استكشف الكتالوج وسجل في دورتك التدريبية الأولى لتظهر هنا"
                    : "Browse our catalog and enroll in your first course to see it here"
                  : isAr
                  ? "جرب البحث بكلمات أخرى أو اختر تبويباً مختلفاً"
                  : "Try different search terms or select another tab"}
              </p>
            </div>
            {courses.length === 0 && (
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs font-black shadow-xs transition-all cursor-pointer mt-2"
              >
                <span>{tWs("exploreCourses")}</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.enrollmentId || course.id}
                course={course}
                variant="student"
                isAr={isAr}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
