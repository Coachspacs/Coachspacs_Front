"use client";

import React, { use } from "react";
import { MOCK_COURSES } from "@/lib/mockCatalogData";
import { CourseDetailsView } from "@/components/course/CourseDetailsView";

interface CoursePageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default function CourseDetailsPage({ params }: CoursePageProps) {
  const { slug } = use(params);

  // Find course matching slug or ID, or fallback to first course
  const course = MOCK_COURSES.find((c) => c.id === slug || c.id === `course-${slug}`) || MOCK_COURSES[0];

  return <CourseDetailsView course={course} />;
}
