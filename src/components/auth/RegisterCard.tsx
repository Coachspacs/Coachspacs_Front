"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch } from "react-redux";
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
  CheckCircle2,
} from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Logo } from "@/components/ui/Logo";
import { registerSchema, type RegisterFormData } from "@/features/auth/schemas/authSchemas";
import { authService, getApiErrorMessage, type UserRoleType } from "@/services/auth";
import { setCredentials } from "@/features/auth/slice";

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
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isAccountCreatedWarning, setIsAccountCreatedWarning] = useState(false);

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

  const handleRoleSelect = (role: "student" | "instructor" | "coach") => {
    setValue("role", role, { shouldValidate: true });
  };

  const dispatch = useDispatch();

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null);
    setIsAccountCreatedWarning(false);
    setSubmittedEmail(data.email.trim());

    try {
      const rolePayload: UserRoleType =
        data.role === "coach" || data.role === "instructor" ? "instructor" : "student";

      console.log("[RegisterCard] Submitting registration form:", {
        email: data.email,
        role: rolePayload,
        fullName: data.fullName,
      });

      const res = await authService.register({
        full_name: data.fullName,
        email: data.email.trim(),
        password: data.password,
        role: rolePayload,
      });

      const token = res.token || res.accessToken || (res.data && res.data.token);
      const refreshToken = res.refreshToken || (res.data && res.data.refreshToken);

      if (token) {
        const rawUser = res.user || (res.data && res.data.user) || (typeof res.data === 'object' ? res.data : {}) || {};
        const user = {
          id: String(rawUser.id || rawUser.pk || Date.now()),
          email: rawUser.email || data.email,
          fullName: rawUser.fullName || rawUser.full_name || data.fullName,
          name: rawUser.name || rawUser.full_name || data.fullName,
          role: rolePayload,
          avatar: rawUser.avatar || '',
          bio: rawUser.bio || '',
        };
        dispatch(setCredentials({ user, token, refreshToken }));
      }

      router.push(`/${locale}/verify-email?email=${encodeURIComponent(data.email.trim())}`);
    } catch (err: any) {
      console.warn("[RegisterCard] Registration catch block error:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
        code: err?.code,
      });

      const errorMessage = getApiErrorMessage(
        err,
        t("unexpectedError") || "An error occurred during registration",
        isAr
      );

      const errString = JSON.stringify(err?.response?.data || '').toLowerCase() + ' ' + errorMessage.toLowerCase();
      if (
        errString.includes('already exists') ||
        errString.includes('مسجل بالفعل') ||
        err?.response?.status === 500 ||
        err?.code === 'ERR_NETWORK'
      ) {
        setIsAccountCreatedWarning(true);
      }

      setFormError(errorMessage);
    }
  };

  return (
    <section
      id="register"
      aria-labelledby="register-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[440px] rounded-xl bg-white p-4 sm:p-5 shadow-xl border border-slate-200/90 font-sans"
    >
      {/* Header Section */}
      <div className="mb-2.5 flex flex-col items-center text-center">
        <div className="mb-1 flex items-center justify-center">
          <Logo showText={false} compact={true} />
        </div>

        <h1
          id="register-title"
          className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight"
        >
          {t("registerTitle")}
        </h1>

        <p className="mt-0.5 text-[11px] sm:text-xs leading-normal text-slate-500 font-normal max-w-xs">
          {t("registerSubtitle")}
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-2.5 rounded-md bg-slate-100 p-1 border border-slate-200">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect("student")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs whitespace-nowrap overflow-hidden transition-all duration-200 cursor-pointer ${
              currentRole === "student"
                ? "bg-white text-[#0F5244] shadow-sm border-2 border-[#0F5244] font-extrabold"
                : "border-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
            }`}
          >
            <GraduationCap size={15} className="shrink-0" />
            <span className="truncate">{t("roleStudent")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect("instructor")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs whitespace-nowrap overflow-hidden transition-all duration-200 cursor-pointer ${
              currentRole === "instructor" || currentRole === "coach"
                ? "bg-[#0F5244] text-white shadow-sm border-2 border-[#0B4035] font-extrabold"
                : "border-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
            }`}
          >
            <Briefcase size={15} className="shrink-0" />
            <span className="truncate">{t("roleInstructor")}</span>
          </button>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {formError && (
          <div className="rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
              <span>{formError}</span>
            </div>

            {isAccountCreatedWarning && submittedEmail && (
              <div className="pt-2 border-t border-red-200/70 text-[11px] text-slate-700 space-y-1.5">
                <p className="font-medium text-slate-600">
                  {isAr
                    ? "هل تم تسجيل هذا الحساب مسبقاً؟ يمكنك الانتقال لتسجيل الدخول أو صفحة تأكيد البريد:"
                    : "Account already exists or created on server? You can log in or verify email:"}
                </p>
                <div className="flex items-center gap-2 font-bold">
                  <Link
                    href={`/${locale}/login`}
                    className="text-[#0F5244] underline hover:text-[#083A30]"
                  >
                    {isAr ? "تسجيل الدخول" : "Sign In"}
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    href={`/${locale}/verify-email?email=${encodeURIComponent(submittedEmail)}`}
                    className="text-[#0F5244] underline hover:text-[#083A30]"
                  >
                    {isAr ? "صفحة تأكيد البريد" : "Verify Email Page"}
                  </Link>
                </div>
              </div>
            )}
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
                className="rounded p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
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
            className="flex cursor-pointer items-start gap-2 text-[11px] sm:text-xs font-medium text-slate-700 select-none leading-snug group"
          >
            <input
              id="agreeToTerms"
              type="checkbox"
              {...register("agreeToTerms")}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/20 cursor-pointer accent-[#0F5244] transition-all"
            />
            <span className="group-hover:text-slate-900 transition-colors">
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
            <p className="mt-1 text-xs font-medium text-red-500">{errors.agreeToTerms.message}</p>
          )}
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
              <span>{t("submitRegister")}</span>
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
