import React from "react";
import { InstructorLayoutClient } from "@/components/instructor/InstructorLayoutClient";

export const metadata = {
  title: "Instructor Portal | CoachSpace",
  description: "Manage your courses, students, revenue analytics, and instructor account.",
};

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstructorLayoutClient>{children}</InstructorLayoutClient>;
}
