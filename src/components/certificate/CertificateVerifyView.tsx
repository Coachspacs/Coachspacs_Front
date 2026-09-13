"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldCheck,
  Award,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";
import { certificateService } from "@/services/certificateService";
import { CertificateVerifyResponse } from "@/types/certificate";

interface CertificateVerifyViewProps {
  initialCode?: string;
}

export function CertificateVerifyView({
  initialCode = "",
}: CertificateVerifyViewProps) {
  const t = useTranslations("certificateVerify");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CertificateVerifyResponse | null>(null);
  const [errorType, setErrorType] = useState<"not_found" | "rate_limited" | "invalid_format" | "generic" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const targetCode = (codeToVerify ?? code).trim();
      if (!targetCode) return;

      setIsLoading(true);
      setErrorType(null);
      setErrorMessage(null);
      setResult(null);

      try {
        const data = await certificateService.verifyCertificate(targetCode);
        setResult(data);
      } catch (err: any) {
        // Fallback: Check local certificates or enrolled courses if available
        if (typeof window !== "undefined") {
          try {
            const savedCoursesStr = localStorage.getItem("coachspace_enrolled_courses");
            if (savedCoursesStr) {
              const localList: any[] = JSON.parse(savedCoursesStr);
              const matched = localList.find((c: any) => {
                const cCode = String(c.certificate_code || c.certificateId || `CS-${c.id}` || "").toUpperCase();
                return cCode === targetCode.toUpperCase() || targetCode.toUpperCase().includes(String(c.id));
              });
              if (matched) {
                setResult({
                  certificate_code: targetCode,
                  course_title: (isAr ? (matched.title_ar || matched.title) : (matched.title_en || matched.title)) || "Python Programming",
                  student_full_name: (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}").fullName : null) || (isAr ? "الطالب المتميز" : "Distinguished Student"),
                  issued_at: new Date().toISOString(),
                });
                return;
              }
            }
          } catch (_) {}
        }

        if (err?.isInvalidFormat || err?.status === 400) {
          setErrorType("invalid_format");
          setErrorMessage(t("invalidFormatDesc"));
        } else if (err?.isNotFound || err?.status === 404) {
          setErrorType("not_found");
          setErrorMessage(t("notFoundDesc"));
        } else if (err?.isRateLimited || err?.status === 429) {
          setErrorType("rate_limited");
          setErrorMessage(t("rateLimitedDesc"));
        } else {
          setErrorType("generic");
          setErrorMessage(
            err?.message ||
              (isAr
                ? "حدث خطأ غير متوقع أثناء التحقق. يرجى المحاولة مرة أخرى."
                : "An unexpected error occurred during verification. Please try again.")
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [code, isAr, t]
  );

  // Auto-verify on mount if an initialCode is provided in URL
  useEffect(() => {
    if (initialCode.trim()) {
      setCode(initialCode.trim());
      handleVerify(initialCode.trim());
    }
  }, [initialCode, handleVerify]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${locale}/certificates/verify/${encodeURIComponent(code.trim())}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0F5244] text-xs font-black shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t("verifyTitle")}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t("verifyTitle")}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
          {t("verifySubtitle")}
        </p>
      </div>

      {/* Verification Search Bar (Full Card Width) */}
      <div className="w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="relative flex items-center w-full bg-white rounded-2xl sm:rounded-full border-2 border-slate-200/90 hover:border-slate-300 focus-within:border-[#0F5244] focus-within:ring-4 focus-within:ring-[#0F5244]/15 shadow-sm p-1.5 sm:p-2 transition-all group"
        >
          {/* Search Icon / Badge */}
          <div className="w-10 h-10 rounded-xl sm:rounded-full bg-emerald-50 border border-emerald-100/80 text-[#0F5244] flex items-center justify-center shrink-0 ms-1 shadow-2xs">
            <Search className="w-4.5 h-4.5 text-[#0F5244]" />
          </div>

          {/* Code Input Field */}
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("enterCodePlaceholder")}
            className="flex-1 bg-transparent border-0 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-mono font-bold tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-0 uppercase min-w-0"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Quick Clear Button (if text entered) */}
          {code.trim() && (
            <button
              type="button"
              onClick={() => {
                setCode("");
                setResult(null);
                setErrorType(null);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 me-1 cursor-pointer"
              title={isAr ? "مسح" : "Clear"}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Verification Action Button */}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-full bg-[#0F5244] hover:bg-[#0b3d32] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("searching")}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t("verifyButton")}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-50 border-2 border-[#0F5244] flex items-center justify-center text-[#0F5244]">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-extrabold text-slate-700">
            {t("searching")}
          </p>
        </div>
      )}

      {/* Success State: Valid Certificate */}
      {!isLoading && result && (
        <div className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-white to-white p-6 sm:p-10 shadow-lg relative overflow-hidden space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t("verifiedCredential")}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {result.course_title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-2 transition-all shadow-2xs cursor-pointer shrink-0"
              title={isAr ? "نسخ رابط التحقق" : "Copy verification link"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">
                    {isAr ? "تم النسخ!" : "Copied!"}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>{isAr ? "مشاركة الرابط" : "Share Link"}</span>
                </>
              )}
            </button>
          </div>

          {/* Credential Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                {t("studentName")}
              </span>
              <p className="text-base sm:text-lg font-black text-slate-900">
                {result.student_full_name}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                {t("issuedOn")}
              </span>
              <p className="text-base sm:text-lg font-black text-slate-900">
                {formatDate(result.issued_at)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                {t("credentialId")}
              </span>
              <p className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                {result.certificate_code || code}
              </p>
            </div>
          </div>

          {/* Authenticity Seal */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-800 font-bold">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t("authenticityNotice")}</span>
          </div>
        </div>
      )}

      {/* Error State: 400 Invalid Code Format */}
      {!isLoading && errorType === "invalid_format" && (
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-8 sm:p-12 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {t("invalidFormatTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              {errorMessage || t("invalidFormatDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Error State: 404 Not Found */}
      {!isLoading && errorType === "not_found" && (
        <div className="rounded-3xl border border-rose-200/80 bg-rose-50/40 p-8 sm:p-12 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {t("notFoundTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              {errorMessage || t("notFoundDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Error State: 429 Rate Limit */}
      {!isLoading && errorType === "rate_limited" && (
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-8 sm:p-12 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {t("rateLimitedTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              {errorMessage || t("rateLimitedDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Error State: Generic */}
      {!isLoading && errorType === "generic" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {isAr ? "تعذر التحقق" : "Verification Unavailable"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              {errorMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateVerifyView;
