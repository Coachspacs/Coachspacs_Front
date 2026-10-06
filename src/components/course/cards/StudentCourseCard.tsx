"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Award, ImageIcon } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { CourseCardProps } from "./types";
import { useCourseCardLogic } from "./useCourseCardLogic";

export const StudentCourseCard: React.FC<CourseCardProps> = (props) => {
  const {
    course,
    className = "",
    onContinueLearning,
    onViewCertificate,
  } = props;

  const {
    isAr,
    currentLocale,
    imgSrc,
    imgError,
    handleImageError,
    displayTitle,
    instructorName,
    instructorTarget,
  } = useCourseCardLogic(props);

  const progress = Math.min(100, Math.max(0, Number(course.progress || 0)));
  const isCompleted = Boolean(course.isCompleted || progress >= 100);
  const learnUrl = `/${currentLocale}/student/learn/${course.id}`;

  return (
    <div
      className={`h-full flex flex-col justify-between rounded-3xl border border-slate-200/80 p-5 hover:shadow-md hover:border-brand-dark/30 transition-all bg-white group ${className}`}
    >
      <div className="space-y-4">
        {/* Thumbnail with Play Hover Overlay */}
        <Link
          href={learnUrl}
          className="block relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer border border-slate-100"
          title={displayTitle}
        >
          {!imgError && imgSrc ? (
            <Image
              src={imgSrc}
              alt={displayTitle || "Course Cover"}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1 p-2 text-center">
              <ImageIcon className="w-6 h-6 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400">
                {isAr ? "بدون غلاف" : "No Cover"}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-white/95 text-[var(--color-primary-main)] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </span>
          </div>

          <span
            className={`absolute top-3 right-3 rtl:right-auto rtl:left-3 px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-xs ${
              isCompleted ? "bg-[var(--color-primary-dark)]" : "bg-slate-900/80 backdrop-blur-xs"
            }`}
          >
            {isCompleted ? (isAr ? "مكتمل 100%" : "Completed 100%") : `${progress}%`}
          </span>
        </Link>

        {/* Details */}
        <div className="space-y-1.5 min-h-[3.25rem] flex flex-col justify-start">
          <Link
            href={learnUrl}
            className="text-base font-extrabold text-slate-900 line-clamp-2 leading-snug hover:text-[var(--color-primary-main)] transition-colors"
            title={displayTitle}
          >
            {displayTitle}
          </Link>

          {instructorName && (
            <Link
              href={`/${currentLocale}/instructors/${instructorTarget}`}
              className="text-xs text-slate-500 hover:text-[var(--color-primary-main)] hover:underline font-medium w-fit transition-colors inline-flex items-center gap-1"
              title={instructorName}
            >
              <span>{instructorName}</span>
              <VerifiedBadge size="xs" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Section: Progress Bar + Action Button */}
      <div className="mt-auto pt-4 space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-extrabold text-slate-500">
            <span>{isAr ? "نسبة الإنجاز" : "Course Progress"}</span>
            <span
              className={
                isCompleted
                  ? "text-[var(--color-primary-main)] font-black"
                  : "text-[var(--color-primary-main)] font-black"
              }
            >
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-slate-1000" : "bg-brand-dark"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Link
              href={
                course.certificateId || course.certificate_code
                  ? `/${currentLocale}/student/certificates/${course.certificateId || course.certificate_code}`
                  : `/${currentLocale}/student/certificates`
              }
              onClick={onViewCertificate}
              className="w-full py-2.5 rounded-xl bg-brand-dark hover:bg-[#07382E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <Award className="h-4 w-4 shrink-0 text-slate-300" />
              <span>{isAr ? "عرض الشهادة" : "View Certificate"}</span>
            </Link>
          ) : (
            <Link
              href={learnUrl}
              onClick={onContinueLearning}
              className="w-full py-2.5 rounded-xl bg-brand-dark hover:bg-[#07382E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>
                {progress > 0
                  ? isAr
                    ? "متابعة التعلم"
                    : "Continue Learning"
                  : isAr
                  ? "ابدأ التعلم"
                  : "Start Learning"}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourseCard;
