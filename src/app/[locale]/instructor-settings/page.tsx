import React from "react";
import { InstructorSettingsView } from "@/components/profile/InstructorSettingsView";

export const metadata = {
  title: "Instructor Settings | CoachSpace",
  description: "Manage your coaching profile, payout methods, and portfolio.",
};

export default function InstructorSettingsPage() {
  return <InstructorSettingsView />;
}
