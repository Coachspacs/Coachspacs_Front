"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Edit, Star, ImageIcon } from "lucide-react";
import { CourseCardProps } from "./types";
import { useCourseCardLogic } from "./useCourseCardLogic";

export const InstructorPreviewCourseCard: React.FC<CourseCardProps> = (props) => {
  const { course, className = "" } = props;

  const {
    isAr,
    currentLocale,
    imgSrc,
    imgError,
    handleImageError,
    displayTitle,
  } = useCourseCardLogic(props);

  const isDraft = Boolean(course.isDraft || course.status === "draft");

  return (
    <div
      className={`bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-brand-dark/30 transition-all duration-300 flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Thumbnail */}
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
          {!imgError && imgSrc ? (
            <Image
              src={imgSrc}
              alt={displayTitle || "Course"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1 p-2 text-center">
              <ImageIcon className="w-6 h-6 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400">
                {isAr ? "بدون غلاف" : "No Cover"}
              </span>
            </div>
          )}
          <div className="absolute top-2.5 rtl:right-2.5 ltr:left-2.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {isDraft
              ? isAr
                ? "مسودة"
                : "Draft"
              : isAr
              ? "منشور"
              : "Published"}
          </div>
        </div>

        {/* Rating & Title */}
        {!isDraft && Number(course.reviewsCount || 0) > 0 && Number(course.rating || 0) > 0 && (
          <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{Number(course.rating).toFixed(1)}</span>
            <span className="text-slate-400 font-normal text-[11px]">
              • {course.reviewsCount} {isAr ? "تقييم" : "reviews"}
            </span>
          </div>
        )}
        <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[var(--color-primary-main)] transition-colors mb-3">
          {displayTitle}
        </h3>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
          <Users className="w-4 h-4 text-slate-500" />
          <span>
            {course.studentsCount || 0} {isAr ? "طالب" : "students"}
          </span>
        </div>

        <Link
          href={`/${currentLocale}/instructor/courses/create?id=${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[var(--color-primary-main)] bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
        >
          <Edit className="w-3.5 h-3.5 text-slate-500" />
          <span>{isAr ? "فتح استوديو الكورس" : "Open Course Studio"}</span>
        </Link>
      </div>
    </div>
  );
};

export default InstructorPreviewCourseCard;
