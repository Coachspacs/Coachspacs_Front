import React from "react";
import { InstructorSettingsView } from "@/components/instructor/InstructorSettingsView";

export const metadata = {
  title: "Instructor Profile | CoachSpace",
  description: "Manage your instructor profile, employment history, certifications, payout settings, and workspace.",
};

export default function InstructorProfilePage() {
  return <InstructorSettingsView />;
}
