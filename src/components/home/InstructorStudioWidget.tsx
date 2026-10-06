"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { instructorCourseService } from "@/services/instructorCourseService";
import { instructorService } from "@/services/instructorService";
import { Users, BookOpen, PlusCircle, LayoutDashboard, Sparkles, TrendingUp, Loader2 } from "lucide-react";

interface InstructorStudioWidgetProps {
  isPreview?: boolean;
}

export function InstructorStudioWidget({ isPreview }: InstructorStudioWidgetProps = {}) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);

    async function loadInstructorStats() {
      if (isAuthenticated && (user?.role || "").toLowerCase() === "instructor") {
        try {
          setIsLoading(true);
          const [liveCoursesRes, dashRes] = await Promise.all([
            instructorCourseService.getMyCourses({ per_page: 100, limit: 100 }).catch(() => null),
            instructorService.getDashboard().catch(() => null)
          ]);
          
          const liveCourses = Array.isArray(liveCoursesRes) ? liveCoursesRes : (liveCoursesRes?.data || liveCoursesRes?.results || []);
          if (Array.isArray(liveCourses)) {
            setCourses(liveCourses);
          }
          if (dashRes) {
            setDashboardData(dashRes);
          }
        } catch (err) {
          console.warn("[InstructorStudioWidget] Could not load live courses or dashboard data:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    loadInstructorStats();
  }, [isAuthenticated, user?.role]);

  const isInstructor =
    (mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach")) ||
    isPreview;
  const isApproved =
    (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase() === "approved" ||
    isPreview;

  if (!isInstructor || !isApproved) {
    return null;
  }

  // Calculate live statistics
  const totalStudents = dashboardData?.total_students ?? courses.reduce(
    (acc, curr) => acc + Number(curr.enrollment_count || curr.enrollments_count || curr.enrolled_count || curr.students_count || curr.studentsCount || curr.total_students || 0),
    0
  );

  const publishedCourses = courses.filter(
    (c) => c.status === "published" || c.status === "PUBLISHED" || c.is_published === true
  );
  
  const publishedCount = dashboardData?.courses ? dashboardData.courses.filter((c: any) => c.status === "published" || c.status === "PUBLISHED" || c.is_published === true).length : publishedCourses.length;
  const draftCount = dashboardData?.courses 
    ? dashboardData.courses.filter((c: any) => {
        const s = String(c.status).toLowerCase();
        return s === "draft" || s === "review" || s === "pending_review" || s === "pending";
      }).length 
    : courses.filter((c) => {
        const s = String(c.status).toLowerCase();
        return s === "draft" || s === "review" || s === "pending_review" || s === "pending";
      }).length;

  return (
    <section className="w-full py-6 sm:py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Executive Luxury Studio Dashboard Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md shadow-slate-100 transition-all duration-300">
          
          {/* Header & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F5244] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0F5244]/15">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t("studioLiveOverview")}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t("instructorHubSubtitle")}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/${locale}/instructor/courses/new`}
                className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#08382E] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-[#0F5244]/15 transition-all duration-200 cursor-pointer group"
              >
                <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>{t("createNewCourse")}</span>
              </Link>

              <Link
                href={`/${locale}/instructor/overview`}
                className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 transition-all duration-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>{t("instructorDashboardBtn")}</span>
              </Link>
            </div>
          </div>

          {/* 2 Refined Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            
            {/* Stat 1: Total Students */}
            <Link href={`/${locale}/instructor/students`} className="block">
              <div className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 hover:border-blue-200 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                    <TrendingUp className="w-3 h-3" /> {isAr ? "نشط" : "Active"}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : totalStudents.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {t("totalStudentsCount")}
                </div>
              </div>
            </Link>

            {/* Stat 2: Active Courses */}
            <div className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 hover:border-emerald-200 shadow-2xs hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center border border-emerald-100">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {draftCount} {isAr ? "مسودة" : "Drafts"}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : publishedCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {t("activeCoursesCount")}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
