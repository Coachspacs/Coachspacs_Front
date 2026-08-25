"use client";

import React, { use, useState, useEffect } from "react";
import { MOCK_COURSES } from "@/lib/mockCatalogData";
import { CourseDetailsView } from "@/components/course/CourseDetailsView";
import { courseService } from "@/services/courseService";
import { Loader2 } from "lucide-react";

interface CoursePageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default function CourseDetailsPage({ params }: CoursePageProps) {
  const { slug, locale } = use(params);
  const isAr = locale === "ar";
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      setIsLoading(true);
      try {
        // Fetch real course from backend API first
        const data = await courseService.getCourseById(slug);
        if (data && (data.id || data.title)) {
          const formattedCourse = {
            id: String(data.id),
            title: data.title || "Course",
            titleAr: data.title_ar || data.title || "دورة",
            description: data.description || "",
            descriptionAr: data.description_ar || data.description || "",
            instructorName: data.instructor?.full_name || "Mohammed Katanani",
            instructorNameAr: data.instructor?.full_name_ar || data.instructor?.full_name || "محمد قطناني",
            instructorAvatar: data.instructor?.avatar || "",
            instructorRole: data.instructor?.headline || "Certified Coach",
            instructorRoleAr: data.instructor?.headline_ar || data.instructor?.headline || "مدرب معتمد",
            category: data.category?.name || "Business Coaching",
            categoryAr: data.category?.name_ar || data.category?.name || "تدريب الأعمال",
            level:
              data.level === "beginner"
                ? "Beginner"
                : data.level === "intermediate"
                ? "Intermediate"
                : data.level === "advanced"
                ? "Advanced"
                : "All Levels",
            price: Number(data.price) || 0,
            priceFormatted: Number(data.price) === 0 ? "Free" : `$${data.price}`,
            isFree: Boolean(data.is_free || Number(data.price) === 0),
            language: data.language === "ar" ? "Arabic" : "English",
            rating: data.rating || 5.0,
            reviewsCount: data.reviews_count || 0,
            reviewsCountFormatted: String(data.reviews_count || 0),
            studentsCount: data.students_count || data.total_students || 0,
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
                        isPreview: Boolean(l.is_preview),
                        videoUrl: l.video_url,
                      }))
                    : [],
                }))
              : [],
            isRealBackend: true,
          };
          setCourse(formattedCourse);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Backend course fetch info:", e);
      }

      // Fallback only if mock course slug was requested
      const mockCourse =
        MOCK_COURSES.find((c) => c.id === slug || c.id === `course-${slug}`) ||
        MOCK_COURSES[0];
      setCourse({ ...mockCourse, isRealBackend: false });
      setIsLoading(false);
    }

    loadCourse();
  }, [slug]);

  if (isLoading || !course) {
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

  return <CourseDetailsView course={course} />;
}
