"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

import { tokenManager } from "@/lib/tokenManager";

export default function AccountRedirectPage() {
  const router = useRouter();
  const locale = useLocale() || "en";
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
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
      router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname + (tab ? `?tab=${tab}` : ""))}`);
      return;
    }

    const query = tab ? `?tab=${tab}` : "";
    const roleLower = (activeUser.role || "").toLowerCase();

    if (roleLower === "instructor" || roleLower === "coach") {
      router.replace(`/${locale}/instructor/settings${query}`);
    } else {
      router.replace(`/${locale}/student/settings${query}`);
    }
  }, [user, isAuthenticated, locale, router, tab, pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFCFB]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-[#0F5244] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to settings...</p>
      </div>
    </div>
  );
}
