"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

/**
 * Props for RegisterCard Component
 */
interface RegisterCardProps {
  /**
   * Active UI language ('AR' for Arabic, 'EN' for English).
   * Defaults to 'EN'.
   */
  lang?: "EN" | "AR";
}

/**
 * Validation errors interface for Register form
 */
interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  agreeToTerms?: string;
}

/**
 * RegisterCard Component
 *
 * Provides user registration for both Students and Instructors.
 * Formatted and modularized for easy backend integration.
 */
export function RegisterCard({ lang = "EN" }: RegisterCardProps) {
  const isAr = lang === "AR";
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Component State
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Validation Logic
  // ---------------------------------------------------------------------------
  const validateField = (name: keyof RegisterFormData, value: any): string | undefined => {
    switch (name) {
      case "fullName":
        if (!value || typeof value !== "string" || !value.trim()) {
          return isAr ? "يرجى إدخال الاسم الكامل" : "Full name is required";
        }
        if (value.trim().length < 2) {
          return isAr ? "يجب أن يتكون الاسم من حرفين على الأقل" : "Name must be at least 2 characters";
        }
        return undefined;

      case "email":
        if (!value || typeof value !== "string" || !value.trim()) {
          return isAr ? "يرجى إدخال البريد الإلكتروني" : "Email address is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return isAr ? "صيغة البريد الإلكتروني غير صحيحة" : "Please enter a valid email address";
        }
        return undefined;

      case "password":
        if (!value || typeof value !== "string") {
          return isAr ? "يرجى إدخال كلمة المرور" : "Password is required";
        }
        if (value.length < 8) {
          return isAr ? "يجب أن تحتوي كلمة المرور على 8 خانات على الأقل" : "Password must be at least 8 characters";
        }
        return undefined;

      case "agreeToTerms":
        if (!value) {
          return isAr ? "يرجى الموافقة على الشروط والأحكام" : "You must agree to the Terms and Privacy Policy";
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

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  const handleRoleSelect = (role: RoleType) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (errors[name as keyof FormErrors]) {
      const errorMsg = validateField(name as keyof RegisterFormData, fieldValue);
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    const errorMsg = validateField(name as keyof RegisterFormData, fieldValue);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  /**
   * Registration Form Submission Handler
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // BACKEND API CALL: Register New User
      const response = await authService.register(formData);

      if (response.success) {
        // ----------------------------------------------------------------------
        // BACKEND INTEGRATION TODO:
        // 1. Save auth session token if applicable:
        //    localStorage.setItem('token', response.token);
        // 2. Redirect to dashboard or onboarding page:
        //    router.push('/');
        // ----------------------------------------------------------------------
        router.push("/");
      } else {
        setFormError(
          response.message ||
            (isAr ? "حدث خطأ أثناء التسجيل." : "Registration failed.")
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
      id="register"
      aria-labelledby="register-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl bg-white/95 p-5 sm:p-6 lg:p-7 shadow-card border border-slate-200/90 backdrop-blur-3xl transition-all duration-300 font-sans"
    >
      {/* Header Titles */}
      <div className="mb-3 flex flex-col items-center text-center">
        <h1
          id="register-title"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug"
        >
          {isAr ? "أنشئ حسابك الجديد" : "Create Your Account"}
        </h1>

        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal max-w-xs">
          {isAr
            ? "ابدأ رحلتك التعليمية الآن وتواصل مع نخبة الخبراء والمدربين."
            : "Start your journey today with certified coaches and mentors."}
        </p>
      </div>

      {/* Role Selection Tabs */}
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
            <span className="truncate">{isAr ? "طالب" : "Student"}</span>
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
            <span className="truncate">{isAr ? "محاضر" : "Instructor"}</span>
          </button>
        </div>
      </div>

      {/* REGISTRATION FORM */}
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
          label={isAr ? "الاسم الكامل" : "FULL NAME"}
          type="text"
          placeholder={isAr ? "أحمد محمد" : "Jane Doe"}
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
          label={isAr ? "البريد الإلكتروني" : "EMAIL ADDRESS"}
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
            label={isAr ? "كلمة المرور" : "PASSWORD"}
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
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-lg p-1 text-slate-400 hover:text-[#0F5244] focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Live Password Strength Indicator Bar */}
          <PasswordStrength password={formData.password} lang={lang} />
        </div>

        {/* Terms & Privacy Checkbox */}
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
              {isAr ? "أوافق على " : "I agree to the "}
              <Link href="#terms" className="text-[#0F5244] hover:underline font-bold">
                {isAr ? "شروط الخدمة" : "Terms of Service"}
              </Link>{" "}
              {isAr ? "و " : "and "}{" "}
              <Link href="#privacy" className="text-[#0F5244] hover:underline font-bold">
                {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1.5 text-xs font-normal text-red-500">{errors.agreeToTerms}</p>
          )}
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5244] via-[#0D483C] to-[#07382E] px-5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-[#0F5244]/25 transition-all duration-200 hover:from-[#0B4035] hover:to-[#052922] hover:shadow-lg hover:shadow-[#0F5244]/35 active:scale-[0.98] disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#0F5244]/20 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>
                {isAr
                  ? formData.role === "coach"
                    ? "تسجيل كمحاضر معتمد"
                    : "إنشاء حساب جديد"
                  : formData.role === "coach"
                  ? "Join as Certified Instructor"
                  : "Create Account"}
              </span>
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

      {/* Security Note Badge */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
        <ShieldCheck size={12} className="text-[#0F5244]" />
        <span>{isAr ? "بياناتك محمية ومشفرة 100%" : "100% Encrypted & Secure Connection"}</span>
      </div>

      {/* Footer Link inside Card */}
      <div className="mt-2.5 border-t border-slate-200/60 pt-2.5 text-center text-xs text-slate-500 font-normal">
        {isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}
        <Link
          href="/login"
          className="font-bold text-[#0F5244] transition-colors hover:underline"
        >
          {isAr ? "تسجيل الدخول" : "Login"}
        </Link>
      </div>
    </section>
  );
}
