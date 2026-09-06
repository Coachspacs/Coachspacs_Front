"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  Star,
  Clock,
  User,
  ShoppingCart,
  Check,
  Play,
  Users,
  Eye,
  Edit,
  Send,
  Archive,
  Trash2,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Award,
} from "lucide-react";
import { Course } from "@/types/catalog";
import { normalizeInstructorSlug } from "@/lib/instructorProfile";
import { RootState } from "@/lib/store";
import { addToCart } from "@/features/cart/cartSlice";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export type CourseCardVariant =
  | "catalog"
  | "compact"
  | "student"
  | "instructor-preview"
  | "instructor-row";

export interface UnifiedCourseCardProps {
  course: any;
  variant?: CourseCardVariant;
  isAr?: boolean;
  className?: string;

  // Student variant specific props
  onContinueLearning?: () => void;
  onViewCertificate?: () => void;

  // Instructor row specific props
  isExpandedStudents?: boolean;
  onToggleExpandStudents?: () => void;
  onSubmitReview?: (id: string) => void;
  isSubmittingReview?: boolean;
  onOpenArchiveModal?: (id: string) => void;
  onOpenDeleteModal?: (course: { id: string; title: string }) => void;
  children?: React.ReactNode;
}

/**
 * Helper to safely resolve course cover image
 */
function getSafeImage(course: any): string {
  const defaultCover =
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80";
  if (!course) return defaultCover;

  const candidates = [
    course.coverImage,
    course.image,
    course.cover_image,
    course.thumbnail,
  ];

  for (const c of candidates) {
    if (
      typeof c === "string" &&
      c.trim().length > 0 &&
      !c.includes("example.com")
    ) {
      return c.trim();
    }
    if (
      c &&
      typeof c === "object" &&
      typeof c.src === "string" &&
      c.src.trim().length > 0 &&
      !c.src.includes("example.com")
    ) {
      return c.src.trim();
    }
  }

  return defaultCover;
}

