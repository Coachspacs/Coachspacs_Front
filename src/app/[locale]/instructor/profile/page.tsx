import React from "react";
import { InstructorWorkspace } from "@/components/instructor/InstructorWorkspace";

export const metadata = {
  title: "Instructor Profile | CoachSpace",
  description: "Manage your instructor profile, courses, students, payout settings, and workspace.",
};

export default function InstructorProfilePage() {
  return <InstructorWorkspace />;
}
