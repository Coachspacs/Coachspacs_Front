"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useTranslations } from "next-intl";
import { ShieldAlert, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("cms");

  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 space-y-4">
        <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
        <p className="text-sm font-bold text-slate-600">
          {t("verifyingAccess") || "Verifying administrative access..."}
        </p>
      </div>
    );
  }

  const role = (user?.role || "").toLowerCase();
  const isSuperuser = Boolean(
    isAuthenticated && (
      user?.is_superuser === true ||
      (user as any)?.isSuperuser === true ||
      role === "admin" ||
      role === "superuser"
    )
  );

  if (!isSuperuser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {t("accessDenied") || "Access Restricted"}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t("accessDeniedDesc") || "Administrative privileges (Superuser) are required to access this area."}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-dark hover:bg-[#07382E] text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-brand-dark/30"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t("backToPlatform") || "Back to Platform"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
