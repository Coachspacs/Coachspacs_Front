"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Loader2,
  Mail,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { authService } from "@/lib/api/authService";

/**
 * Props for the ForgotPasswordCard component.
 */
interface ForgotPasswordCardProps {
  /**
   * Active UI language ('AR' for Arabic, 'EN' for English).
   * Defaults to 'EN'.
   */
  lang?: "EN" | "AR";
}

/**
 * ForgotPasswordCard Component
 *
 * Provides a clean, modern form for requesting a password reset link.
 * Built for easy backend integration with `authService.requestPasswordReset`.
 */
export function ForgotPasswordCard({ lang = "EN" }: ForgotPasswordCardProps) {
  const isAr = lang === "AR";

  // ---------------------------------------------------------------------------
  // Component State
  // ---------------------------------------------------------------------------
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ---------------------------------------------------------------------------
  // Validation Logic
  // ---------------------------------------------------------------------------
  const validateEmail = (value: string): string | undefined => {
    if (!value || !value.trim()) {
      return isAr ? "يرجى إدخال البريد الإلكتروني" : "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return isAr ? "صيغة البريد الإلكتروني غير صحيحة" : "Please enter a valid email address";
    }
    return undefined;
  };

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      setEmailError(validateEmail(val));
    }
  };

  const handleBlur = () => {
    setEmailError(validateEmail(email));
  };

  /**
   * Submit handler for password reset request.
   * Integrates with `authService.requestPasswordReset`.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Validate email field before submitting
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setIsSubmitting(true);

    try {
      // BACKEND API CALL: Request password reset link
      const response = await authService.requestPasswordReset(email.trim());

      if (response.success) {
        setIsSubmitted(true);
      } else {
        setFormError(
          response.message ||
            (isAr ? "فشل إرسال رابط التعيين." : "Failed to send password reset link.")
        );
      }
    } catch (err: any) {
      setFormError(
        err.message ||
          (isAr
            ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            : "An unexpected error occurred. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // JSX Render
  // ---------------------------------------------------------------------------
  return (
    <section
      id="forgot-password-card"
      aria-labelledby="forgot-password-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[460px] rounded-2xl bg-white/95 p-6 sm:p-7 shadow-card border border-slate-200/80 backdrop-blur-3xl transition-all duration-300 font-sans"
    >
      {/* Card Header: Icon & Main Title */}
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F5244]/10 text-[#0F5244] border border-[#0F5244]/20 shadow-xs">
          <KeyRound size={22} className="text-[#0F5244]" />
        </div>

        <h1
          id="forgot-password-title"
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug"
        >
          {isAr ? "استعادة كلمة المرور" : "Forgot Password?"}
        </h1>
      </div>

      {/* Conditionally Render: Success Confirmation OR Reset Form */}
      {isSubmitted ? (
        /* SUCCESS CONFIRMATION VIEW */
        <div className="py-2 text-center animate-in fade-in duration-200">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200/80">
            <CheckCircle2 size={26} />
          </div>

          <h3 className="text-base font-extrabold text-slate-900">
            {isAr ? "تم إرسال الرابط بنجاح" : "Reset Link Sent"}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
            {isAr
              ? "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني:"
              : "We've sent reset instructions to:"}
          </p>

          <div className="my-2.5 inline-block rounded-xl bg-[#0F5244]/10 px-4 py-1.5 border border-[#0F5244]/20 text-xs font-bold text-[#0F5244]">
            {email}
          </div>

          <p className="text-[11px] text-slate-400 font-normal">
            {isAr
              ? "يرجى تفقد صندوق الوارد أو الرسائل غير المرغوب فيها (Spam)."
              : "Please check your inbox and spam folder."}
          </p>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5244] hover:underline transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{isAr ? "إعادة الإرسال" : "Resend email"}</span>
            </button>

            <Link
              href="/login"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              {isAr ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              <span>{isAr ? "العودة لتسجيل الدخول" : "Back to Sign In"}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* RESET REQUEST FORM */
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* General API Form Error Message */}
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Email Input Field */}
          <FormField
            id="forgot-email"
            name="email"
            label={isAr ? "البريد الإلكتروني" : "Email Address"}
            type="email"
            placeholder={isAr ? "أدخل بريدك الإلكتروني" : "Enter your email"}
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={emailError}
            icon={<Mail size={16} />}
            autoComplete="email"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5244] via-[#0D483C] to-[#07382E] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-[#0F5244]/20 transition-all duration-200 hover:from-[#0B4035] hover:to-[#052922] hover:shadow-lg hover:shadow-[#0F5244]/30 active:scale-[0.98] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{isAr ? "إرسال رابط التعيين" : "Send Reset Link"}</span>
                <ArrowRight
                  size={15}
                  className={`transition-transform duration-200 ${
                    isAr ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"
                  }`}
                />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer Navigation Link */}
      {!isSubmitted && (
        <div className="mt-4 border-t border-slate-200/60 pt-3.5 text-center text-xs text-slate-500 font-normal">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-[#0F5244] transition-colors hover:underline"
          >
            {isAr ? (
              <>
                <span>تذكرت كلمة المرور؟ تسجيل الدخول</span>
                <ArrowLeft size={14} className="rotate-180" />
              </>
            ) : (
              <>
                <ArrowLeft size={14} />
                <span>Remember your password? Sign In</span>
              </>
            )}
          </Link>
        </div>
      )}
    </section>
  );
}