export function CourseCard({
  course,
  variant = "catalog",
  isAr: isArProp,
  className = "",
  onContinueLearning,
  onViewCertificate,
  isExpandedStudents = false,
  onToggleExpandStudents,
  onSubmitReview,
  isSubmittingReview = false,
  onOpenArchiveModal,
  onOpenDeleteModal,
  children,
}: UnifiedCourseCardProps) {
  const currentLocale = useLocale() || "en";
  const isAr = isArProp !== undefined ? isArProp : currentLocale === "ar";
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const isInCart = cartItems.some(
    (item: any) =>
      String(item.course?.id || item.courseId || item.id) === String(course.id)
  );

  const [imgSrc, setImgSrc] = useState<string>(getSafeImage(course));
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgSrc(getSafeImage(course));
    setImgError(false);
  }, [course]);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      router.push(`/${currentLocale}/student/cart`);
    } else {
      dispatch(addToCart(course));
    }
  };

  const coursePath = `/${currentLocale}/courses/${course.slug || course.id}`;
  const isFree = Boolean(
    course.priceFormatted === "Free" ||
      course.priceFormatted === "مجاني" ||
      course.price === 0 ||
      course.is_free ||
      course.isFree
  );

  const displayTitle = isAr
    ? course.titleAr || course.title_ar || course.title
    : course.titleEn || course.title_en || course.title || course.titleAr;

  const displayCategory = isAr
    ? course.categoryAr || course.category_ar || course.category
    : course.category || course.categoryAr;

  const instructorName =
    typeof course.instructor === "object"
      ? course.instructor?.name || course.instructor?.fullName || course.instructor?.full_name
      : isAr
      ? course.instructorNameAr || course.instructorName || course.instructor
      : course.instructorName || course.instructorNameAr || course.instructor;

  const instructorTarget =
    course.instructorId ||
    (typeof course.instructor === "object" ? course.instructor?.id : undefined) ||
    course.instructor_id ||
    normalizeInstructorSlug(instructorName || "");

  // =========================================================================
  // 1. VARIANT: COMPACT (Used in Carousels / Sliders / Instructor Profile)
  // =========================================================================
  if (variant === "compact") {
    return (
      <Link href={coursePath} className={`block group h-full select-none ${className}`}>
        <div className="flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#0F5244]/30 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer">
          {/* Thumbnail */}
          <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden flex items-center justify-center">
            {!imgError && imgSrc ? (
              <Image
                src={imgSrc}
                alt={displayTitle || "Course"}
                fill
                sizes="(max-width: 768px) 50vw, 240px"
                onError={() => {
                  setImgError(true);
                }}
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
            {course.badge && course.badge !== "New" && (
              <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
                <span className="inline-block px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider bg-[#38BDF8] text-slate-900 shadow-2xs">
                  {course.badge}
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-3.5 justify-between space-y-2.5">
            <div className="space-y-1.5">
              {displayCategory && (
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#0F5244] bg-[#E8F3F1] px-2 py-0.5 rounded-md truncate max-w-full">
                  {displayCategory}
                </span>
              )}
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0F5244] transition-colors line-clamp-2 leading-snug tracking-tight">
                {displayTitle}
              </h4>
            </div>

            {/* Footer: Price & Cart Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {isFree ? (
                  <span className="text-emerald-600 font-extrabold">
                    {isAr ? "مجاني" : "Free"}
                  </span>
                ) : (
                  course.priceFormatted || `$${Number(course.price || 0).toFixed(2)}`
                )}
              </span>

              {!isFree && (
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
                  className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center text-xs font-extrabold shadow-2xs active:scale-95 shrink-0 ${
                    isInCart
                      ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-600 hover:text-white"
                  }`}
                >
                  {isInCart ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <ShoppingCart className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // =========================================================================
  // 2. VARIANT: STUDENT (Used in Student Workspace / My Courses)
  // =========================================================================
  if (variant === "student") {
    const progress = Math.min(100, Math.max(0, Number(course.progress || 0)));
    const isCompleted = Boolean(course.isCompleted || progress >= 100);
    const learnUrl = `/${currentLocale}/student/learn/${course.id}`;

    return (
      <div
        className={`h-full flex flex-col justify-between rounded-3xl border border-slate-200/80 p-5 hover:shadow-md hover:border-[#0F5244]/30 transition-all bg-white group ${className}`}
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
                onError={() => setImgError(true)}
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
              <span className="w-12 h-12 rounded-full bg-white/95 text-[#0F5244] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="h-5 w-5 fill-current ml-0.5" />
              </span>
            </div>

            <span
              className={`absolute top-3 right-3 rtl:right-auto rtl:left-3 px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-xs ${
                isCompleted ? "bg-emerald-600" : "bg-slate-900/80 backdrop-blur-xs"
              }`}
            >
              {isCompleted ? (isAr ? "مكتمل 100%" : "Completed 100%") : `${progress}%`}
            </span>
          </Link>

          {/* Details */}
          <div className="space-y-1.5 min-h-[3.25rem] flex flex-col justify-start">
            <Link
              href={learnUrl}
              className="text-base font-extrabold text-slate-900 line-clamp-2 leading-snug hover:text-[#0F5244] transition-colors"
              title={displayTitle}
            >
              {displayTitle}
            </Link>

            {instructorName && (
              <Link
                href={`/${currentLocale}/instructors/${instructorTarget}`}
                className="text-xs text-slate-500 hover:text-[#0F5244] hover:underline font-medium w-fit transition-colors inline-flex items-center gap-1"
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
                    ? "text-emerald-700 font-black"
                    : "text-[#0F5244] font-black"
                }
              >
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? "bg-emerald-500" : "bg-[#0F5244]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={learnUrl}
              onClick={onContinueLearning}
              className="flex-1 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
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

            {isCompleted && (
              <Link
                href={`/${currentLocale}/student/certificates`}
                onClick={onViewCertificate}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title={isAr ? "عرض الشهادة" : "View Certificate"}
              >
                <Award className="w-4 h-4 text-emerald-700" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. VARIANT: INSTRUCTOR-PREVIEW (Home Widget / Preview Card)
  // =========================================================================
  if (variant === "instructor-preview") {
    const isDraft = Boolean(course.isDraft || course.status === "draft");

    return (
      <div
        className={`bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#0F5244]/30 transition-all duration-300 flex flex-col justify-between group ${className}`}
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
                onError={() => setImgError(true)}
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
          <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0F5244] transition-colors mb-3">
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
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[#0F5244] bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? "فتح استوديو الكورس" : "Open Course Studio"}</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. VARIANT: INSTRUCTOR-ROW (Instructor Workspace / Dashboard Management)
  // =========================================================================
  if (variant === "instructor-row") {
    const status = course.status || (course.isPublished ? "published" : "draft");

    return (
      <div
        className={`p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 space-y-4 shadow-2xs ${className}`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0 w-full lg:w-auto">
            {/* Thumbnail */}
            <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200/90 shadow-2xs bg-slate-100 flex items-center justify-center group">
              {!imgError && imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={displayTitle || "Course"}
                  fill
                  sizes="128px"
                  onError={() => setImgError(true)}
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

            {/* Info */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug hover:text-[#0F5244] transition-colors line-clamp-1">
                  {displayTitle}
                </h3>

                {/* Status Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1.5 shadow-2xs ${
                    status === "published"
                      ? "bg-emerald-100 text-[#0F5244] border border-emerald-200"
                      : status === "pending_review"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : status === "rejected"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
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
                      : isAr
                      ? "مسودة"
                      : "Draft"}
                  </span>
                </span>
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-500 flex-wrap pt-0.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-900 font-black text-xs">
                  ${Number(course.price || 0).toFixed(2)}
                </span>

                <span className="text-slate-300">•</span>

                {/* Enrolled Students Chip */}
                {Number(course.studentsCount || 0) > 0 ? (
                  <button
                    type="button"
                    onClick={onToggleExpandStudents}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold text-xs hover:bg-emerald-100/80 transition-all cursor-pointer shadow-2xs group"
                    title={
                      isAr
                        ? "انقر لعرض قائمة الطلاب المسجلين"
                        : "Click to view enrolled students"
                    }
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="text-emerald-950 font-black">
                        {course.studentsCount}
                      </strong>{" "}
                      {isAr ? "طالب مسجل" : "Enrolled Students"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 ${
                        isExpandedStudents ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>0 {isAr ? "طالب مسجل" : "Enrolled Students"}</span>
                  </span>
                )}

                {status === "published" &&
                  Number(course.reviewsCount || 0) > 0 &&
                  Number(course.rating || 0) > 0 && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-amber-600 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(course.rating).toFixed(1)}</span>
                      </span>
                    </>
                  )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0 flex-nowrap">
            {status === "pending_review" ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-black select-none shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>
                  {isAr ? "بانتظار مراجعة الإدارة" : "Waiting for Admin Review"}
                </span>
              </div>
            ) : (
              <>
                {(status === "draft" || status === "rejected") && onSubmitReview && (
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => onSubmitReview(course.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
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

                {status === "published" && (
                  <Link
                    href={`/${currentLocale}/courses/${course.slug || course.id}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <Eye size={13} />
                    <span>{isAr ? "معاينة حية" : "View Live"}</span>
                  </Link>
                )}

                <Link
                  href={`/${currentLocale}/instructor/courses/create?id=${course.id}`}
                  className="px-3.5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#0b3d32] text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                >
                  <Edit size={13} />
                  <span>{isAr ? "تعديل الكورس" : "Edit Course"}</span>
                </Link>

                {onOpenArchiveModal && (
                  <button
                    type="button"
                    onClick={() => onOpenArchiveModal(course.id)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      status === "archived"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"
                    }`}
                    title={
                      status === "archived"
                        ? isAr
                          ? "إلغاء أرشفة الكورس"
                          : "Unarchive Course"
                        : isAr
                        ? "أرشفة الكورس"
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
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                    title={isAr ? "حذف الكورس" : "Delete Course"}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {children}
      </div>
    );
  }

  // =========================================================================
  // 5. VARIANT: CATALOG (Default - Used in CourseGrid & Home Featured)
  // =========================================================================
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
              onError={() => {
                setImgError(true);
              }}
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

            {/* Price & Add to Cart Capsule Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <div className="flex items-center">
                <span className="text-lg font-black text-slate-900 leading-tight">
                  {isFree ? (
                    <span className="text-emerald-600 font-extrabold">
                      {isAr ? "مجاني" : "Free"}
                    </span>
                  ) : (
                    course.priceFormatted || `$${Number(course.price || 0).toFixed(2)}`
                  )}
                </span>
              </div>

              {!isFree && (
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
  );
}

export default CourseCard;
