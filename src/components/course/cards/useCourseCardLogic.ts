"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { addToCart, openCartDrawer } from "@/features/cart/cartSlice";
import { cartService } from "@/services/cartService";
import { enrollmentService } from "@/services/enrollmentService";
import { normalizeInstructorSlug } from "@/lib/instructorProfile";
import { UnifiedCourseCardProps } from "./types";

export function getSafeImage(course: any): string {
  const defaultCover = "/images/courses/course-react.png";
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

export function useCourseCardLogic({
  course,
  isAr: isArProp,
  isFree: isFreeProp,
  isEnrolled: isEnrolledProp,
  price: priceProp,
  onEnrollFree,
}: UnifiedCourseCardProps) {
  const currentLocale = useLocale() || "en";
  const isAr = isArProp !== undefined ? isArProp : currentLocale === "ar";
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const isInCart = cartItems.some(
    (item: any) =>
      String(item.course?.id || item.courseId || item.id) === String(course.id)
  );

  const isInstructor = Boolean(
    isAuthenticated &&
      ((user?.role || "").toLowerCase() === "instructor" ||
        (user?.role || "").toLowerCase() === "coach")
  );

  const courseInstructorId =
    course.instructorId ||
    (typeof course.instructor === "object" ? course.instructor?.id : undefined) ||
    course.instructor_id;

  const isMyOwnCourse = Boolean(
    isInstructor &&
      user?.id &&
      courseInstructorId &&
      String(courseInstructorId) === String(user.id)
  );

  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(getSafeImage(course));
  const [imgError, setImgError] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolledState, setEnrolledState] = useState<boolean>(
    Boolean(isEnrolledProp || course?.isEnrolled || course?.is_enrolled || course?.enrolled)
  );

  const handleImageError = () => {
    if (imgSrc !== "/images/courses/course-react.png" && !imgError) {
      setImgSrc("/images/courses/course-react.png");
    } else {
      setImgError(true);
    }
  };

  useEffect(() => {
    setImgSrc(getSafeImage(course));
    setImgError(false);
  }, [course]);

  useEffect(() => {
    if (isEnrolledProp !== undefined) {
      setEnrolledState(isEnrolledProp);
      return;
    }
    if (course?.isEnrolled || course?.is_enrolled || course?.enrolled) {
      setEnrolledState(true);
      return;
    }
    if (typeof window !== "undefined" && course?.id) {
      try {
        const enrolledCoursesRaw = localStorage.getItem("coachspace_enrolled_courses");
        if (enrolledCoursesRaw) {
          const enrolledList = JSON.parse(enrolledCoursesRaw);
          if (Array.isArray(enrolledList)) {
            const found = enrolledList.some(
              (c: any) =>
                String(c.id || c.courseId || c.course_id || c) === String(course.id) ||
                (course.slug && String(c.slug || c) === String(course.slug))
            );
            if (found) {
              setEnrolledState(true);
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isEnrolledProp, course]);

  const resolvedPrice = priceProp !== undefined ? priceProp : course.price;
  const isFree = isFreeProp !== undefined ? isFreeProp : Boolean(
    course.priceFormatted === "Free" ||
      course.priceFormatted === "مجاني" ||
      resolvedPrice === 0 ||
      course.is_free ||
      course.isFree
  );

  const coursePath = enrolledState
    ? `/${currentLocale}/student/learn/${course.id}`
    : `/${currentLocale}/courses/${course.slug || course.id}`;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInstructor) {
      setInstructorModalOpen(true);
      return;
    }

    if (isInCart) {
      dispatch(openCartDrawer());
    } else {
      dispatch(addToCart(course));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("coachspace:cart-bounce"));
      }
      if (isAuthenticated && course?.id) {
        cartService.addToCart(course.id).catch(() => {});
      }
    }
  };

  const handleFreeEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInstructor) {
      setInstructorModalOpen(true);
      return;
    }

    if (enrolledState) {
      router.push(`/${currentLocale}/student/learn/${course.id}`);
      return;
    }

    if (!isAuthenticated) {
      router.push(`/${currentLocale}/courses/${course.slug || course.id}`);
      return;
    }

    try {
      setIsEnrolling(true);
      await enrollmentService.enrollFree(course.id);

      if (typeof window !== "undefined") {
        try {
          const enrolledRaw = localStorage.getItem("coachspace_enrolled_courses");
          const list = enrolledRaw ? JSON.parse(enrolledRaw) : [];
          if (Array.isArray(list)) {
            if (!list.some((item: any) => String(item.id || item) === String(course.id))) {
              list.unshift({
                id: String(course.id),
                enrollmentId: String(course.id),
                title: displayTitle,
                instructor: instructorName,
                image: imgSrc,
                coverImage: imgSrc,
                cover_image: imgSrc,
                thumbnail: imgSrc,
                progress: 0,
                totalLessons: course.totalLessons || 10,
                completedLessons: 0,
                isCompleted: false,
                isEnrolled: true,
                enrolledAt: new Date().toISOString(),
                slug: course.slug,
              });
              localStorage.setItem("coachspace_enrolled_courses", JSON.stringify(list));
            }
          }
        } catch {
          // ignore
        }
        window.dispatchEvent(new CustomEvent("coachspace:enrolled-updated"));
      }

      setEnrolledState(true);
      onEnrollFree?.(course.id);
      router.push(`/${currentLocale}/student/learn/${course.id}`);
    } catch (err) {
      console.error("Failed to enroll in free course:", err);
      router.push(`/${currentLocale}/courses/${course.slug || course.id}`);
    } finally {
      setIsEnrolling(false);
    }
  };

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

  return {
    currentLocale,
    isAr,
    router,
    isInCart,
    isInstructor,
    isMyOwnCourse,
    instructorModalOpen,
    setInstructorModalOpen,
    imgSrc,
    imgError,
    isEnrolling,
    enrolledState,
    resolvedPrice,
    isFree,
    coursePath,
    displayTitle,
    displayCategory,
    instructorName,
    instructorTarget,
    handleImageError,
    handleCartClick,
    handleFreeEnroll,
  };
}
