"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  X,
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Tv,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Smartphone,
  Infinity as InfinityIcon,
  Play,
  Globe,
  Sparkles,
  Layers,
} from "lucide-react";

export interface LiveCoursePreviewLesson {
  id: string;
  title?: string;
  title_en?: string;
  title_ar?: string;
  duration?: string;
  duration_minutes?: number;
  video_url?: string;
  video_public_id?: string;
  is_preview?: boolean;
}

export interface LiveCoursePreviewSection {
  id: string;
  title?: string;
  title_en?: string;
  title_ar?: string;
  lessons: LiveCoursePreviewLesson[];
}

export interface LiveCoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  categoryName: string;
  level: string;
  language: string;
  price: string;
  coverUrl?: string | null;
  sections: LiveCoursePreviewSection[];
  instructorName?: string;
}

export function LiveCoursePreviewModal({
  isOpen,
  onClose,
  titleEn,
  titleAr,
  descEn,
  descAr,
  categoryName,
  level,
  language,
  price,
  coverUrl,
  sections = [],
  instructorName,
}: LiveCoursePreviewModalProps) {
  const t = useTranslations("liveCoursePreview");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [previewLang, setPreviewLang] = useState<"ar" | "en">(isAr ? "ar" : "en");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string } | null>(null);

  // Initialize all sections open by default in preview
  useEffect(() => {
    if (sections.length > 0) {
      const initOpen: Record<string, boolean> = {};
      sections.forEach((s, idx) => {
        initOpen[s.id || `sec-${idx}`] = idx === 0 || idx === 1;
      });
      setOpenSections(initOpen);
    }
  }, [sections]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeVideoModal) {
          setActiveVideoModal(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeVideoModal, onClose]);

  if (!isOpen) return null;

  const currentTitle =
    previewLang === "ar"
      ? titleAr.trim() || titleEn.trim() || "دورة تدريبية احترافية"
      : titleEn.trim() || titleAr.trim() || "Professional Online Course";

  const currentDesc =
    previewLang === "ar"
      ? descAr.trim() || descEn.trim() || "اكتسب مهارات متقدمة وخبرة عملية يقودها نخبة من الخبراء والمدربين المعتمدين."
      : descEn.trim() || descAr.trim() || "Gain in-demand skills and practical expertise coached by verified industry leaders.";

  const numPrice = Number(price);
  const isFree = isNaN(numPrice) || numPrice === 0;
  const formattedPrice = isFree ? t("freePrice") : `$${numPrice.toFixed(2)}`;

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const totalMinutes = sections.reduce(
    (acc, s) =>
      acc + (s.lessons?.reduce((lAcc, l) => lAcc + (Number(l.duration_minutes) || 5), 0) || 0),
    0
  );

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Find first lesson with video for thumbnail play trigger
  const firstVideoLesson = sections
    .flatMap((s) => s.lessons || [])
    .find((l) => Boolean(l.video_url));

  return (
    <div
      dir={previewLang === "ar" ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Top Floating Simulator Control Bar */}
      <div className="sticky top-0 z-40 w-full bg-slate-900/95 border-b border-slate-800/80 backdrop-blur px-4 sm:px-8 py-3 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t("previewModeNotice")}</span>
          </div>

          {/* Language Preview Switcher */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewLang("ar")}
              className={`px-3 py-1 rounded-lg transition-all ${
                previewLang === "ar"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("switchLangAr")}
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang("en")}
              className={`px-3 py-1 rounded-lg transition-all ${
                previewLang === "en"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("switchLangEn")}
            </button>
          </div>
        </div>

        {/* Close Preview Button */}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
          <span>{t("closeBtn")}</span>
        </button>
      </div>

      {/* Main Authentic Course Landing Page Preview */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 flex-1">
        
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left / Main Details Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Badges Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-1 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{categoryName || "Development"}</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                {level || "Beginner"}
              </span>

              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-500" />
                <span>{language || "Bilingual"}</span>
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {currentTitle}
            </h1>

            {/* Course Subtitle / Description Preview */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              {currentDesc}
            </p>

            {/* Meta Row: Rating, Students, Instructor */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 font-bold flex-wrap pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-1 text-amber-600 font-black">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span>5.0</span>
                <span className="text-slate-400 font-normal">({previewLang === "ar" ? "دورة جديدة" : "New"})</span>
              </div>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1.5 text-slate-700">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>0 {previewLang === "ar" ? "طالب مسجل" : "Students"}</span>
              </div>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{instructorName || (previewLang === "ar" ? "مدرب معتمد" : "Verified Coach")}</span>
              </div>
            </div>
          </div>

          {/* Right Floating Purchase Card (1 Col) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden sticky top-20 space-y-5 p-5">
            {/* Video / Cover Thumbnail */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 group">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={currentTitle}
                  width={600}
                  height={340}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <PlayCircle className="w-12 h-12 text-slate-500 stroke-[1.5]" />
                  <span className="text-xs font-bold">{previewLang === "ar" ? "غلاف الدورة" : "Course Cover"}</span>
                </div>
              )}

              {/* Play Overlay Button */}
              {firstVideoLesson?.video_url && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveVideoModal({
                      title:
                        previewLang === "ar"
                          ? firstVideoLesson.title_ar || firstVideoLesson.title || "معاينة الفيديو"
                          : firstVideoLesson.title_en || firstVideoLesson.title || "Video Preview",
                      url: firstVideoLesson.video_url!,
                    })
                  }
                  className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/50 flex flex-col items-center justify-center gap-2 text-white transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-white/95 text-[#0F5244] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-[#0F5244] ml-0.5 rtl:mr-0.5" />
                  </div>
                  <span className="text-xs font-black tracking-wide drop-shadow-md">
                    {t("previewLessonBadge")}
                  </span>
                </button>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline justify-between gap-3 pt-1">
              <div>
                <span className="text-3xl font-black text-slate-900">{formattedPrice}</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {previewLang === "ar" ? "ضمان استرجاع 30 يوم" : "30-Day Guarantee"}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                className="w-full py-3.5 rounded-2xl bg-[#0F5244] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-90"
              >
                <span>{t("enrollPreviewBtn", { price: formattedPrice })}</span>
              </button>

              <button
                type="button"
                className="w-full py-3 rounded-2xl border border-slate-300 bg-white text-slate-800 text-xs font-black hover:bg-slate-50 cursor-not-allowed"
              >
                <span>{t("addToCartPreviewBtn")}</span>
              </button>
            </div>

            {/* Course Features Inclusions */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700 font-semibold">
              <h4 className="font-extrabold text-slate-900 text-xs">{t("courseIncludes")}</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t("featureVideos", { count: totalLessons })}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t("featureCertificate")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <InfinityIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t("featureAccess")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t("featureDevices")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CURRICULUM SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t("curriculumTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5">
                {t("totalCurriculumStats", {
                  sections: sections.length,
                  lessons: totalLessons,
                  duration: totalMinutes,
                })}
              </p>
            </div>
          </div>

          {/* Sections Accordion */}
          <div className="space-y-3.5">
            {sections.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                {t("noSectionsYet")}
              </div>
            ) : (
              sections.map((section, sIdx) => {
                const isSecOpen = openSections[section.id || `sec-${sIdx}`] ?? true;
                const secTitle =
                  previewLang === "ar"
                    ? section.title_ar || section.title || `القسم ${sIdx + 1}`
                    : section.title_en || section.title || `Section ${sIdx + 1}`;
                const secLessons = section.lessons || [];

                return (
                  <div
                    key={section.id || sIdx}
                    className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Section Header Accordion Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id || `sec-${sIdx}`)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-100/70 text-left rtl:text-right transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-emerald-100 text-[#0F5244] font-black text-xs flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                          {secTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-slate-500">
                        <span>
                          {secLessons.length} {previewLang === "ar" ? "دروس" : "Lessons"}
                        </span>
                        {isSecOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Lessons List Body */}
                    {isSecOpen && (
                      <div className="divide-y divide-slate-100 p-2 sm:p-3 space-y-1 bg-white">
                        {secLessons.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 font-medium">
                            {previewLang === "ar" ? "لا توجد دروس في هذا القسم بعد." : "No lessons in this section yet."}
                          </div>
                        ) : (
                          secLessons.map((lesson, lIdx) => {
                            const lesTitle =
                              previewLang === "ar"
                                ? lesson.title_ar || lesson.title || `الدرس ${lIdx + 1}`
                                : lesson.title_en || lesson.title || `Lesson ${lIdx + 1}`;
                            const hasVideo = Boolean(lesson.video_url || lesson.video_public_id);

                            return (
                              <div
                                key={lesson.id || lIdx}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/80 transition-colors text-xs"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <PlayCircle className="w-4 h-4 text-[#0F5244] shrink-0" />
                                  <span className="font-bold text-slate-800 truncate">
                                    {lIdx + 1}. {lesTitle}
                                  </span>
                                  {lesson.is_preview && (
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                      {t("previewLessonBadge")}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  {hasVideo && lesson.video_url ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveVideoModal({
                                          title: lesTitle,
                                          url: lesson.video_url!,
                                        })
                                      }
                                      className="text-[10px] font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Play className="w-2.5 h-2.5 fill-emerald-700" />
                                      <span>{t("videoAvailable")}</span>
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                      {t("noVideo")}
                                    </span>
                                  )}
                                  <span className="text-slate-400 font-mono text-[11px]">
                                    {lesson.duration || "05:00"}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Embedded Live Video Player Modal for previewing uploaded lessons */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-black truncate">{activeVideoModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src={activeVideoModal.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveCoursePreviewModal;
