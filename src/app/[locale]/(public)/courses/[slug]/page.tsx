"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { CourseDetailsView } from "@/components/course/CourseDetailsView";
import { courseService } from "@/services/courseService";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function CourseDetailsPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const locale = useLocale() || (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function loadCourse() {
      setIsLoading(true);
      try {
        const data = await courseService.getCourseById(slug, locale);
        if (data && (data.id || data.title)) {
          const instName = typeof data.instructor === "object" ? (data.instructor?.full_name || data.instructor?.name || "") : (typeof data.instructor === "string" ? data.instructor : "");
          const catName = typeof data.category === "object" ? (data.category?.name || "") : (typeof data.category === "string" ? data.category : "");
          const formattedCourse = {
            id: String(data.id),
            title: isAr ? (data.title_ar || data.title || data.title_en || "دورة") : (data.title || data.title_en || data.title_ar || "Course"),
            titleAr: data.title_ar || data.title || "دورة",
            description: isAr ? (data.description_ar || data.description || data.description_en || "") : (data.description || data.description_en || data.description_ar || ""),
            descriptionAr: data.description_ar || data.description || "",
            instructor: typeof data.instructor === "object" ? data.instructor : undefined,
            instructorName: instName,
            instructorNameAr: typeof data.instructor === "object" && data.instructor?.full_name_ar ? data.instructor.full_name_ar : instName,
            instructorAvatar: (typeof data.instructor === "object" ? data.instructor?.avatar : undefined) || "",
            instructorRole: (typeof data.instructor === "object" ? (data.instructor?.headline || data.instructor?.role) : undefined) || "Certified Coach",
            instructorRoleAr: (typeof data.instructor === "object" ? (data.instructor?.headline_ar || data.instructor?.headline) : undefined) || "مدرب معتمد",
            category: catName,
            categoryAr: typeof data.category === "object" && data.category?.name_ar ? data.category.name_ar : catName,
            level:
              data.level === "beginner"
                ? "Beginner"
                : data.level === "intermediate"
                ? "Intermediate"
                : data.level === "advanced"
                ? "Advanced"
                : "All Levels",
            price: Number(data.price) || 0,
            priceFormatted: Number(data.price) === 0 ? (isAr ? "مجاني" : "Free") : `$${data.price}`,
            isFree: Boolean(data.is_free || Number(data.price) === 0),
            is_free: Boolean(data.is_free || Number(data.price) === 0),
            is_enrolled: Boolean(data.is_enrolled),
            language: data.language === "ar" ? "Arabic" : "English",
            rating: Number(data.rating) || 5.0,
            reviewsCount: Number(data.reviews_count) || 0,
            reviewsCountFormatted: String(data.reviews_count || 0),
            studentsCount: Number(data.students_count) || Number(data.total_students) || 0,
            coverImage: data.cover_image || data.image || "",
            sections: Array.isArray(data.sections)
              ? data.sections.map((s: any, sIdx: number) => ({
                  id: String(s.id || `sec-${sIdx}`),
                  titleEn: s.title_en || s.title || `Section ${sIdx + 1}`,
                  titleAr: s.title_ar || s.title || `القسم ${sIdx + 1}`,
                  durationEn: `${s.lessons?.length || 0} lessons`,
                  durationAr: `${s.lessons?.length || 0} دروس`,
                  lessons: Array.isArray(s.lessons)
                    ? s.lessons.map((l: any, lIdx: number) => ({
                        id: String(l.id || `les-${lIdx}`),
                        titleEn: l.title_en || l.title || `Lesson ${lIdx + 1}`,
                        titleAr: l.title_ar || l.title || `الدرس ${lIdx + 1}`,
                        duration: l.duration || `${l.duration_minutes || 5}:00`,
                        duration_minutes: l.duration_minutes || 5,
                        isPreview: Boolean(l.is_preview),
                        videoUrl: l.video_url,
                        video_url: l.video_url,
                      }))
                    : [],
                }))
              : [],
            isRealBackend: true,
          };
          setCourse(formattedCourse);
        } else {
          setCourse(null);
        }
      } catch (e) {
        console.warn("Backend course fetch error:", e);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourse();
  }, [slug, locale, isAr]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F5244]" />
          <span className="text-xs font-bold">
            {isAr ? "جاري تحميل تفاصيل الدورة..." : "Loading course details..."}
          </span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] bg-[#FAFBFB] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900">
            {isAr ? "لم يتم العثور على الدورة" : "Course Not Found"}
          </h2>
          <p className="text-xs text-slate-500">
            {isAr
              ? "الدورة المطلوبة غير متوفرة أو تم نقلها."
              : "The requested course is not available or has been removed."}
          </p>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{isAr ? "تصفح الكورسات" : "Browse Courses"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return <CourseDetailsView course={course} />;
}
