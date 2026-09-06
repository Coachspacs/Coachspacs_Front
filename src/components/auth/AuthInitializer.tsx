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
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const hasToken = tokenManager.hasSession();
    const token = tokenManager.getAccessToken();

    // If no session exists or already initialized with current token, do nothing
    if (!hasToken || !token || initializedTokenRef.current === token || isFetchingRef.current) {
      return;
    }

    // Immediately restore cached local user from localStorage post-hydration if Redux user is not yet set
    let localCachedUser = null;
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (stored) localCachedUser = JSON.parse(stored);
    } catch {}

    if (localCachedUser && !isAuthenticated) {
      dispatch(setCredentials({ user: localCachedUser, token }));
    }

    const currentUser = userRef.current;
    // Only run API profile sync if user data is missing or incomplete
    const isUserDataMissing =
      !currentUser ||
      !currentUser.email ||
      currentUser.name === "User" ||
      currentUser.fullName === "User" ||
      !currentUser.fullName;

    if (isUserDataMissing || !isAuthenticated) {
      isFetchingRef.current = true;
      initializedTokenRef.current = token;

      userService
        .getMyProfile()
        .then((profileRes) => {
          const profData = (profileRes as any)?.user || profileRes;
          if (profData && (profData.email || profData.full_name || profData.fullName)) {
            const activeUser = userRef.current;
            const fullName =
              profData.full_name ||
              profData.fullName ||
              profData.name ||
              (profData.email ? profData.email.split("@")[0] : "User");
            const role = (profData.role || activeUser?.role || "student").toLowerCase();
            const approvalStatus = (
              profData.approval_status ||
              profData.approvalStatus ||
              activeUser?.approval_status ||
              "approved"
            ).toLowerCase();

            const normalized = {
              id: String(profData.id || activeUser?.id || "1"),
              email: profData.email || activeUser?.email || "",
              fullName,
              name: fullName,
              role,
              approvalStatus,
              approval_status: approvalStatus,
              phone: profData.phone_number || profData.phone || activeUser?.phone || "",
              phoneNumber: profData.phone_number || profData.phone || activeUser?.phone || "",
              avatar: profData.avatar || activeUser?.avatar || null,
              preferredLanguage: profData.preferred_language || activeUser?.preferredLanguage || "en",
              preferred_language: profData.preferred_language || activeUser?.preferredLanguage || "en",
              headline: profData.headline || activeUser?.headline || (role === "instructor" ? "Instructor" : "Student"),
              bio: profData.bio || activeUser?.bio || "",
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
