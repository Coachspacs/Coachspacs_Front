"use client";

import React from "react";
import { CourseCardProps } from "./cards/types";
import { CompactCourseCard } from "./cards/CompactCourseCard";
import { StudentCourseCard } from "./cards/StudentCourseCard";
import { InstructorPreviewCourseCard } from "./cards/InstructorPreviewCourseCard";
import { InstructorRowCourseCard } from "./cards/InstructorRowCourseCard";
import { CatalogCourseCard } from "./cards/CatalogCourseCard";

export type { CourseCardProps, UnifiedCourseCardProps, CourseCardVariant } from "./cards/types";

export const CourseCard: React.FC<CourseCardProps> = (props) => {
  const { variant = "catalog" } = props;

  switch (variant) {
    case "compact":
      return <CompactCourseCard {...props} />;
    case "student":
      return <StudentCourseCard {...props} />;
    case "instructor-preview":
      return <InstructorPreviewCourseCard {...props} />;
    case "instructor-row":
      return <InstructorRowCourseCard {...props} />;
    case "catalog":
    default:
      return <CatalogCourseCard {...props} />;
  }
};

export default CourseCard;
