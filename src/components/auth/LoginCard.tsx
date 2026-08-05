"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
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
      className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl bg-white/95 p-5 sm:p-6 lg:p-7 shadow-card border border-slate-200/90 backdrop-blur-3xl transition-all duration-300 font-sans"
    >
      <div className="mb-3.5 flex flex-col items-center text-center">
        <h1
          id="login-title"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug"
        >
          {t("loginTitle")}
        </h1>

        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal max-w-xs">
          {t("loginSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {formError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
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
              className="rounded-lg p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <div className="flex items-center justify-between pt-0.5 text-xs font-medium">
          <label className="flex cursor-pointer items-center gap-2 text-slate-700 select-none">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="h-3.5 w-3.5 rounded border-slate-300 text-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/20 cursor-pointer accent-[#0F5244]"
            />
            <span>{t("rememberMe")}</span>
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
          className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5244] via-[#0D483C] to-[#07382E] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-[#0F5244]/25 transition-all duration-200 hover:from-[#0B4035] hover:to-[#052922] hover:shadow-lg hover:shadow-[#0F5244]/35 active:scale-[0.98] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
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

      <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
        <ShieldCheck size={12} className="text-[#0F5244]" />
        <span>{t("encryptedConnection")}</span>
      </div>

      <div className="mt-3.5 border-t border-slate-200/60 pt-3.5 text-center text-xs text-slate-500 font-normal">
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

