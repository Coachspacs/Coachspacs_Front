import React from "react";
import { StudentLayoutClient } from "@/components/student/StudentLayoutClient";

export const metadata = {
  title: "Student Portal | CoachSpace",
  description: "Manage your enrolled courses, certificates, and student profile.",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}

