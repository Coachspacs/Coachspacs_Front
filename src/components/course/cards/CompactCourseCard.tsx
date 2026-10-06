"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Check,
  Play,
  Eye,
  Edit,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  GraduationCap,
} from "lucide-react";
import InstructorPurchaseNoticeModal from "@/components/modals/InstructorPurchaseNoticeModal";
import { CourseCardProps } from "./types";
import { useCourseCardLogic } from "./useCourseCardLogic";

export function CompactCourseCard(props: CourseCardProps) {
  const { course, className = "" } = props;

  const {
    isAr,
    currentLocale,
    router,
    imgSrc,
    imgError,
    handleImageError,
    displayTitle,
    displayCategory,
    coursePath,
    isInstructor,
    isMyOwnCourse,
    enrolledState,
    isFree,
    isInCart,
    isEnrolling,
    instructorModalOpen,
    setInstructorModalOpen,
    resolvedPrice,
    handleCartClick,
    handleFreeEnroll,
  } = useCourseCardLogic(props);

  return (
    <>
      <Link href={coursePath} className={`block group h-full select-none ${className}`}>
        <div className="flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-brand-dark/30 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer">
          {/* Thumbnail */}
          <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden flex items-center justify-center">
            {!imgError && imgSrc ? (
              <Image
                src={imgSrc}
                alt={displayTitle || "Course"}
                fill
                sizes="(max-width: 768px) 50vw, 240px"
                onError={handleImageError}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1 p-2 text-center">
                <ImageIcon className="w-5 h-5 text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400">
                  {isAr ? "بدون غلاف" : "No Cover"}
                </span>
              </div>
            )}

            {/* Enrolled Badge */}
            {enrolledState && (
              <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-md bg-[var(--color-primary-dark)] text-white shadow-xs">
                  <CheckCircle2 className="w-2.5 h-2.5 text-slate-200" />
                  <span>{isAr ? "مسجل" : "Enrolled"}</span>
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
            <div className="space-y-1">
              {displayCategory && (
                <span className="text-[9px] font-extrabold uppercase text-[var(--color-primary-main)] bg-[#E8F3F1] px-1.5 py-0.5 rounded">
                  {displayCategory}
                </span>
              )}
              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[var(--color-primary-main)] transition-colors">
                {displayTitle}
              </h4>
            </div>

            {/* Price & Action Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1.5">
              <span className="text-xs font-black text-slate-900 leading-tight">
                {enrolledState ? (
                  <span className="text-[var(--color-primary-main)] font-bold text-[11px]">
                    {isAr ? "مسجل" : "Enrolled"}
                  </span>
                ) : isFree ? (
                  <span className="text-[var(--color-primary-main)] font-bold text-[11px]">
                    {isAr ? "مجاني" : "Free"}
                  </span>
                ) : (
                  course.priceFormatted || `$${Number(resolvedPrice || 0).toFixed(2)}`
                )}
              </span>

              {/* Action Button */}
              {isInstructor ? (
                isMyOwnCourse ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/${currentLocale}/instructor/courses/create?id=${course.id}`);
                    }}
                    title={isAr ? "إدارة الدورة" : "Manage in Studio"}
                    className="p-1.5 rounded-full bg-brand-dark hover:bg-[#07382E] text-white transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(coursePath);
                    }}
                    title={isAr ? "معاينة الدورة" : "Preview Course"}
                    className="p-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[var(--color-primary-main)] transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                )
              ) : enrolledState ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/${currentLocale}/student/learn/${course.id}`);
                  }}
                  title={isAr ? "تابع التعلم" : "Continue Learning"}
                  className="p-1.5 rounded-full bg-brand-dark hover:bg-[#07382E] text-white transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0"
                >
                  <Play className="h-3 w-3 fill-current" />
                </button>
              ) : isFree ? (
                <button
                  type="button"
                  onClick={handleFreeEnroll}
                  disabled={isEnrolling}
                  title={isAr ? "سجل مجاناً" : "Enroll Free"}
                  className="px-2.5 py-1 rounded-full bg-brand-dark hover:bg-[#07382E] text-white transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold shadow-2xs active:scale-95 shrink-0 disabled:opacity-70"
                >
                  {isEnrolling ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <GraduationCap className="h-3 w-3" />
                      <span>{isAr ? "مجاناً" : "Free"}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCartClick}
                  title={
                    isInCart
                      ? isAr
                        ? "في السلة (انتقل إلى السلة)"
                        : "In Cart (Go to Cart)"
                      : isAr
                      ? "إضافة إلى السلة"
                      : "Add to Cart"
                  }
                  className={`p-1.5 rounded-full border transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0 ${
                    isInCart
                      ? "bg-[var(--color-primary-dark)] text-white border-brand-dark hover:bg-brand-dark"
                      : "bg-slate-100 text-[var(--color-primary-main)] border-slate-200/90 hover:bg-[var(--color-primary-dark)] hover:text-white"
                  }`}
                >
                  {isInCart ? <Check className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
      <InstructorPurchaseNoticeModal
        isOpen={instructorModalOpen}
        onClose={() => setInstructorModalOpen(false)}
        courseTitle={displayTitle}
      />
    </>
  );
}

export default CompactCourseCard;
