"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

import { tokenManager } from "@/lib/tokenManager";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const locale = useLocale() || "en";
  const pathname = usePathname() || "";
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const hasToken = tokenManager.hasSession();
    const localUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let localUser = null;
    try {
      if (localUserStr) localUser = JSON.parse(localUserStr);
    } catch {}

    const isUserLoggedIn = isAuthenticated || Boolean(hasToken && (user || localUser));
    const activeUser = user || localUser;

    if (!isUserLoggedIn || !activeUser) {
      router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const roleLower = (activeUser.role || "").toLowerCase();

    if (roleLower === "instructor" || roleLower === "coach") {
      router.replace(`/${locale}/instructor/settings`);
    } else {
      router.replace(`/${locale}/student/profile`);
    }
  }, [user, isAuthenticated, locale, router, pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFCFB]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-[#0F5244] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to profile...</p>
      </div>
    </div>
  );
}
