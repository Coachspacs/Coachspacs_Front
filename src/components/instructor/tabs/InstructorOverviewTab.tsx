"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  Users,
  CreditCard,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { InstructorDashboardResponse } from "@/types/certificate";

interface InstructorOverviewTabProps {
  courses: any[];
  dashboardData?: InstructorDashboardResponse | null;
}

export function InstructorOverviewTab({
  courses,
  dashboardData,
}: InstructorOverviewTabProps) {
  const tInst = useTranslations("instructorSettings");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  // US-17: Distinct students count from API or fallback
  const totalStudents =
    dashboardData?.total_students ??
    courses.reduce((acc, curr) => acc + Number(curr.studentsCount || 0), 0);

  // US-17: Total courses created (including drafts and archived)
  const totalCourses = dashboardData?.total_courses ?? courses.length;

  const totalRevenue = courses.reduce(
    (acc, curr) => acc + Number(curr.revenue || 0),
    0
  );

  const ratedCourses = courses.filter((c) => Number(c.reviewsCount || 0) > 0);
  const avgRating =
    ratedCourses.length > 0
      ? (
          ratedCourses.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) /
          ratedCourses.length
        ).toFixed(1)
      : "—";

  const coursesDistribution = dashboardData?.courses || [];

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {tInst("instructorOverviewTitle")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {isAr
            ? "نظرة عامة على نشاطك التعليمي، مقاييس الطلاب الفعليين وأداء دوراتك التدريبية"
            : "Overview of your teaching activities, distinct learner metrics, and course performance"}
        </p>
      </div>

      {/* Modern Minimal Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
        {/* Card 1: Distinct Students */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-500/30 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500">
              {tInst("enrolledStudentsNav")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F5244] ring-1 ring-emerald-100 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalStudents.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 2: Total Courses */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-500/30 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500">
              {tInst("totalCoursesMetric")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalCourses.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 3: Payout & Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-500/30 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500">
              {tInst("payoutAndBilling")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 4: Rating */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-500/30 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500">
              {tInst("ratingLabel")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 flex items-center justify-center shrink-0">
              <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {avgRating}
            </div>
            {avgRating !== "—" && (
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Enrollment Breakdown Section */}
      {coursesDistribution.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0F5244]" />
                <span>{isAr ? "توزيع التسجيلات لكل دورة" : "Course Enrollment Distribution"}</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {isAr
                  ? "مقارنة أعداد الطلاب المسجلين وحالة كل دورة تدريبية"
                  : "Comparison of enrolled learners and status per course"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs">
              {coursesDistribution.length} {isAr ? "دورة" : "courses"}
            </span>
          </div>

          {/* Course Rows */}
          <div className="divide-y divide-slate-100/90 p-2 sm:p-3">
            {coursesDistribution.map((course) => {
              const isPublished =
                course.status === "published" || course.status === "PUBLISHED";
              const isDraft =
                course.status === "draft" || course.status === "DRAFT";
              const isPending =
                course.status === "pending_review" ||
                course.status === "PENDING_REVIEW";

              return (
                <div
                  key={course.id}
                  className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-slate-100 border border-slate-200/70 flex items-center justify-center shrink-0 text-[#0F5244] shadow-2xs group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0F5244] transition-colors truncate">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isPublished && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{isAr ? "منشورة" : "Published"}</span>
                          </span>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{isAr ? "مسودة" : "Draft"}</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{isAr ? "قيد المراجعة" : "Under Review"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {course.enrollment_count}{" "}
                        {isAr ? "طالب مسجل" : "learners"}
                      </span>
                    </div>

                    <Link
                      href={`/${locale}/instructor/courses`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0F5244] hover:bg-emerald-50 border border-transparent hover:border-emerald-200/80 transition-all"
                    >
                      <span>{isAr ? "إدارة" : "Manage"}</span>
                      <ChevronIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorOverviewTab;

