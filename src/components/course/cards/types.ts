import React from "react";
import { Course, EnrolledCourse } from "@/types/course";

export type CourseCardVariant =
  | "catalog"
  | "compact"
  | "student"
  | "instructor-preview"
  | "instructor-row";

export interface UnifiedCourseCardProps {
  course: Course | EnrolledCourse | any;
  variant?: CourseCardVariant;
  isAr?: boolean;
  className?: string;

  // Dynamic pricing & enrollment state props
  isFree?: boolean;
  isEnrolled?: boolean;
  price?: number;
  onEnrollFree?: (courseId: string | number) => void;

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

export type CourseCardProps = UnifiedCourseCardProps;

