"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckCircle2,
  XCircle,
  Mail,
  Loader2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authService, getApiErrorMessage } from "@/services/auth";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";

  const [verifying, setVerifying] = useState<boolean>(Boolean(uid && token));
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState<string>(emailParam);
  const [resending, setResending] = useState<boolean>(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);
  const [resendErrorMessage, setResendErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !token) return;

    let isMounted = true;
    setVerifying(true);
    setVerifyError(null);

    authService
      .verifyEmail({ uid, token })
      .then((res) => {
        if (!isMounted) return;
        setVerifiedSuccess(true);
        setVerifying(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = getApiErrorMessage(err, t("verifyFailed") || "Email verification failed or link is expired.");
        setVerifyError(msg);
        setVerifiedSuccess(false);
        setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [uid, token, t]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.trim()) {
      setResendErrorMessage(t("emailRequired") || "Please enter a valid email address.");
      return;
    }

    setResending(true);
    setResendSuccessMessage(null);
    setResendErrorMessage(null);

    try {
      const res = await authService.resendVerificationEmail({ email: emailInput.trim() });
      setResendSuccessMessage(
        res.message || t("resendSuccessMessage") || "Verification email has been sent successfully. Please check your inbox."
      );
    } catch (err: any) {
      const msg = getApiErrorMessage(err, t("resendFailed") || "Failed to resend verification email.");
      setResendErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[480px] rounded-xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/90 font-sans"
    >
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex items-center justify-center">
          <Logo showText={false} compact={false} />
        </div>
      </div>

      {/* STATE 1: Automatic Verification In Progress */}
      {verifying && (
        <div className="flex flex-col items-center text-center py-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#0F5244]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            {t("verifyingTitle") || "Verifying Your Email..."}
          </h1>
          <p className="text-sm text-slate-500 max-w-sm">
            {t("verifyingSubtitle") || "Please wait while we confirm your email address with CoachSpace."}
          </p>
        </div>
      )}

      {/* STATE 2: Verification Succeeded */}
      {!verifying && verifiedSuccess && (
        <div className="flex flex-col items-center text-center py-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            {t("emailVerifiedTitle") || "Email Verified Successfully!"}
          </h1>
          <p className="text-sm text-slate-600 mb-6 max-w-sm leading-relaxed">
            {t("emailVerifiedSubtitle") || "Your account is now fully verified. You can log in and start using CoachSpace."}
          </p>
          <Link
            href={`/${locale}/login`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0F5244] hover:bg-[#083A30] px-6 text-sm font-extrabold text-white shadow-md transition-all cursor-pointer"
          >
            <span>{t("login") || "Sign In"}</span>
            <ArrowRight
              size={16}
              className={`transition-transform ${isAr ? "rotate-180" : ""}`}
            />
          </Link>
        </div>
      )}

      {/* STATE 3: Verification Failed */}
      {!verifying && !verifiedSuccess && uid && token && (
        <div className="flex flex-col items-center text-center py-2">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle size={36} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            {t("verificationFailedTitle") || "Verification Failed"}
          </h1>
          <p className="text-sm text-red-600 font-medium mb-4 max-w-sm">
            {verifyError}
          </p>
          <p className="text-xs text-slate-500 mb-6 max-w-sm">
            {t("verificationFailedDesc") || "The link may be invalid or expired. You can request a new verification link below."}
          </p>

          <form onSubmit={handleResend} className="w-full space-y-3">
            {resendSuccessMessage && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{resendSuccessMessage}</span>
              </div>
            )}
            {resendErrorMessage && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{resendErrorMessage}</span>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={t("emailPlaceholder") || "Enter your email address"}
                className="w-full h-11 rounded-md border border-slate-300 px-3 pl-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20"
                required
              />
              <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>

            <button
              type="submit"
              disabled={resending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0F5244] hover:bg-[#083A30] px-4 text-xs sm:text-sm font-extrabold text-white shadow transition-all disabled:opacity-70 cursor-pointer"
            >
              {resending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <RefreshCw size={15} />
                  <span>{t("resendVerificationEmail") || "Resend Verification Link"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STATE 4: Pending Inbox Verification (Accessed without uid/token query params) */}
      {!verifying && !verifiedSuccess && (!uid || !token) && (
        <div className="flex flex-col items-center text-center py-2">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200 shadow-xs">
            <CheckCircle2 size={36} className="text-[#0F5244]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 flex items-center justify-center gap-2">
            <span>{isAr ? "تم إنشاء الحساب بنجاح!" : "Account Created Successfully!"}</span>
            <CheckCircle2 size={22} className="text-[#0F5244] shrink-0" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed max-w-sm font-medium">
            {isAr
              ? `تم تسجيل بياناتك (${emailInput}) بنجاح على منصة كوتش سبيس. يمكنك الآن تسجيل الدخول مباشرة والبدء لاستخدام حسابك.`
              : `Your account (${emailInput}) has been successfully registered on Coach Space. You can now log in directly and start using the platform.`}
          </p>

          <Link
            href={`/${locale}/login`}
            className="mb-6 flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0F5244] hover:bg-[#083A30] px-6 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all cursor-pointer"
          >
            <span>{isAr ? "الانتقال لتسجيل الدخول" : "Proceed to Sign In"}</span>
            <ArrowRight size={16} className={isAr ? "rotate-180" : ""} />
          </Link>

          <form onSubmit={handleResend} className="w-full space-y-3 pt-2 border-t border-slate-100">
            {resendSuccessMessage && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{resendSuccessMessage}</span>
              </div>
            )}
            {resendErrorMessage && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{resendErrorMessage}</span>
              </div>
            )}

            <div className="text-left dir-ltr">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("email") || "Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 rounded-md border border-slate-300 px-3 pl-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20"
                  required
                />
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={resending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0F5244] hover:bg-[#083A30] px-4 text-xs sm:text-sm font-extrabold text-white shadow transition-all disabled:opacity-70 cursor-pointer"
            >
              {resending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <RefreshCw size={15} />
                  <span>{t("resendVerificationEmail") || "Resend Verification Link"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Security badge & back to login */}
      <div className="mt-6 border-t border-slate-200/80 pt-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-2">
          <ShieldCheck size={13} className="text-[#0F5244]" />
          <span>{t("encryptedConnection") || "Secure 256-bit SSL Encryption"}</span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          <Link
            href={`/${locale}/login`}
            className="font-bold text-[#0F5244] transition-colors hover:underline"
          >
            {t("backToSignIn") || "Back to Sign In"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F5244]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
