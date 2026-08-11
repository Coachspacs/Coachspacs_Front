"use client";

import React, { useState } from "react";
import { StudentWorkspace } from "@/components/workspace/StudentWorkspace";
import { InstructorWorkspace } from "@/components/workspace/InstructorWorkspace";

interface ProfileSettingsViewProps {
  initialRole?: "student" | "instructor";
}

export function ProfileSettingsView({ initialRole = "student" }: ProfileSettingsViewProps) {
  const [activeRole, setActiveRole] = useState<"student" | "instructor">(initialRole);

  if (activeRole === "instructor") {
    return <InstructorWorkspace onRoleSwitch={(role) => setActiveRole(role)} />;
  }

  return <StudentWorkspace onRoleSwitch={(role) => setActiveRole(role)} />;
}
