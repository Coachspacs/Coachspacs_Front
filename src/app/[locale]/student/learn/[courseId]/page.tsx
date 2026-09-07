"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { LessonViewerLayout } from "@/components/course/LessonViewerLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function CoursePlayerPage() {
  const t = useTranslations("player");
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const courseId = params?.courseId as string;

  const { user } = useSelector((state: RootState) => state.auth);

  const [course, setCourse] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | number | null>(null);
  const [serverProgressPercent, setServerProgressPercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Load Course and Live Enrollment Data
  useEffect(() => {
    async function loadCourseAndEnrollment() {
      setIsLoading(true);
      try {
        const data = await courseService.getCourseById(courseId, locale);
        if (data) {
          setCourse(data);
          if (data.enrollment_id || data.enrollment?.id) {
            setEnrollmentId(data.enrollment_id || data.enrollment?.id);
          }
        }
      } catch (err) {
        console.warn("Failed to load course details:", err);
      } finally {
        setIsLoading(false);
      }

      // Live Enrollment Discovery & Progress Sync (Sprint 8 Delta US-13)
      try {
        const enrollments = await enrollmentService.getMyEnrollments();
        if (Array.isArray(enrollments)) {
          const match = enrollments.find(
            (e: any) =>
              String(e.course?.id) === String(courseId) ||
              String(e.course_id) === String(courseId) ||
              String(e.id) === String(courseId)
          );
          if (match) {
            setEnrollmentId(match.id);
            if (typeof match.progress_percent === "number") {
              setServerProgressPercent(match.progress_percent);
            }
            if (Array.isArray(match.completed_lessons) && match.completed_lessons.length > 0) {
              const strIds = match.completed_lessons.map((id: any) => String(id));
              setCompletedLessonIds((prev) => Array.from(new Set([...prev, ...strIds])));
            }
          }
        }
      } catch (e) {
        console.warn("[CoursePlayer] Could not fetch live enrollments:", e);
      }
    }

    if (courseId) {
      loadCourseAndEnrollment();
    }
  }, [courseId, locale]);

  // Load Persisted Completed Lessons
  useEffect(() => {
    if (typeof window !== "undefined" && courseId) {
      try {
        const savedCompleted = localStorage.getItem(`coachspace_course_${courseId}_completed`);
        if (savedCompleted) {
          setCompletedLessonIds(JSON.parse(savedCompleted));
        }
      } catch (e) {
        console.warn("Could not read from localStorage:", e);
      }
    }
  }, [courseId]);

  // Normalize sections and lessons
  const sectionsList: any[] = useMemo(() => {
    const raw = (course as any)?.sections || (course as any)?.modules || [];
    if (raw.length > 0) return raw;
    return [
      {
        id: "sec-default-1",
        title_ar: t("demoSectionTitle"),
        title_en: t("demoSectionTitle"),
        lessons: [
          {
            id: "les-def-1",
            title_ar: t("demoLesson1Title"),
            title_en: t("demoLesson1Title"),
            duration_minutes: 5,
            video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
          {
            id: "les-def-2",
            title_ar: t("demoLesson2Title"),
            title_en: t("demoLesson2Title"),
            duration_minutes: 12,
            video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
        ],
      },
    ];
  }, [course, t]);

  const allLessons = useMemo(() => {
    return sectionsList.flatMap((s: any, sIdx: number) => {
      const secTitle = isAr
        ? s.title_ar || s.title || t("sectionDefault", { index: sIdx + 1 })
        : s.title_en || s.title || t("sectionDefault", { index: sIdx + 1 });
      return (s.lessons || []).map((l: any, lIdx: number) => ({
        ...l,
        sectionId: s.id || `sec-${sIdx}`,
        sectionTitle: secTitle,
        title: isAr
          ? l.title_ar || l.title || t("lessonDefault", { index: lIdx + 1 })
          : l.title_en || l.title || t("lessonDefault", { index: lIdx + 1 }),
        durationFormatted: l.duration || `${l.duration_minutes || 5}:00`,
        videoUrl:
          (l.video_url && !l.video_url.includes("example.com"))
            ? l.video_url
            : l.videoUrl || l.video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      }));
    });
  }, [sectionsList, isAr, t]);

  // Toggle Lesson Completion (Sprint 8 Delta US-13)
  const toggleLessonCompletion = async (lessonId: string | number) => {
    const idStr = String(lessonId);
    const isCurrentlyDone = completedLessonIds.includes(idStr);

    // Optimistic UI update
    const updated = isCurrentlyDone
      ? completedLessonIds.filter((id) => id !== idStr)
      : [...completedLessonIds, idStr];

    setCompletedLessonIds(updated);
    if (typeof window !== "undefined" && courseId) {
      localStorage.setItem(`coachspace_course_${courseId}_completed`, JSON.stringify(updated));
    }

    // Call live Sprint 8 Delta API if enrollment is found
    if (enrollmentId) {
      try {
        if (isCurrentlyDone) {
          const res = await enrollmentService.markLessonIncomplete(enrollmentId, lessonId);
          if (typeof res?.progress_percent === "number") {
            setServerProgressPercent(res.progress_percent);
          }
        } else {
          const res = await enrollmentService.markLessonComplete(enrollmentId, lessonId);
          if (typeof res?.progress_percent === "number") {
            setServerProgressPercent(res.progress_percent);
          }
        }
      } catch (err) {
        console.warn("[CoursePlayer] Error calling complete/incomplete API:", err);
      }
    }
  };

  const handleNextLesson = useCallback(() => {
    if (activeLessonIndex < allLessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
    }
  }, [activeLessonIndex, allLessons.length]);

  const handlePrevLesson = useCallback(() => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex((prev) => prev - 1);
    }
  }, [activeLessonIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="relative w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-300 tracking-wide animate-pulse">
          {t("loadingPlatform")}
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-slate-900">
          <div className="max-w-md w-full text-center space-y-5 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t("courseNotFound")}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("courseNotFoundDesc")}
            </p>
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-emerald-800 text-white text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t("exploreCourses")}</span>
            </Link>
          </div>
        </div>
        <Footer variant="auth" />
      </div>
    );
  }

  const courseTitle = isAr
    ? course.title_ar || course.title || course.title_en
    : course.title_en || course.title || course.title_ar;

  const instructorObj = typeof course.instructor === "object"
    ? course.instructor
    : { name: course.instructor };

  return (
    <LessonViewerLayout
      courseTitle={courseTitle}
      courseSlug={course.slug || courseId}
      courseCover={course.cover_image || course.image}
      courseDescription={course.description}
      whatYouWillLearn={course.whatYouWillLearn}
      instructor={instructorObj}
      sections={sectionsList}
      allLessons={allLessons}
      activeLessonIndex={activeLessonIndex}
      completedLessonIds={completedLessonIds}
      onSelectLesson={(idx) => setActiveLessonIndex(idx)}
      onToggleComplete={toggleLessonCompletion}
      onNextLesson={handleNextLesson}
      onPrevLesson={handlePrevLesson}
      serverProgressPercent={serverProgressPercent}
      locale={locale}
      isAr={isAr}
      backHref="/student/courses"
    />
  );
}
