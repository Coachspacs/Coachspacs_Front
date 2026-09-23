import { SectionRolePermission } from "@/types/cms";

export function isSectionAllowedForUser(
  sectionConfig?: { is_visible?: boolean; allowed_roles?: SectionRolePermission[] },
  userRole?: string | null,
  isAuthenticated = false
): boolean {
  if (!sectionConfig) return true;
  if (sectionConfig.is_visible === false) return false;

  const roles = sectionConfig.allowed_roles;
  if (!roles || roles.length === 0 || roles.includes("all")) {
    return true;
  }

  const normalizedRole = (userRole || "").toLowerCase();

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
