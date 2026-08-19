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
  Send,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authService, getApiErrorMessage } from "@/services/auth";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();

  const uid =
    searchParams.get("uid") ||
    searchParams.get("uidb64") ||
    searchParams.get("id") ||
    searchParams.get("user_id") ||
    searchParams.get("userId") ||
    "";
  const token =
    searchParams.get("token") ||
    searchParams.get("key") ||
    searchParams.get("code") ||
    "";
  const emailParam = searchParams.get("email") || "";

  const hasVerificationParams = Boolean(token && (uid || token.length > 10));

  const [verifying, setVerifying] = useState<boolean>(hasVerificationParams);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState<string>(emailParam);
  const [resending, setResending] = useState<boolean>(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);
  const [resendErrorMessage, setResendErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

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
        const msg = getApiErrorMessage(
          err,
          t("verifyFailed") || (isAr ? "فشل التحقق من البريد الإلكتروني أو انتهت صلاحية الرابط." : "Email verification failed or link is expired."),
          isAr
        );
        setVerifyError(msg);
        setVerifiedSuccess(false);
        setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [uid, token, t, isAr]);

  const handleResend = async (manualEmail?: string) => {
    const targetEmail = (manualEmail || emailInput || emailParam).trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setResendErrorMessage(isAr ? "يرجى إدخال بريد إلكتروني صحيح لإعادة الإرسال." : "Please enter a valid email address.");
      return;
    }

    setResending(true);
    setResendSuccessMessage(null);
    setResendErrorMessage(null);

    try {
      const res = await authService.resendVerificationEmail({ email: targetEmail });
      setResendSuccessMessage(
        res.message ||
          (typeof res.detail === "string" ? res.detail : null) ||
          t("resendSuccessMessage") ||
          (isAr ? "تم إرسال رابط تفعيل جديد بنجاح! يرجى مراجعة صندوق الوارد." : "New verification link sent successfully! Check your inbox.")
      );
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        t("resendFailed") || (isAr ? "فشل إعادة إرسال رابط التحقق. يرجى المحاولة لاحقاً." : "Failed to resend verification email."),
        isAr
      );
      setResendErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[420px] rounded-2xl bg-white p-6 sm:p-7 shadow-xl border border-slate-200/90 font-sans"
    >
      {/* Brand Logo */}
      <div className="mb-4 flex flex-col items-center text-center">
        <Logo showText={false} compact={true} />
      </div>

      {/* STATE 1: Automatic Verification In Progress */}
      {verifying && (
        <div className="flex flex-col items-center text-center py-4 animate-in fade-in duration-200">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-100 shadow-xs">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            {t("verifyingTitle") || (isAr ? "جاري التحقق من بريدك..." : "Verifying Your Email...")}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            {t("verifyingSubtitle") || (isAr ? "يرجى الانتظار لحظات لتأكيد حسابك في CoachSpace." : "Please wait a moment while we confirm your account.")}
          </p>
        </div>
      )}

      {/* STATE 2: Verification Succeeded */}
      {!verifying && verifiedSuccess && (
        <div className="flex flex-col items-center text-center py-2 animate-in zoom-in-95 duration-200">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200 shadow-xs">
            <CheckCircle2 size={32} className="text-[#0F5244]" />
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            {t("emailVerifiedTitle") || (isAr ? "تم تأكيد البريد بنجاح!" : "Email Verified Successfully!")}
          </h1>
          <p className="text-xs text-slate-600 mb-5 max-w-xs leading-relaxed font-medium">
            {t("emailVerifiedSubtitle") || (isAr ? "تم تفعيل حسابك بالكامل. يمكنك الآن تسجيل الدخول والبدء." : "Your account is now fully verified. You can log in.")}
          </p>
          <Link
            href={`/${locale}/login`}
            className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F5244] hover:bg-[#083A30] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>{t("login") || (isAr ? "تسجيل الدخول" : "Sign In")}</span>
            <ArrowRight
              size={16}
              className={`transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${isAr ? "rotate-180" : ""}`}
            />
          </Link>
        </div>
      )}

      {/* STATE 3: Verification Failed */}
      {!verifying && !verifiedSuccess && token && (
        <div className="flex flex-col items-center text-center py-2 animate-in fade-in duration-200">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 shadow-xs">
            <XCircle size={32} />
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            {t("verificationFailedTitle") || (isAr ? "فشل تأكيد البريد" : "Verification Failed")}
          </h1>
          <p className="text-xs text-rose-600 font-semibold mb-4 max-w-xs leading-relaxed">
            {verifyError}
          </p>

          {/* Email input for resending if no email is set */}
          {!emailInput && (
            <div className="w-full mb-3 text-start">
              <label htmlFor="resend-email" className="block text-xs font-semibold text-slate-700 mb-1">
                {isAr ? "أدخل بريدك لإعادة إرسال رابط التفعيل:" : "Enter your email to receive a new link:"}
              </label>
              <div className="relative">
                <input
                  id="resend-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 focus:border-[#0F5244]"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={resending}
            onClick={() => handleResend()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F5244] hover:bg-[#083A30] px-4 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all disabled:opacity-70 cursor-pointer active:scale-[0.99]"
          >
            {resending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <RefreshCw size={15} />
                <span>{t("resendVerificationEmail") || (isAr ? "إعادة إرسال رابط التحقق" : "Resend Verification Link")}</span>
              </>
            )}
          </button>

          {resendSuccessMessage && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80 w-full">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{resendSuccessMessage}</span>
            </div>
          )}
          {resendErrorMessage && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200/80 w-full">
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{resendErrorMessage}</span>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 w-full">
            <Link
              href={`/${locale}/login`}
              className="text-xs font-bold text-[#0F5244] hover:underline"
            >
              {isAr ? "العودة لتسجيل الدخول" : "Back to Sign In"}
            </Link>
          </div>
        </div>
      )}

      {/* STATE 4: Pending Inbox Verification (Main Screen after Register or manual navigation) */}
      {!verifying && !verifiedSuccess && !token && (
        <div className="flex flex-col items-center text-center py-1 animate-in fade-in duration-200">
          <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200 shadow-xs">
            <Mail size={30} className="text-[#0F5244]" />
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            {isAr ? "تحقق من بريدك الإلكتروني" : "Check Your Inbox"}
          </h1>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-1">
            {isAr
              ? "لقد أرسلنا رسالة تحتوي على رابط التفعيل إلى بريدك:"
              : "We've sent a verification link to your email:"}
          </p>

          {/* Clean Email Pill or Input */}
          {emailInput ? (
            <div className="my-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold dir-ltr shadow-xs max-w-full truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{emailInput}</span>
            </div>
          ) : (
            <div className="w-full my-2.5 text-start">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 focus:border-[#0F5244]"
              />
            </div>
          )}

          <p className="text-[11px] sm:text-xs text-slate-400 mb-4 max-w-xs leading-relaxed">
            {isAr
              ? "يرجى فتح الرسالة والنقر على الرابط لتفعيل حسابك والبدء فوراً."
              : "Please open the message and click the link to activate your account."}
          </p>

          {/* Primary Action Button */}
          <Link
            href={`/${locale}/login`}
            className="group mb-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F5244] hover:bg-[#083A30] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>{isAr ? "الانتقال لتسجيل الدخول" : "Proceed to Sign In"}</span>
            <ArrowRight
              size={16}
              className={`transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${isAr ? "rotate-180" : ""}`}
            />
          </Link>

          {/* Inline One-Click Resend Link */}
          <div className="w-full pt-3 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <span>{isAr ? "لم تصلك الرسالة؟" : "Didn't receive the email?"}</span>
              <button
                type="button"
                disabled={resending}
                onClick={() => handleResend()}
                className="font-bold text-[#0F5244] hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
              >
                {resending && <Loader2 size={12} className="animate-spin inline" />}
                <span>{isAr ? "إعادة إرسال الرابط" : "Resend Link"}</span>
              </button>
            </div>

            {resendSuccessMessage && (
              <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 p-2 text-xs font-semibold text-emerald-800 border border-emerald-200/70 animate-in fade-in duration-200">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                <span>{resendSuccessMessage}</span>
              </div>
            )}
            {resendErrorMessage && (
              <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 p-2 text-xs font-semibold text-rose-700 border border-rose-200/70 animate-in fade-in duration-200">
                <AlertCircle size={14} className="shrink-0 text-rose-500" />
                <span>{resendErrorMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Security Badge */}
      <div className="mt-4 border-t border-slate-100 pt-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>{t("encryptedConnection") || (isAr ? "بياناتك محمية ومشفرة 100%" : "Secure 256-bit SSL Encryption")}</span>
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
