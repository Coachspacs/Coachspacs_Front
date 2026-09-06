"use client";

import React from "react";
import { InstructorWorkspace } from "@/components/instructor/InstructorWorkspace";

/**
 * Unified Instructor Dashboard View
 * Delegates to InstructorWorkspace with overview tab active, ensuring 100% feature and design parity.
 */
export function InstructorDashboardView() {
  return <InstructorWorkspace initialTab="overview" />;
}

export default InstructorDashboardView;
