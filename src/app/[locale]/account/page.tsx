import React from "react";
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView";

export const metadata = {
  title: "Account & Profile Settings | CoachSpace",
  description: "Manage your account details, password, security settings and preferences.",
};

export default function AccountPage() {
  return <ProfileSettingsView />;
}
