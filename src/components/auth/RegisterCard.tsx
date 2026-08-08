"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  GraduationCap,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { registerSchema, type RegisterFormData } from "@/features/auth/schemas/authSchemas";
import type { RoleType } from "@/types";

interface RegisterCardProps {
  lang?: "EN" | "AR";
}

export function RegisterCard({ lang }: RegisterCardProps) {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
      fullName: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  const currentRole = watch("role");
  const passwordValue = watch("password") || "";

  const handleRoleSelect = (role: RoleType) => {
    setValue("role", role, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (data.role === "coach") {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}`);
      }
    } catch (err: any) {
      setFormError(err.message || t("unexpectedError"));
    }
  };

  return (
    <section
      id="register"
      aria-labelledby="register-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-2xl bg-white/95 p-4 sm:p-5 lg:p-6 shadow-card border border-slate-200/90 backdrop-blur-3xl transition-all duration-300 font-sans"
    >
      <div className="mb-2 sm:mb-2.5 flex flex-col items-center text-center">
        <h1
          id="register-title"
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug"
        >
          {t("registerTitle")}
        </h1>

        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 font-normal max-w-xs">
          {t("registerSubtitle")}
        </p>
      </div>

      <div className="mb-2 sm:mb-2.5 rounded-xl bg-slate-100/80 p-1 border border-slate-200/70 shadow-inner">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect("student")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs whitespace-nowrap overflow-hidden transition-all duration-200 cursor-pointer ${
              currentRole === "student"
                ? "bg-white text-[#0F5244] shadow-sm border-2 border-[#0F5244] font-extrabold"
                : "border-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
            }`}
          >
            <GraduationCap size={14} className="shrink-0" />
            <span className="truncate">{t("roleStudent")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect("coach")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs whitespace-nowrap overflow-hidden transition-all duration-200 cursor-pointer ${
              currentRole === "coach"
                ? "bg-[#0F5244] text-white shadow-md border-2 border-[#0B4035] font-extrabold"
                : "border-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
            }`}
          >
            <Briefcase size={14} className="shrink-0" />
            <span className="truncate">{t("roleInstructor")}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 sm:space-y-2.5" noValidate>
        {formError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        <FormField
          id="full-name"
          label={t("fullName")}
          type="text"
          placeholder={t("fullNamePlaceholder")}
          {...register("fullName")}
          error={errors.fullName?.message}
          icon={<User size={16} />}
          autoComplete="name"
          required
        />

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

        <div>
          <FormField
            id="password"
            label={t("password")}
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
                onClick={() => setShowPassword((prev: boolean) => !prev)}
                className="rounded-lg p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <PasswordStrength password={passwordValue} />
        </div>

        <div className="pt-0.5">
          <label
            htmlFor="agreeToTerms"
            className="flex cursor-pointer items-start gap-2 text-[11px] sm:text-xs font-medium text-slate-700 select-none leading-snug"
          >
            <input
              id="agreeToTerms"
              type="checkbox"
              {...register("agreeToTerms")}
              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/20 cursor-pointer accent-[#0F5244]"
            />
            <span>
              {t("agreeTo")}{" "}
              <Link href="#terms" className="text-[#0F5244] hover:underline font-bold">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="#privacy" className="text-[#0F5244] hover:underline font-bold">
                {t("privacyPolicy")}
              </Link>
            </span>
          </label>
          {errors.agreeToTerms?.message && (
            <p className="mt-1.5 text-xs font-normal text-red-500">{errors.agreeToTerms.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5244] via-[#0D483C] to-[#07382E] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-[#0F5244]/25 transition-all duration-200 hover:from-[#0B4035] hover:to-[#052922] hover:shadow-lg hover:shadow-[#0F5244]/35 active:scale-[0.98] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>{t("submitRegister")}</span>
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

      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
        <ShieldCheck size={12} className="text-[#0F5244]" />
        <span>{t("encryptedConnection")}</span>
      </div>

      <div className="mt-2.5 border-t border-slate-200/60 pt-2.5 text-center text-xs text-slate-500 font-normal">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href={`/${locale}/login`}
          className="font-bold text-[#0F5244] transition-colors hover:underline"
        >
          {t("login")}
        </Link>
      </div>
    </section>
  );
}

