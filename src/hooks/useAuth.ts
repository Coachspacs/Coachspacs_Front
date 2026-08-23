import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const normalizedRole = (user?.role || "").toLowerCase();
  const isInstructor = normalizedRole === "instructor" || normalizedRole === "coach" || normalizedRole === "teacher";
  const isStudent = normalizedRole === "student" || (!isInstructor && Boolean(user));
  const isAdmin = normalizedRole === "admin";

  const approvalStatus = (user?.approval_status || user?.approvalStatus || (isInstructor ? "pending" : "approved")).toLowerCase();
  const isApproved = approvalStatus === "approved" || !isInstructor;
  const isPendingApproval = isInstructor && approvalStatus === "pending";
  const isRejected = isInstructor && approvalStatus === "rejected";

  return {
    user,
    isAuthenticated,
    isLoading,
    role: normalizedRole || "student",
    isStudent,
    isInstructor,
    isAdmin,
    approvalStatus,
    isApproved,
    isPendingApproval,
    isRejected,
  };
}

