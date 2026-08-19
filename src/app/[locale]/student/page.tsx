import React from "react";
import { StudentWorkspace } from "@/components/student/StudentWorkspace";

export const metadata = {
  title: "Student Portal | CoachSpace",
  description: "Welcome to your student portal and learning dashboard.",
};

export default function StudentPage() {
  return <StudentWorkspace initialTab="overview" />;
}
