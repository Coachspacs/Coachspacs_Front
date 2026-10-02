"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  User,
  Edit,
  Eye,
  Play,
  Loader2,
  GraduationCap,
  ShoppingCart,
  Check,
  ImageIcon,
} from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import InstructorPurchaseNoticeModal from "@/components/modals/InstructorPurchaseNoticeModal";
import { CourseCardProps } from "./types";
import { useCourseCardLogic } from "./useCourseCardLogic";

export const CatalogCourseCard: React.FC<CourseCardProps> = (props) => {
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
    instructorName,
    instructorTarget,
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

  const getBadgeStyle = (badge?: string) => {
    if (badge === "Bestseller") return "bg-[#45D1B4] text-slate-900 font-black";
    if (badge === "New") return "bg-[#38BDF8] text-slate-900 font-black";
    return "bg-emerald-500 text-white font-black";
  };

  const getBadgeText = (badge?: string) => {
    if (badge === "Bestseller") return isAr ? "الأكثر مبيعاً" : "Bestseller";
    if (badge === "New") return isAr ? "جديد" : "New";
    if (badge === "Popular") return isAr ? "شائع" : "Popular";
    return badge;
  };

  return (
    <>
      <Link href={coursePath} className={`block group h-full ${className}`}>
        <div className="flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-[#0F5244]/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
          {/* Top Image Banner */}
          <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
            {!imgError && imgSrc ? (
              <Image
                src={imgSrc}
                alt={displayTitle || "Course"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={handleImageError}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1 p-2 text-center">
                <ImageIcon className="w-6 h-6 text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400">
                  {isAr ? "بدون غلاف" : "No Cover"}
                </span>
              </div>
            )}

            {/* Enrolled Badge on Top Corner */}
            {enrolledState && (
              <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-md bg-emerald-700 text-white shadow-md backdrop-blur-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{isAr ? "مسجل" : "Enrolled"}</span>
                </span>
              </div>
            )}

            {/* Top-Left Badge */}
            {course.badge && course.badge !== "New" && (
              <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                <span
                  className={`inline-block px-2.5 py-1 text-[11px] rounded-md uppercase tracking-wider shadow-2xs ${getBadgeStyle(
                    course.badge
                  )}`}
                >
                  {getBadgeText(course.badge)}
                </span>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="flex flex-col flex-1 p-5 justify-between space-y-4">
            <div className="space-y-2">
              {/* Category */}
              {displayCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#0F5244] bg-[#E8F3F1] px-2.5 py-0.5 rounded-md">
                    {displayCategory}
                  </span>
                </div>
              )}

              {/* Course Title */}
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0F5244] transition-colors line-clamp-2 leading-snug tracking-tight">
                {displayTitle}
              </h3>

              {/* Instructor */}
              {instructorName && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/${currentLocale}/instructors/${instructorTarget}`);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0F5244] pt-0.5 w-fit cursor-pointer transition-colors group/inst"
                  title={isAr ? "عرض ملف المدرب" : "View Instructor Profile"}
                >
                  <User className="h-3.5 w-3.5 text-slate-400 group-hover/inst:text-[#0F5244] transition-colors" />
                  <span className="hover:underline font-semibold">
                    {instructorName}
                  </span>
                  <VerifiedBadge size="xs" />
                </div>
              )}
            </div>

            {/* Rating & Details Footer */}
            <div className="space-y-3 pt-2">
              {/* Rating */}
              {Number(course.reviewsCount || 0) > 0 && Number(course.rating || 0) > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-extrabold text-slate-900">
                    {Number(course.rating).toFixed(1)}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.floor(course.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-amber-100 text-amber-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400 font-medium">
                    ({course.reviewsCountFormatted || course.reviewsCount})
                  </span>
                </div>
              )}

              {/* Price & Action Capsule Button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex items-center">
                  <span className="text-lg font-black text-slate-900 leading-tight">
                    {enrolledState ? (
                      <span className="text-emerald-700 font-extrabold text-sm sm:text-base">
                        {isAr ? "مسجل" : "Enrolled"}
                      </span>
                    ) : isFree ? (
                      <span className="text-emerald-600 font-extrabold">
                        {isAr ? "مجاني" : "Free"}
                      </span>
                    ) : (
                      course.priceFormatted || `$${Number(resolvedPrice || 0).toFixed(2)}`
                    )}
                  </span>
                </div>

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
                      className="px-4 py-2 rounded-full bg-[#0F5244] hover:bg-[#07382E] text-white transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold shadow-2xs active:scale-95 shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span>{isAr ? "إدارة الدورة" : "Manage in Studio"}</span>
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
                      className="px-4 py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#0F5244] hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold shadow-2xs active:scale-95 shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{isAr ? "معاينة الدورة" : "Preview Course"}</span>
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
                    className="px-4 py-2 rounded-full bg-[#0F5244] hover:bg-[#07382E] text-white transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold shadow-2xs active:scale-95 shrink-0"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isAr ? "تابع التعلم" : "Continue Learning"}</span>
                  </button>
                ) : isFree ? (
                  <button
                    type="button"
                    onClick={handleFreeEnroll}
                    disabled={isEnrolling}
                    title={isAr ? "سجل مجاناً" : "Enroll Free"}
                    className="px-4 py-2 rounded-full bg-[#0F5244] hover:bg-[#07382E] text-white transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold shadow-2xs active:scale-95 shrink-0 disabled:opacity-70"
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isAr ? "جاري التسجيل..." : "Enrolling..."}</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-4 w-4" />
                        <span>{isAr ? "سجل مجاناً" : "Enroll Free"}</span>
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
                    className={`px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold shadow-2xs active:scale-95 shrink-0 ${
                      isInCart
                        ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-600 hover:text-white"
                    }`}
                  >
                    {isInCart ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>{isAr ? "في السلة" : "In Cart"}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>{isAr ? "أضف إلى السلة" : "Add to Cart"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
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
};

export default CatalogCourseCard;
