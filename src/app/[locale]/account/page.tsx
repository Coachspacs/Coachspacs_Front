"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export default function AccountRedirectPage() {
  const router = useRouter();
  const locale = useLocale() || "en";
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const query = tab ? `?tab=${tab}` : "";
    const roleLower = (user?.role || "").toLowerCase();
    
    if (roleLower === "instructor") {
      router.replace(`/${locale}/instructor/settings${query}`);
    } else {
      router.replace(`/${locale}/student/settings${query}`);
    }
  }, [user, locale, router, tab]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFCFB]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-[#0F5244] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to settings...</p>
      </div>
    </div>
  );
}
