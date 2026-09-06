"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { courseService } from "@/services/courseService";
import { CourseCard } from "@/components/catalog/CourseCard";
import { Course } from "@/types/catalog";

export function MasterYourCraftSection() {
  const t = useTranslations("home");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    async function load() {
      try {
        const data = await courseService.getCourses({ page_size: 50 }, locale);
        if (!isSubscribed) return;
        const results = Array.isArray(data) ? data : data?.results || [];
        if (results.length > 0) {
          const mapped: Course[] = results.slice(0, 3).map((c: any) => {
            const instId = typeof c.instructor === "object" ? c.instructor?.id : c.instructor_id;
            const instName = typeof c.instructor === "object" ? (c.instructor?.full_name || c.instructor?.name || "") : (typeof c.instructor === "string" ? c.instructor : "");
            const instNameAr = typeof c.instructor === "object" && c.instructor?.full_name_ar ? c.instructor.full_name_ar : instName;
            const catName = typeof c.category === "object" ? (c.category?.name || "") : (typeof c.category === "string" ? c.category : "");
            const catNameAr = typeof c.category === "object" && c.category?.name_ar ? c.category.name_ar : (c.category_ar || catName);
            const priceNum = Number(c.price) || 0;
            return {
              id: String(c.id),
              title: c.title || c.title_en || "Course",
              titleAr: c.title_ar || c.title || "دورة تدريبية",
              instructorId: instId ? String(instId) : undefined,
              instructorName: instName,
              instructorNameAr: instNameAr,
              category: catName || (locale === "ar" ? "تطوير الذات" : "Personal Development"),
              categoryAr: catNameAr || "تطوير الذات",
              level: c.level || "All Levels",
              description: c.description || "",
              price: priceNum,
              priceFormatted: priceNum === 0 ? "Free" : `$${priceNum.toFixed(2)}`,
              isFree: Boolean(c.is_free || priceNum === 0),
              rating: Number(c.rating || 0),
              reviewsCount: Number(c.reviews_count || c.reviewsCount || 0),
              reviewsCountFormatted: String(Number(c.reviews_count || c.reviewsCount || 0)),
              coverImage: c.cover_image || c.coverImage || c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
              badge: c.is_bestseller ? "Bestseller" : undefined,
            };
          });
          setCourses(mapped);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.warn("Failed to load featured courses for home:", err);
        if (isSubscribed) setCourses([]);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    load();

    return () => {
      isSubscribed = false;
    };
  }, [locale, isAr]);

  return (
    <section suppressHydrationWarning className="w-full bg-[#F0F3FF] py-12 sm:py-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t("masterYourCraftTitle")}
          </h2>
          <p className="mt-3 text-slate-500 text-sm sm:text-base font-medium">
            {t("masterYourCraftSubtitle")}
          </p>
        </div>

        {/* Course Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[...Array(3)].map((_, i) => (
              <div
                key={`skel-${i}`}
                className="bg-white rounded-2xl overflow-hidden shadow-2xs border border-slate-200/80 flex flex-col w-full animate-pulse"
              >
                <div className="w-full aspect-[16/10] bg-slate-200" />
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-slate-200 rounded-md" />
                    <div className="h-5 w-full bg-slate-200 rounded-md" />
                    <div className="h-4 w-32 bg-slate-200 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                    <div className="h-6 w-16 bg-slate-200 rounded-md" />
                    <div className="h-8 w-24 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-4 max-w-md mx-auto shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900">
              {t("exploreAvailableCourses")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("exploreAvailableCoursesSubtitle")}
            </p>
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-2xs"
            >
              <span>{t("browseAllCourses")}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} isAr={isAr} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
