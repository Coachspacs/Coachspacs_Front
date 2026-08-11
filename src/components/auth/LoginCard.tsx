"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Logo } from "@/components/ui/Logo";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/authSchemas";

interface LoginCardProps {
  lang?: "EN" | "AR";
}

export function LoginCard({ lang }: LoginCardProps) {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.push(`/${locale}`);
    } catch (err: any) {
      setFormError(err.message || t("loginInvalid"));
    }
  };

  return (
    <section
      id="login-card"
      aria-labelledby="login-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[450px] rounded-lg bg-white p-6 sm:p-8 shadow-xl border border-slate-200/90 font-sans"
    >
      {/* Header Section */}
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3.5 flex items-center justify-center">
          <Logo showText={false} compact={false} />
        </div>

        <h1
          id="login-title"
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug"
        >
          {t("loginTitle")}
        </h1>

        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal max-w-xs">
          {t("loginSubtitle")}
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && (
          <div className="flex items-center gap-2.5 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{formError}</span>
          </div>
        )}

        <FormField
          id="email"
          label={t("email")}
          type="email"
          placeholder="jane@example.com"
          {...register("email")}
          error={errors.email?.message}
          icon={<Mail size={16} />}
          autoComplete="email"
          required
        />

        <FormField
          id="password"
          label={t("password")}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
          icon={<Lock size={16} />}
          autoComplete="current-password"
          required
          trailing={
            <button
              type="button"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              onClick={() => setShowPassword((prev: boolean) => !prev)}
              className="rounded p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <div className="flex items-center justify-between pt-0.5 text-xs font-medium">
          <label className="flex cursor-pointer items-center gap-2 text-slate-700 select-none group">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="h-4 w-4 rounded border-slate-300 text-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/20 cursor-pointer accent-[#0F5244] transition-all"
            />
            <span className="group-hover:text-slate-900 transition-colors">{t("rememberMe")}</span>
          </label>

          <Link
            href={`/${locale}/forgot-password`}
            className="font-bold text-[#0F5244] hover:underline focus:outline-none transition-colors"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0F5244] hover:bg-[#083A30] px-6 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>{t("submitLogin")}</span>
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

      {/* Connection Security Badge */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold">
        <ShieldCheck size={13} className="text-[#0F5244]" />
        <span>{t("encryptedConnection")}</span>
      </div>

      {/* Footer Switch Prompt inside Card */}
      <div className="mt-4 border-t border-slate-200/80 pt-4 text-center text-xs text-slate-500 font-medium">
        {t("dontHaveAccount")}{" "}
        <Link
          href={`/${locale}/register`}
          className="font-bold text-[#0F5244] transition-colors hover:underline"
        >
          {t("createAccount")}
        </Link>
      </div>
    </section>
  );
}
