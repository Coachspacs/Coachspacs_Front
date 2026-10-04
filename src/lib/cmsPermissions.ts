import { SectionRolePermission, TargetAudienceView } from "@/types/cms";

export function isSectionAllowedForUser(
  sectionConfig?: {
    is_visible?: boolean;
    allowed_roles?: SectionRolePermission[];
    hidden_in_views?: TargetAudienceView[];
  },
  userRole?: string | null,
  isAuthenticated = false,
  activeView?: TargetAudienceView
): boolean {
  if (!sectionConfig) return true;
  if (sectionConfig.is_visible === false) return false;

  const normalizedRole = (userRole || "").toLowerCase();

  // If activeView is explicitly provided (e.g. In Preview or Dashboard mode)
  if (activeView) {
    if (
      Array.isArray(sectionConfig.hidden_in_views) &&
      sectionConfig.hidden_in_views.includes(activeView)
    ) {
      return false;
    }
  } else {
    // Infer audience view based on current authentication and role
    const inferredView: TargetAudienceView = !isAuthenticated
      ? "guest"
      : normalizedRole === "instructor" || normalizedRole === "coach"
      ? "instructor"
      : "student";

    if (
      Array.isArray(sectionConfig.hidden_in_views) &&
      sectionConfig.hidden_in_views.includes(inferredView)
    ) {
      return false;
    }
  }

  const roles = sectionConfig.allowed_roles;
  if (!roles || roles.length === 0 || roles.includes("all")) {
    return true;
  }

  for (const role of roles) {
    if (role === "guest" && !isAuthenticated) return true;
    if (role === "authenticated" && isAuthenticated) return true;
    if (
      role === "student" &&
      isAuthenticated &&
      (normalizedRole === "student" || normalizedRole === "" || normalizedRole === "learner")
    ) {
      return true;
    }
    if (
      role === "instructor" &&
      isAuthenticated &&
      (normalizedRole === "instructor" || normalizedRole === "coach")
    ) {
      return true;
    }
    if (
      role === "admin" &&
      isAuthenticated &&
      (normalizedRole === "admin" || normalizedRole === "superadmin")
    ) {
      return true;
    }
  }

  return false;
}
