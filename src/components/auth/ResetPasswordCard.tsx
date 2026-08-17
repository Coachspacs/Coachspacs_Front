"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Logo } from "@/components/ui/Logo";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/features/auth/schemas/authSchemas";
import { authService, getApiErrorMessage } from "@/services/auth";

interface ResetPasswordCardProps {
  lang?: "EN" | "AR";
}

export function ResetPasswordCard({ lang }: ResetPasswordCardProps) {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentLocale = (params?.locale as string) || locale;

  const token = searchParams.get("token") || searchParams.get("code") || "";
  const uid = searchParams.get("uid") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") || "";

  const onSubmit = async (data: ResetPasswordFormData) => {
    setFormError(null);

    if (!token) {
      setFormError(
        isAr
          ? "رمز إعادة التعيين (Token) مفقود أو غير صالح. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور."
          : "Invalid or missing password reset token. Please request a new reset link."
      );
      return;
    }

    try {
      await authService.resetPassword({
        token,
        uid: uid || undefined,
        password: data.password,
      });
      setResetSuccess(true);
      setTimeout(() => {
        router.push(`/${currentLocale}/login`);
      }, 2500);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(
        err,
        t("unexpectedError") || "An error occurred while resetting password",
        isAr
      );
      setFormError(errorMessage);
    }
  };

  return (
    <section
      id="reset-password-card"
      aria-labelledby="reset-password-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[460px] rounded-lg bg-white p-6 sm:p-8 shadow-xl border border-slate-200/90 font-sans"
    >
      {/* Header Section */}
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3.5 flex items-center justify-center">
          <Logo showText={false} compact={false} />
        </div>

        <h1
          id="reset-password-title"
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug"
        >
          {t("resetPasswordTitle")}
        </h1>

        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal max-w-xs">
          {t("resetPasswordSub")}
        </p>
      </div>

      {resetSuccess ? (
        <div className="py-4 text-center animate-in fade-in duration-200">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200 shadow-xs">
            <CheckCircle2 size={28} className="text-[#0F5244]" />
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            {isAr ? "تم إعادة تعيين كلمة المرور بنجاح!" : "Password Reset Successfully!"}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            {isAr ? "جاري تحويلك لصفحة تسجيل الدخول..." : "Redirecting you to the login page..."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError && (
            <div className="flex items-center gap-2.5 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

        <div>
          <FormField
            id="new-password"
            label={t("newPassword")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
            icon={<Lock size={16} />}
            autoComplete="new-password"
            required
            trailing={
              <button
                type="button"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <PasswordStrength password={passwordValue} />
        </div>

        <FormField
          id="confirm-password"
          label={t("confirmPassword")}
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          required
          trailing={
            <button
              type="button"
              aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="rounded p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
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
              <span>{t("saveNewPassword")}</span>
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
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold">
        <ShieldCheck size={13} className="text-[#0F5244]" />
        <span>{t("encryptedConnection")}</span>
      </div>

      {/* Footer Link */}
      <div className="mt-4 border-t border-slate-200/80 pt-4 text-center text-xs text-slate-500 font-medium">
        {t("rememberOldPassword")}{" "}
        <Link
          href={`/${currentLocale}/login`}
          className="font-bold text-[#0F5244] transition-colors hover:underline"
        >
          {t("login")}
        </Link>
      </div>
    </section>
  );
}
