import React from "react";
import { StudentSettingsView } from "@/components/profile/StudentSettingsView";

export const metadata = {
  title: "Student Settings | CoachSpace",
  description: "Manage your student profile, learning preferences and certificate details.",
};

export default function StudentSettingsPage() {
  return <StudentSettingsView />;
}
