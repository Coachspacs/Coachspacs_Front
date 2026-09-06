"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CreateCourseStudio } from "@/components/instructor/CreateCourseStudio";

export default function InstructorCourseEditPage() {
  const params = useParams();
  const courseId = params?.courseId as string;

  return <CreateCourseStudio initialId={courseId} />;
}
