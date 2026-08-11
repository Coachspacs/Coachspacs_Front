import React from "react";
import { InstructorDashboardView } from "@/components/dashboard/InstructorDashboardView";

export const metadata = {
  title: "Instructor Dashboard | CoachSpace",
  description: "Track course metrics, manage curriculum, review enrolled students, and manage course lifecycles.",
};

export default function InstructorDashboardPage() {
  return <InstructorDashboardView />;
}
