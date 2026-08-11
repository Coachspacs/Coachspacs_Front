import React from "react";
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView";

export const metadata = {
  title: "Profile Settings | CoachSpace",
  description: "Manage your profile details, password, security settings and preferences.",
};

export default function ProfilePage() {
  return <ProfileSettingsView />;
}
