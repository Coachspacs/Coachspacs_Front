"use client";

import React, { useState } from "react";
import Link from "next/image";
import Image from "next/image";
import {
  Sparkles,
  Paperclip,
  Download,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { AttachmentItem } from "@/types/course";
import { courseAttachmentService } from "@/services/courseAttachmentService";
import {
  AttachmentIcon,
  getFileCategory,
  formatFileSize,
} from "@/components/shared/AttachmentIcon";
import { LessonItem, InstructorItem } from "./types";

interface LessonContentTabsProps {
  activeLesson?: LessonItem;
  activeLessonIndex: number;
  allLessons: LessonItem[];
  displayLessonTitle: string;
  displayCourseTitle: string;
  displayCourseDescription: string;
  instructorName: string;
  instructorHeadline: string;
  instructorSlug: string;
  instructor?: InstructorItem;
  whatYouWillLearn?: string[];
  courseMaterials?: AttachmentItem[];
  locale: string;
  isAr: boolean;
  t: any;
}

export function LessonContentTabs({
  activeLesson,
  activeLessonIndex,
  allLessons,
  displayLessonTitle,
  displayCourseTitle,
  displayCourseDescription,
  instructorName,
  instructorHeadline,
  instructorSlug,
  instructor,
  whatYouWillLearn = [],
  courseMaterials,
  locale,
  isAr,
  t,
}: LessonContentTabsProps) {
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<string | number | null>(null);

  const handleDownloadAttachment = async (attachmentId: string | number, fileName?: string) => {
    setDownloadingAttachmentId(attachmentId);
    try {
      await courseAttachmentService.downloadAttachment(attachmentId, fileName);
    } catch (err: any) {
      console.warn("[LessonViewerLayout] Failed to download attachment:", err);
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

  return (
    <>
      {/* 4. LESSON DETAILS & INDEPENDENT COACH PROFILE (SEPARATE CARD) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-7 space-y-6">
          {/* Lesson Meta Row & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">{activeLesson?.sectionTitle || t("currentModule")}</span>
              {activeLesson?.is_preview && (
                <>
                  <span className="text-slate-300 font-bold">·</span>
                  <span className="text-[#0F5244] font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <Sparkles size={11} className="text-[#0F5244]" />
                    <span>{t("freePreview")}</span>
                  </span>
                </>
              )}
              <span className="text-slate-300 font-bold">·</span>
              <span className="font-mono text-slate-400">
                {t("lessonOf", { current: activeLessonIndex + 1, total: allLessons.length })}
              </span>
            </div>

            {/* Lesson Main Heading */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {displayLessonTitle}
            </h1>

            {activeLesson?.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
                {activeLesson.description}
              </p>
            )}
          </div>

          {/* Coach Profile Section */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/60 transition-colors">
              <a
                href={`/${locale}/instructors/${instructorSlug}`}
                className="flex items-center gap-3 min-w-0 group/author"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200/80 shrink-0 bg-white shadow-2xs group-hover/author:border-emerald-500/40 transition-colors">
                  {instructor?.avatar ? (
                    <Image
                      src={instructor.avatar}
                      alt={instructorName}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-sm text-[#0F5244] bg-emerald-50">
                      {instructorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover/author:text-[#0F5244] transition-colors">
                      {instructorName}
                    </span>
                    <VerifiedBadge size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {instructorHeadline}
                  </p>
                </div>
              </a>

              <a
                href={`/${locale}/instructors/${instructorSlug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-emerald-300 bg-white hover:bg-emerald-50/60 text-slate-600 hover:text-[#0F5244] text-xs font-semibold transition-all shrink-0 self-start sm:self-center shadow-2xs"
              >
                <span>{t("viewProfile")}</span>
                <ArrowRight size={13} className="rtl:rotate-180 text-slate-400 group-hover:text-[#0F5244]" />
              </a>
            </div>
          </div>

          {/* Overview Section */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="text-[#0F5244] font-bold text-[11px] tracking-widest uppercase mb-1">
                {t("aboutThisCourseHeading")}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {displayCourseTitle}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line max-w-4xl">
              {displayCourseDescription}
            </p>

            {whatYouWillLearn && whatYouWillLearn.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("keySkills")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {whatYouWillLearn.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100"
                    >
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. LESSON & COURSE ATTACHMENTS (US-21) */}
      {((activeLesson?.attachments && activeLesson.attachments.length > 0) || (courseMaterials && courseMaterials.length > 0)) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0">
                  <Paperclip size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {isAr ? "المرفقات ومصادر التعلم" : "Attachments & Resources"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? "ملفات ومواد داعمة يمكنك تحميلها والاستفادة منها" : "Downloadable materials prepared for this course"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Lesson-specific Attachments */}
              {activeLesson?.attachments?.map((item) => {
                const { badgeBg } = getFileCategory(item.file_name);
                const sizeStr = formatFileSize(item.file_size || item.file_bytes);
                const isDownloading = downloadingAttachmentId === item.id;

                return (
                  <div
                    key={`lesson-att-${item.id}`}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                        <AttachmentIcon fileName={item.file_name} size={18} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                            {item.file_name}
                          </span>
                          {sizeStr && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                              {sizeStr}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full inline-block">
                          {isAr ? "مرفق خاص بهذا الدرس" : "Lesson Specific File"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(item.id, item.file_name)}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                    >
                      {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                      <span>{isAr ? "تحميل" : "Download"}</span>
                    </button>
                  </div>
                );
              })}

              {/* Course Materials */}
              {courseMaterials?.map((item) => {
                const { badgeBg } = getFileCategory(item.file_name);
                const sizeStr = formatFileSize(item.file_size || item.file_bytes);
                const isDownloading = downloadingAttachmentId === item.id;

                return (
                  <div
                    key={`course-att-${item.id}`}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                        <AttachmentIcon fileName={item.file_name} size={18} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                            {item.file_name}
                          </span>
                          {sizeStr && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                              {sizeStr}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.2 rounded-full inline-block">
                          {isAr ? "مواد الدورة العامة" : "Course Material"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(item.id, item.file_name)}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                    >
                      {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                      <span>{isAr ? "تحميل" : "Download"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
