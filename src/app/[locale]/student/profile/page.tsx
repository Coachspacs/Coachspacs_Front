import React from "react";
import { StudentWorkspace } from "@/components/student/StudentWorkspace";

export const metadata = {
  title: "Student Profile | CoachSpace",
  description: "Manage your student profile, enrolled courses, certificates, and settings.",
};

export default function StudentProfilePage() {
  return <StudentWorkspace />;
}
