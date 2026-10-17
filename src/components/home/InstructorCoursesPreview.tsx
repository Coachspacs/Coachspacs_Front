"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { BookOpen, Users, Star, PlusCircle, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { instructorCourseService } from "@/services/instructorCourseService";
import { CourseCard } from "@/components/course/CourseCard";

interface InstructorCoursesPreviewProps {
  isPreview?: boolean;
}

export function InstructorCoursesPreview({ isPreview }: InstructorCoursesPreviewProps = {}) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Slider State
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Touch Swipe State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Responsive itemsPerPage calculation
  useEffect(() => {
    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (window.innerWidth < 640) {
          setItemsPerPage(1);
        } else if (window.innerWidth < 1024) {
          setItemsPerPage(2);
        } else {
          setItemsPerPage(3);
        }
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Reset slider index and page when activeTab changes
  useEffect(() => {
    setCurrentIndex(0);
    setCurrentPage(0);
  }, [activeTab]);

  const isInstructor =
    (mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach")) ||
    isPreview;
  const isApproved =
    (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase() === "approved" ||
    isPreview;

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
        const resolvedStudentsCount = Number(
          c.enrollment_count ??
          c.enrollments_count ??
          c.enrolled_count ??
          c.enrolled_students_count ??
          c.students_count ??
          c.total_students ??
          c.studentsCount ??
          (Array.isArray(c.enrolled_students) ? c.enrolled_students.length : undefined) ??
          (Array.isArray(c.students) ? c.students.length : undefined) ??
          (Array.isArray(c.enrollments) ? c.enrollments.length : undefined) ??
          0,
        ) || 0;

        return {
          id: String(c.id),
          title: (locale === "ar" ? (c.title_ar || c.title) : (c.title_en || c.title)) || c.title || t("untitledCourse"),
          image: c.cover_image || c.coverImage || c.image || "/images/courses/course-react.png",
          studentsCount: resolvedStudentsCount,
          rating: Number(c.rating || 0),
          reviewsCount: Number(c.reviews_count || c.reviewsCount) || 0,
          isDraft: isDraft,
          price: Number(c.price) || 0,
        };
      });

      setCourses(formatted);
    } catch (err) {
      console.warn("Instructor courses preview fetch info:", err);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstructor, isApproved, locale]);

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

  const effectiveItemsPerPage = Math.min(itemsPerPage, Math.max(1, filteredCourses.length));
  const maxIndex = Math.max(0, filteredCourses.length - effectiveItemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / effectiveItemsPerPage));

  const goToPage = (pageIndex: number) => {
    const clampedPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
    setCurrentPage(clampedPage);
    setCurrentIndex(Math.min(clampedPage * effectiveItemsPerPage, maxIndex));
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    }
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 40) {
      if (isAr) {
        if (distance > 40) handlePrev();
        else handleNext();
      } else {
        if (distance > 40) handleNext();
        else handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const translateOffset = (currentIndex * 100) / effectiveItemsPerPage;

  return (
    <section suppressHydrationWarning className="w-full bg-[#FAFCFB] py-14 sm:py-18 font-sans border-y border-slate-200/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-brand-dark text-xs font-bold tracking-wider uppercase mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-dark" />
              <span>{t("myCoursesBadge")}</span>
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
                  ? "bg-brand-dark text-white shadow-xs"
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
                  ? "bg-brand-dark text-white shadow-xs"
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
                  ? "bg-brand-dark text-white shadow-xs"
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
              {t("emptyCoursesTitle")}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-5">
              {t("emptyCoursesDesc")}
            </p>
            <Link
              href={`/${locale}/instructor/courses/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-[#07382E] transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t("createNewCourse")}</span>
            </Link>
          </div>
        ) : (
          /* Slider Track Window */
          <div className="relative w-full">
            <div
              className="w-full overflow-hidden py-2"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  transform: isAr
                    ? `translateX(${translateOffset}%)`
                    : `translateX(-${translateOffset}%)`,
                }}
              >
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="shrink-0 px-3"
                    style={{ width: `${100 / effectiveItemsPerPage}%` }}
                  >
                    <CourseCard
                      course={course}
                      variant="instructor-preview"
                      isAr={isAr}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Unified Bottom Navigation Toolbar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5 border-t border-slate-200/70">
                {/* Courses Range Counter */}
                <div className="text-xs font-semibold text-slate-500">
                  {isAr ? (
                    <>
                      عرض الدورات{" "}
                      <span className="font-black text-slate-900">
                        {currentPage * effectiveItemsPerPage + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-black text-slate-900">
                        {Math.min(
                          (currentPage + 1) * effectiveItemsPerPage,
                          filteredCourses.length
                        )}
                      </span>{" "}
                      من أصل{" "}
                      <span className="font-black text-slate-900">
                        {filteredCourses.length}
                      </span>{" "}
                      دورة
                    </>
                  ) : (
                    <>
                      Showing courses{" "}
                      <span className="font-black text-slate-900">
                        {currentPage * effectiveItemsPerPage + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-black text-slate-900">
                        {Math.min(
                          (currentPage + 1) * effectiveItemsPerPage,
                          filteredCourses.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-black text-slate-900">
                        {filteredCourses.length}
                      </span>{" "}
                      courses
                    </>
                  )}
                </div>

                {/* Unified Controls: [Prev] [Dots] [Next] */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    aria-label={isAr ? "الصفحة السابقة" : "Previous page"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isAr ? "السابق" : "Previous"}</span>
                  </button>

                  {/* Interactive Dots */}
                  <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        onClick={() => goToPage(idx)}
                        aria-label={
                          isAr
                            ? `الانتقال إلى صفحة ${idx + 1}`
                            : `Go to page ${idx + 1}`
                        }
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentPage === idx
                            ? "w-6 bg-brand-dark shadow-xs"
                            : "w-2 bg-slate-200 hover:bg-slate-300 hover:w-3"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentPage >= totalPages - 1}
                    aria-label={isAr ? "الصفحة التالية" : "Next page"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <span className="hidden sm:inline">{isAr ? "التالي" : "Next"}</span>
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
