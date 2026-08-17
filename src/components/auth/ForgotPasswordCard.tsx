"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Logo } from "@/components/ui/Logo";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/features/auth/schemas/authSchemas";
import { authService, getApiErrorMessage } from "@/services/auth";

interface ForgotPasswordCardProps {
  lang?: "EN" | "AR";
}

export function ForgotPasswordCard({ lang }: ForgotPasswordCardProps) {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const params = useParams();
  const currentLocale = (params?.locale as string) || locale;

  const [submittedEmail, setSubmittedEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setFormError(null);

    try {
      await authService.forgotPassword({ email: data.email.trim() });
      setSubmittedEmail(data.email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(
        err,
        t("unexpectedError") || "An error occurred while sending reset link",
        isAr
      );
      setFormError(errorMessage);
    }
  };

  return (
    <section
      id="forgot-password-card"
      aria-labelledby="forgot-password-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[450px] rounded-lg bg-white p-6 sm:p-8 shadow-xl border border-slate-200/90 font-sans"
    >
      {/* Header Section */}
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3.5 flex items-center justify-center">
          <Logo showText={false} compact={false} />
        </div>

        <h1
          id="forgot-password-title"
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug"
        >
          {t("forgotPasswordTitle")}
        </h1>
      </div>

      {isSubmitted ? (
        <div className="py-2 text-center animate-in fade-in duration-200">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200 shadow-xs">
            <CheckCircle2 size={28} className="text-[#0F5244]" />
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            {t("resetLinkSent")}
          </h3>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            {t("resetInstructionsSent")}
          </p>

          <div className="my-3 inline-block rounded-md bg-[#0F5244]/10 px-4 py-2 border border-[#0F5244]/20 text-xs sm:text-sm font-bold text-[#0F5244]">
            {submittedEmail}
          </div>

          <p className="text-xs text-slate-400 font-normal">
            {t("checkInboxSpam")}
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0F5244] hover:underline transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>{t("resendEmail")}</span>
            </button>

            <Link
              href={`/${currentLocale}/login`}
              className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.99]"
            >
              {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span>{t("backToSignIn")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError && (
            <div className="flex items-center gap-2.5 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          <FormField
            id="forgot-email"
            label={t("email")}
            type="email"
            placeholder={t("enterEmailPlaceholder")}
            {...register("email")}
            error={errors.email?.message}
            icon={<Mail size={16} />}
            autoComplete="email"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0F5244] hover:bg-[#083A30] px-6 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{t("sendResetLink")}</span>
                <ArrowRight
                  size={16}
                  className={`transition-transform duration-200 ${
                    isAr ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"
                  }`}
                />
              </>
            )}
          </button>
        </form>
      )}

      {/* Security Badge */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold">
        <ShieldCheck size={13} className="text-[#0F5244]" />
        <span>{t("encryptedConnection")}</span>
      </div>

      {!isSubmitted && (
        <div className="mt-4 border-t border-slate-200/80 pt-4 text-center text-xs text-slate-500 font-medium">
          <Link
            href={`/${currentLocale}/login`}
            className="inline-flex items-center gap-1.5 font-bold text-[#0F5244] transition-colors hover:underline"
          >
            {isAr ? (
              <>
                <span>{t("rememberedPassword")} {t("login")}</span>
                <ArrowLeft size={14} className="rotate-180" />
              </>
            ) : (
              <>
                <ArrowLeft size={14} />
                <span>{t("rememberedPassword")} {t("login")}</span>
              </>
            )}
          </Link>
        </div>
      )}
    </section>
  );
}
