"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { authService } from "@/lib/api/authService";

interface ResetPasswordCardProps {
  lang?: "EN" | "AR";
}

export function ResetPasswordCard({ lang }: ResetPasswordCardProps) {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || locale;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (val: string): string | undefined => {
    if (!val) {
      return t("newPasswordRequired");
    }
    if (val.length < 8) {
      return t("passwordMinLength");
    }
    return undefined;
  };

  const validateConfirm = (val: string, passVal: string): string | undefined => {
    if (!val) {
      return t("confirmPasswordRequired");
    }
    if (val !== passVal) {
      return t("passwordsDoNotMatch");
    }
    return undefined;
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) {
      setPasswordError(validatePassword(val));
    }
    if (confirmPassword) {
      setConfirmError(validateConfirm(confirmPassword, val));
    }
  };

  const handleConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (confirmError) {
      setConfirmError(validateConfirm(val, password));
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const passErr = validatePassword(password);
    const confErr = validateConfirm(confirmPassword, password);

    if (passErr || confErr) {
      setPasswordError(passErr);
      setConfirmError(confErr);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = "mock-reset-token-from-url";
      const response = await authService.resetPassword(token, password);

      if (response.success) {
        router.push(`/${currentLocale}/login`);
      } else {
        setFormError(response.message || t("resetPasswordFailed"));
      }
    } catch (err: any) {
      setFormError(err.message || t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="reset-password-card"
      aria-labelledby="reset-password-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl bg-white/95 p-5 sm:p-6 lg:p-7 shadow-card border border-slate-200/90 backdrop-blur-3xl transition-all duration-300 font-sans"
    >
      <div className="mb-3 flex flex-col items-center text-center">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F5244]/10 text-[#0F5244] border border-[#0F5244]/20 shadow-inner">
          <KeyRound size={22} />
        </div>

        <h1
          id="reset-password-title"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug"
        >
          {t("resetPasswordTitle")}
        </h1>

        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal max-w-xs">
          {t("resetPasswordSub")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {formError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <FormField
            id="new-password"
            name="newPassword"
            label={t("newPassword")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => setPasswordError(validatePassword(password))}
            error={passwordError}
            icon={<Lock size={16} />}
            autoComplete="new-password"
            required
            trailing={
              <button
                type="button"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-lg p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <PasswordStrength password={password} />
        </div>

        <FormField
          id="confirm-password"
          name="confirmPassword"
          label={t("confirmPassword")}
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={handleConfirmChange}
          onBlur={() => setConfirmError(validateConfirm(confirmPassword, password))}
          error={confirmError}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          required
          trailing={
            <button
              type="button"
              aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="rounded-lg p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5244] via-[#0D483C] to-[#07382E] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-[#0F5244]/25 transition-all duration-200 hover:from-[#0B4035] hover:to-[#052922] hover:shadow-lg hover:shadow-[#0F5244]/35 active:scale-[0.98] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
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

      <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
        <ShieldCheck size={12} className="text-[#0F5244]" />
        <span>{t("encryptedConnection")}</span>
      </div>

      <div className="mt-3.5 border-t border-slate-200/60 pt-3.5 text-center text-xs text-slate-500 font-normal">
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
