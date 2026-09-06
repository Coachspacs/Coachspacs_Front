"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { userService } from "@/services/userService";
import { getApiErrorMessage } from "@/services/auth";

function ConfirmEmailContent() {
  const t = useTranslations("confirmEmail");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const searchParams = useSearchParams();

  const uid =
    searchParams.get("uid") ||
    searchParams.get("uidb64") ||
    searchParams.get("id") ||
    searchParams.get("user_id") ||
    "";
  const token =
    searchParams.get("token") ||
    searchParams.get("key") ||
    searchParams.get("code") ||
    "";

  const hasParams = Boolean(uid && token);

  const [confirming, setConfirming] = useState<boolean>(hasParams);
  const [confirmedSuccess, setConfirmedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !token) {
      if (!hasParams) {
        setErrorMessage(t("defaultFailedMsg"));
      }
      return;
    }

    let isMounted = true;
    setConfirming(true);
    setErrorMessage(null);

    userService
      .confirmEmailChange({ uid, token })
      .then(() => {
        if (!isMounted) return;
        setConfirmedSuccess(true);
        setConfirming(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = getApiErrorMessage(
          err,
          t("defaultFailedMsg"),
          isAr
        );
        setErrorMessage(msg);
        setConfirmedSuccess(false);
        setConfirming(false);
      });

    return () => {
      isMounted = false;
    };
  }, [uid, token, isAr, hasParams, t]);

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F0FDF4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#6CF8BB]/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-2xl shadow-emerald-950/5 rounded-3xl border border-slate-200/80 text-center space-y-6">
          
          {/* STATE 1: Confirming / Loading */}
          {confirming && (
            <div className="space-y-6 py-8">
              <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-[#0F5244]">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t("confirmingTitle")}
                </h2>
                <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                  {t("confirmingSubtitle")}
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: Confirmation Success */}
          {!confirming && confirmedSuccess && (
            <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 text-[#0F5244] flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t("successTitle")}
                </h2>
                <p className="text-sm font-medium text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {t("successSubtitle")}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/${locale}/login`}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 inline-flex items-center justify-center gap-2"
                >
                  <span>{t("login")}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
                <Link
                  href={`/${locale}/profile`}
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-extrabold transition-all active:scale-98 inline-flex items-center justify-center gap-2"
                >
                  <span>{t("goToProfile")}</span>
                </Link>
              </div>
            </div>
          )}

          {/* STATE 3: Confirmation Failed */}
          {!confirming && !confirmedSuccess && (
            <div className="space-y-6 py-4 animate-in fade-in duration-200">
              <div className="mx-auto w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 text-red-600 flex items-center justify-center shadow-md">
                <XCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t("failedTitle")}
                </h2>
                <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-2xl max-w-sm mx-auto leading-relaxed">
                  {errorMessage || t("defaultFailedMsg")}
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href={`/${locale}/account`}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 inline-flex items-center justify-center gap-2"
                >
                  <span>{t("backToSettings")}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0F5244] animate-spin" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
