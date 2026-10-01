"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Edit,
  Star,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  FileText,
  Send,
  Loader2,
  Eye,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { CourseCardProps } from "./types";
import { useCourseCardLogic } from "./useCourseCardLogic";

export const InstructorRowCourseCard: React.FC<CourseCardProps> = (props) => {
  const {
    course,
    className = "",
    children,
    onOpenDeleteModal,
    onOpenArchiveModal,
    onSubmitReview,
    isSubmittingReview,
    isExpandedStudents,
    onToggleExpandStudents,
  } = props;

  const {
    isAr,
    currentLocale,
    imgSrc,
    imgError,
    handleImageError,
    displayTitle,
    displayCategory,
    isFree,
  } = useCourseCardLogic(props);

  const status = course.status || (course.isPublished ? "published" : "draft");
  const coursePrice = Number(course.price || 0);
  const studentsCount = Number(
    course.studentsCount ??
    course.students_count ??
    course.enrollment_count ??
    course.enrollments_count ??
    course.enrolled_count ??
    course.enrolled_students_count ??
    course.total_students ??
    (Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : undefined) ??
    (Array.isArray(course.students) ? course.students.length : undefined) ??
    (Array.isArray(course.enrollments) ? course.enrollments.length : undefined) ??
    0
  );

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 space-y-4 shadow-xs group ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5">
        {/* Main Content: Thumbnail on right in RTL, Info on left */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0 w-full lg:w-auto">
          {/* Thumbnail */}
          <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 bg-slate-50 flex items-center justify-center">
            {!imgError && imgSrc ? (
              <Image
                src={imgSrc}
                alt={displayTitle || "Course"}
                fill
                sizes="128px"
                onError={handleImageError}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100 gap-1 p-1 text-center">
                <ImageIcon className="w-5 h-5 text-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 leading-tight">
                  {isAr ? "بدون غلاف" : "No cover"}
                </span>
              </div>
            )}
          </div>

          {/* Course Information */}
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Title & Status Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-[#0B4F3A] transition-colors line-clamp-1">
                {displayTitle}
              </h3>

              {/* Status Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs shrink-0 ${
                  status === "published"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                    : status === "pending_review"
                    ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                    : status === "rejected"
                    ? "bg-rose-50 text-rose-800 border border-rose-200/80"
                    : status === "archived"
                    ? "bg-zinc-100 text-zinc-600 border border-zinc-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200/80"
                }`}
              >
                {status === "published" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {status === "pending_review" && (
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                )}
                {status === "rejected" && (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                {status === "archived" && (
                  <Archive className="w-3.5 h-3.5 text-zinc-500" />
                )}
                {status === "draft" && (
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>
                  {status === "published"
                    ? isAr
                      ? "منشور"
                      : "Published"
                    : status === "pending_review"
                    ? isAr
                      ? "قيد المراجعة"
                      : "Under Review"
                    : status === "rejected"
                    ? isAr
                      ? "مرفوض"
                      : "Rejected"
                    : status === "archived"
                    ? isAr
                      ? "مؤرشف"
                      : "Archived"
                    : isAr
                    ? "مسودة"
                    : "Draft"}
                </span>
              </span>
            </div>

            {/* Clean Metadata Line: separated by dots without box-in-box clutter */}
            <div className="flex items-center gap-2.5 text-xs text-slate-600 flex-wrap">
              {/* Price */}
              <span className="font-black text-slate-900 text-sm">
                {isFree ? (isAr ? "مجاني" : "Free") : `$${coursePrice.toFixed(2)}`}
              </span>

              <span className="text-slate-300">•</span>

              {/* Enrolled Students */}
              {studentsCount > 0 ? (
                <button
                  type="button"
                  onClick={onToggleExpandStudents}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#0B4F3A] transition-colors cursor-pointer group/btn"
                  title={
                    isAr
                      ? "انقر لعرض قائمة الطلاب المسجلين"
                      : "Click to view enrolled students"
                  }
                >
                  <Users className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#0B4F3A]" />
                  <span>
                    <strong className="font-bold text-slate-900">{studentsCount}</strong>{" "}
                    {isAr ? "طالب مسجل" : "Enrolled Students"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      isExpandedStudents ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>0 {isAr ? "طالب مسجل" : "Enrolled Students"}</span>
                </span>
              )}

              {/* Category if available */}
              {displayCategory && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">{displayCategory}</span>
                </>
              )}

              {/* Rating if available */}
              {status === "published" &&
                Number(course.reviewsCount || 0) > 0 &&
                Number(course.rating || 0) > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(course.rating).toFixed(1)}</span>
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Clean, Accessible, Prominent CTA */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0 flex-nowrap">
          {status === "pending_review" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold select-none shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>
                {isAr ? "بانتظار مراجعة الإدارة" : "Waiting for Admin Review"}
              </span>
            </div>
          )}

          {(status === "draft" || status === "rejected") && onSubmitReview && (
            <button
              type="button"
              disabled={isSubmittingReview}
              onClick={() => onSubmitReview(course.id)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              {isSubmittingReview ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              <span>
                {isSubmittingReview
                  ? isAr
                    ? "جاري الإرسال..."
                    : "Submitting..."
                  : isAr
                  ? "إرسال للمراجعة"
                  : "Submit Review"}
              </span>
            </button>
          )}

          {/* Secondary Button: Live Preview */}
          <Link
            href={`/${currentLocale}/courses/${course.slug || course.id}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Eye size={13} />
            <span>{isAr ? "معاينة" : "Preview"}</span>
          </Link>

          {/* Primary CTA: Edit Course */}
          <Link
            href={`/${currentLocale}/instructor/courses/create?id=${course.id}`}
            className="px-3.5 py-2 rounded-xl bg-[#0B4F3A] hover:bg-[#08382E] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
          >
            <Edit size={13} />
            <span>{isAr ? "تعديل الدورة" : "Edit Course"}</span>
          </Link>

          {onOpenArchiveModal && (
            <button
              type="button"
              onClick={() => onOpenArchiveModal(course.id)}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                status === "archived"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200/80"
              }`}
              title={
                status === "archived"
                  ? isAr
                    ? "إلغاء أرشفة الدورة"
                    : "Unarchive Course"
                  : isAr
                  ? "أرشفة الدورة"
                  : "Archive Course"
              }
            >
              <Archive size={14} />
            </button>
          )}

          {onOpenDeleteModal && (
            <button
              type="button"
              onClick={() =>
                onOpenDeleteModal({ id: course.id, title: displayTitle })
              }
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              title={isAr ? "حذف الدورة" : "Delete Course"}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};

export default InstructorRowCourseCard;
