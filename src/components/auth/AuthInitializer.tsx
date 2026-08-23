"use client";

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { tokenManager } from "@/lib/tokenManager";
import { setCredentials } from "@/features/auth/slice";
import { userService } from "@/services/userService";

export function AuthInitializer() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const initializedTokenRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const hasToken = tokenManager.hasSession();
    const token = tokenManager.getAccessToken();

    // If no session exists or already initialized with current token, do nothing
    if (!hasToken || !token || initializedTokenRef.current === token || isFetchingRef.current) {
      return;
    }

    // Only run if user data is missing or not yet in memory
    const isUserDataMissing =
      !user ||
      !user.email ||
      user.name === "User" ||
      user.fullName === "User" ||
      !user.fullName;

    if (isUserDataMissing || !isAuthenticated) {
      isFetchingRef.current = true;
      initializedTokenRef.current = token;

      userService
        .getMyProfile()
        .then((profileRes) => {
          const profData = (profileRes as any)?.user || profileRes;
          if (profData && (profData.email || profData.full_name || profData.fullName)) {
            const fullName =
              profData.full_name ||
              profData.fullName ||
              profData.name ||
              (profData.email ? profData.email.split("@")[0] : "User");
            const role = (profData.role || user?.role || "student").toLowerCase();
            const approvalStatus = (
              profData.approval_status ||
              profData.approvalStatus ||
              user?.approval_status ||
              "approved"
            ).toLowerCase();

            const normalized = {
              id: String(profData.id || user?.id || "1"),
              email: profData.email || user?.email || "",
              fullName,
              name: fullName,
              role,
              approvalStatus,
              approval_status: approvalStatus,
              phone: profData.phone_number || profData.phone || user?.phone || "",
              phoneNumber: profData.phone_number || profData.phone || user?.phone || "",
              avatar: profData.avatar || user?.avatar || null,
              preferredLanguage: profData.preferred_language || user?.preferredLanguage || "en",
              preferred_language: profData.preferred_language || user?.preferredLanguage || "en",
              headline: profData.headline || user?.headline || (role === "instructor" ? "Instructor" : "Student"),
              bio: profData.bio || user?.bio || "",
            };

            dispatch(setCredentials({ user: normalized as any, token }));
          }
        })
        .catch((err) => {
          console.warn("[AuthInitializer] Automatic profile sync info:", err?.message);
        })
        .finally(() => {
          isFetchingRef.current = false;
        });
    }
  }, [isAuthenticated, dispatch]);

  return null;
}
