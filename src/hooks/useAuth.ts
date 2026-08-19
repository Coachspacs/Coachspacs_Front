import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    isStudent: user?.role === "student",
    isInstructor: user?.role === "instructor",
    isAdmin: user?.role === "admin",
  };
}
