"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
import { authService } from "@/lib/api/authService";
import type { RegisterFormData, RoleType } from "@/types";

interface RegisterCardProps {
  lang?: "EN" | "AR";
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  agreeToTerms?: string;
}

export function RegisterCard({ lang }: RegisterCardProps) {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<RegisterFormData>({
    role: "student",
    fullName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const validateField = (name: keyof RegisterFormData, value: any): string | undefined => {
    switch (name) {
      case "fullName":
        if (!value || typeof value !== "string" || !value.trim()) {
          return t("fullNameRequired");
        }
        if (value.trim().length < 2) {
          return t("nameMinLength");
        }
        return undefined;

      case "email":
        if (!value || typeof value !== "string" || !value.trim()) {
          return t("emailRequired");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return t("invalidEmail");
        }
        return undefined;

      case "password":
        if (!value || typeof value !== "string") {
          return t("passwordRequired");
        }
        if (value.length < 8) {
          return t("passwordMinLength");
        }
        return undefined;

      case "agreeToTerms":
        if (!value) {
          return t("agreeToTermsError");
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof RegisterFormData>).forEach((key) => {
      if (key === "role") return;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleRoleSelect = (role: RoleType) => {
    setFormData((prev: RegisterFormData) => ({ ...prev, role }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev: RegisterFormData) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (errors[name as keyof FormErrors]) {
      const errorMsg = validateField(name as keyof RegisterFormData, fieldValue);
      setErrors((prev: FormErrors) => ({
        ...prev,
        [name]: errorMsg,
      }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    const errorMsg = validateField(name as keyof RegisterFormData, fieldValue);
    setErrors((prev: FormErrors) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.register(formData);

      if (response.success) {
        if (formData.role === "coach") {
          router.push(`/${locale}/dashboard`);
        } else {
          router.push(`/${locale}`);
        }
      } else {
        setFormError(response.message || t("registrationFailed"));
      }
    } catch (err: any) {
      setFormError(err.message || t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="register"
      aria-labelledby="register-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl bg-white/95 p-5 sm:p-6 lg:p-7 shadow-card border border-slate-200/90 backdrop-blur-3xl transition-all duration-300 font-sans"
    >
      <div className="mb-3 flex flex-col items-center text-center">
        <h1
          id="register-title"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug"
        >
          {t("registerTitle")}
        </h1>

        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal max-w-xs">
          {t("registerSubtitle")}
        </p>
      </div>

      <div className="mb-3 rounded-xl bg-slate-100/80 p-1 border border-slate-200/70 shadow-inner">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect("student")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2.5 text-xs sm:text-sm whitespace-nowrap overflow-hidden transition-all duration-200 cursor-pointer ${
              formData.role === "student"
                ? "bg-white text-[#0F5244] shadow-sm border-2 border-[#0F5244] font-extrabold"
                : "border-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
            }`}
          >
            <GraduationCap size={15} className="shrink-0" />
            <span className="truncate">{t("roleStudent")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect("coach")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2.5 text-xs sm:text-sm whitespace-nowrap overflow-hidden transition-all duration-200 cursor-pointer ${
              formData.role === "coach"
                ? "bg-[#0F5244] text-white shadow-md border-2 border-[#0B4035] font-extrabold"
                : "border-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
            }`}
          >
            <Briefcase size={15} className="shrink-0" />
            <span className="truncate">{t("roleInstructor")}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {formError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        <FormField
          id="full-name"
          name="fullName"
          label={t("fullName")}
          type="text"
          placeholder={t("fullNamePlaceholder")}
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
          icon={<User size={16} />}
          autoComplete="name"
          required
        />

        <FormField
          id="email"
          name="email"
          label={t("email")}
          type="email"
          placeholder="jane@example.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          icon={<Mail size={16} />}
          autoComplete="email"
          required
        />

        <div>
          <FormField
            id="password"
            name="password"
            label={t("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
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

          <PasswordStrength password={formData.password} />
        </div>

        <div className="pt-0.5">
          <label
            htmlFor="agreeToTerms"
            className="flex cursor-pointer items-start gap-2 text-[11px] sm:text-xs font-medium text-slate-700 select-none leading-snug"
          >
            <input
              id="agreeToTerms"
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
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
          {errors.agreeToTerms && (
            <p className="mt-1.5 text-xs font-normal text-red-500">{errors.agreeToTerms}</p>
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
