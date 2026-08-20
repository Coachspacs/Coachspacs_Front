"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Logo } from "@/components/ui/Logo";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/authSchemas";
import { authService, getApiErrorMessage } from "@/services/auth";
import { setCredentials } from "@/features/auth/slice";

interface LoginCardProps {
  lang?: "EN" | "AR";
}

export function LoginCard({ lang }: LoginCardProps) {
  const t = useTranslations("auth");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUnverifiedError, setIsUnverifiedError] = useState(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState("");

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
    setIsUnverifiedError(false);
    setLastSubmittedEmail(data.email);

    try {
      const res = await authService.login({
        email: data.email,
        password: data.password,
      });

      const token = res.access || res.token || res.accessToken || (res.data && (res.data.access || res.data.token));
      const refreshToken = res.refresh || res.refreshToken || (res.data && (res.data.refresh || res.data.refreshToken));

      if (!token) {
        const errDetail = Array.isArray(res.detail) ? res.detail.join(' ') : res.detail;
        throw new Error(res.message || errDetail || "Authentication token not received");
      }

      // Immediately store tokens so Axios attaches Authorization headers for subsequent profile calls
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
      }

      // Fetch authentic user profile & verify approval status directly from backend database API
      const { user, approval_status } = await authService.syncCurrentUserProfile(token, res);

      // Save verified user credentials in Redux & localStorage
      dispatch(setCredentials({ user, token, refreshToken }));

      // 1. Check for redirect query parameter from Protected Route guard
      const redirectParam = searchParams.get("redirect");
      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        const isTargetingInstructor = redirectParam.includes("/instructor");
        if (isTargetingInstructor && user.role !== "instructor") {
          router.push(`/${locale}/student`);
          return;
        }
        router.push(redirectParam);
        return;
      }

      // 2. Role & Approval Status Navigation:
      // - If Instructor:
      //    - If Approved -> Go to Instructor Dashboard (/instructor/dashboard)
      //    - If Pending / Not Approved -> Go to Instructor Workspace with Pending Review state (/instructor)
      // - If Student -> Go to Student Portal (/student)
      if (user.role === "instructor") {
        if (approval_status === "approved") {
          router.push(`/${locale}/instructor/dashboard`);
        } else {
          router.push(`/${locale}/instructor`);
        }
      } else {
        router.push(`/${locale}/student`);
      }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(
        err,
        t("loginInvalid") || "Invalid email or password",
        isAr
      );
      setFormError(errorMessage);

      const rawErrStr = JSON.stringify(err?.response?.data || "").toLowerCase() + " " + errorMessage.toLowerCase();
      if (
        rawErrStr.includes("verify") ||
        rawErrStr.includes("verified") ||
        rawErrStr.includes("activation") ||
        rawErrStr.includes("تفعيل") ||
        rawErrStr.includes("تحقق") ||
        err?.response?.status === 403
      ) {
        setIsUnverifiedError(true);
      }
    }
  };


  return (
    <section
      id="login-card"
      aria-labelledby="login-title"
      dir={isAr ? "rtl" : "ltr"}
      className="relative mx-auto w-full max-w-[440px] rounded-xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200/90 font-sans"
    >
      {/* Header Section */}
      <div className="mb-3 flex flex-col items-center text-center">
        <div className="mb-2 flex items-center justify-center">
          <Logo showText={false} compact={true} />
        </div>

        <h1
          id="login-title"
          className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight"
        >
          {t("loginTitle")}
        </h1>

        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 font-normal max-w-xs">
          {t("loginSubtitle")}
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {formError && (
          <div className="rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
            {isUnverifiedError && (
              <div className="pt-1 border-t border-red-200/60">
                <Link
                  href={`/${locale}/verify-email?email=${encodeURIComponent(lastSubmittedEmail)}`}
                  className="font-bold text-[#0F5244] underline hover:text-[#083A30] text-[11px] flex items-center gap-1"
                >
                  <span>
                    {isAr
                      ? "لم تقم بتأكيد البريد بعد؟ اضغط هنا لإعادة إرسال رابط التفعيل"
                      : "Email not verified yet? Click here to resend verification link"}
                  </span>
                </Link>
              </div>
            )}
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
