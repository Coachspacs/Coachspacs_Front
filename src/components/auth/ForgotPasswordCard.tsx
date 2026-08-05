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
  KeyRound,
  Loader2,
  Mail,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/features/auth/schemas/authSchemas";

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
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmittedEmail(data.email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || t("unexpectedError"));
    }
  };

  return (
    <section
      id="forgot-password-card"
      aria-labelledby="forgot-password-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[460px] rounded-2xl bg-white/95 p-6 sm:p-7 shadow-card border border-slate-200/80 backdrop-blur-3xl transition-all duration-300 font-sans"
    >
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F5244]/10 text-[#0F5244] border border-[#0F5244]/20 shadow-xs">
          <KeyRound size={22} className="text-[#0F5244]" />
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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200/80">
            <CheckCircle2 size={26} />
          </div>

          <h3 className="text-base font-extrabold text-slate-900">
            {t("resetLinkSent")}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
            {t("resetInstructionsSent")}
          </p>

          <div className="my-2.5 inline-block rounded-xl bg-[#0F5244]/10 px-4 py-1.5 border border-[#0F5244]/20 text-xs font-bold text-[#0F5244]">
            {submittedEmail}
          </div>

          <p className="text-[11px] text-slate-400 font-normal">
            {t("checkInboxSpam")}
          </p>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5244] hover:underline transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{t("resendEmail")}</span>
            </button>

            <Link
              href={`/${currentLocale}/login`}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              {isAr ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              <span>{t("backToSignIn")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
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
            className="group relative flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5244] via-[#0D483C] to-[#07382E] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-[#0F5244]/20 transition-all duration-200 hover:from-[#0B4035] hover:to-[#052922] hover:shadow-lg hover:shadow-[#0F5244]/30 active:scale-[0.98] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{t("sendResetLink")}</span>
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

      {!isSubmitted && (
        <div className="mt-4 border-t border-slate-200/60 pt-3.5 text-center text-xs text-slate-500 font-normal">
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

