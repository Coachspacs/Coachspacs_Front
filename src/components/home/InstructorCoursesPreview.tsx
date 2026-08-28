"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { BookOpen, Users, Star, PlusCircle, Edit3, Loader2 } from "lucide-react";
import { instructorCourseService } from "@/services/instructorCourseService";
import { courseService } from "@/services/courseService";

export function InstructorCoursesPreview() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach");
  const isApproved = (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase() === "approved";

  const fetchInstructorCourses = useCallback(async () => {
    if (!isInstructor || !isApproved) {
      setCourses([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await instructorCourseService.getMyCourses();
      const courseList = Array.isArray(data) ? data : data?.results || [];

      const formatted = courseList.map((c: any) => {
        const isDraft = c.status === "draft" || (!c.published_at && !c.is_published && c.status !== "published");
        return {
          id: String(c.id),
          title: c.title || c.title_en || c.title_ar || "Course",
          image: c.cover_image || c.coverImage || c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
          studentsCount: Number(c.students_count) || 0,
          rating: Number(c.rating) || 5.0,
          reviewsCount: Number(c.reviews_count) || 0,
          status: isDraft ? "Draft" : "Published",
          isDraft: isDraft,
          price: Number(c.price) || 0,
        };
      });

      setCourses(formatted);
    } catch (err) {
      console.error("Failed to load real instructor courses:", err);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [isInstructor, isApproved]);

  useEffect(() => {
    if (mounted && isInstructor && isApproved) {
      fetchInstructorCourses();
    }
  }, [mounted, isInstructor, isApproved, fetchInstructorCourses]);

  // Only show when instructor account is verified and approved
  if (!isInstructor || !isApproved) {
    return null;
  }

  const publishedCount = courses.filter((c) => !c.isDraft).length;
  const draftsCount = courses.filter((c) => c.isDraft).length;

  const filteredCourses = courses.filter((course) => {
    if (activeTab === "published") return !course.isDraft;
    if (activeTab === "drafts") return course.isDraft;
    return true;
  });

  return (
    <section suppressHydrationWarning className="w-full bg-[#FAFCFB] py-14 sm:py-18 font-sans border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0F5244] text-xs font-bold tracking-wider uppercase mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{t("myCoursesSectionTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t("myCoursesSectionTitle")}
            </h2>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm font-medium">
              {t("myCoursesSectionSubtitle")}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("allCoursesTab")} ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("published")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "published"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("publishedTab")} ({publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("drafts")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "drafts"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("draftsTab")} ({draftsCount})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={`skel-${i}`} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm animate-pulse space-y-4">
                <div className="w-full aspect-[16/10] bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-8 bg-slate-200 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl border border-dashed border-slate-300 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {locale === "ar" ? "لا توجد دورات في هذا القسم حالياً" : "No courses found in this section"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-5">
              {locale === "ar" ? "ابدأ بإنشاء دورتك الأولى ونشرها للطلاب الآن." : "Start creating your first course and publish it to students."}
            </p>
            <Link
              href={`/${locale}/instructor/courses/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] text-white text-xs font-bold hover:bg-[#07382E] transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t("createNewCourse")}</span>
            </Link>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 rtl:right-2.5 ltr:left-2.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {course.status}
                    </div>
                  </div>

                  {/* Rating & Title */}
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{course.rating}</span>
                    {course.reviewsCount > 0 && (
                      <span className="text-slate-400 font-normal text-[11px]">• {course.reviewsCount} reviews</span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0F5244] transition-colors mb-3">
                    {course.title}
                  </h3>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{course.studentsCount} {t("totalStudentsCount")}</span>
                  </div>

                  <Link
                    href={`/${locale}/instructor/courses/${course.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[#0F5244] bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t("openCourseStudio")}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
