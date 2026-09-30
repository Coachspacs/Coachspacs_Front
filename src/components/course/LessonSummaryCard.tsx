"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCw,
  AlertCircle,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { lessonSummaryService } from "@/services/lessonSummaryService";
import { LessonSummaryResponse } from "@/types/course";
import { AnimatedRobotCharacter } from "@/components/student/mypath/AnimatedRobotCharacter";

interface LessonSummaryCardProps {
  lessonId: string | number;
  lessonTitle?: string;
  isEnrolled?: boolean;
  hasResources?: boolean;
  locale?: string;
}

export function LessonSummaryCard({
  lessonId,
  lessonTitle,
  isEnrolled = true,
  hasResources = false,
  locale = "en",
}: LessonSummaryCardProps) {
  const isArLocale = locale === "ar";
  const [activeLang, setActiveLang] = useState<"en" | "ar">(isArLocale ? "ar" : "en");
  const isAr = activeLang === "ar";

  // Per-language session cache for instant tab switching
  const [langCache, setLangCache] = useState<Partial<Record<"en" | "ar", LessonSummaryResponse>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasRequested, setHasRequested] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync active language when locale changes
  useEffect(() => {
    setActiveLang(locale === "ar" ? "ar" : "en");
  }, [locale]);

  // Reset when lessonId changes
  useEffect(() => {
    setLangCache({});
    setHasRequested(false);
    setErrorMsg(null);
    setIsLoading(false);
    setCopied(false);
  }, [lessonId]);

  const fetchSummary = useCallback(
    async (targetLang: "en" | "ar", forceFresh: boolean = false) => {
      if (!lessonId) return;

      // If cached in local session state and not forced refresh, serve immediately
      if (!forceFresh && langCache[targetLang]) {
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      setHasRequested(true);

      try {
        const response = await lessonSummaryService.getLessonSummary(lessonId, targetLang);
        setLangCache((prev) => ({
          ...prev,
          [targetLang]: response,
        }));
      } catch (err: any) {
        const fallbackMsg =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          (isAr
            ? "حدث خطأ أثناء إنشاء الملخص، يرجى المحاولة مرة أخرى."
            : "Failed to generate AI summary. Please try again.");
        setErrorMsg(fallbackMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [lessonId, langCache, isAr]
  );

  const currentSummary = langCache[activeLang];

  // If there are no resources/notes/attachments for this lesson, do not show the summary card
  if (!hasResources) {
    return null;
  }

  const handleLanguageChange = (newLang: "en" | "ar") => {
    if (newLang === activeLang) return;
    setActiveLang(newLang);
    if (hasRequested) {
      fetchSummary(newLang, false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = currentSummary?.summary || currentSummary?.content;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-500/[0.07] via-white to-teal-500/[0.05] rounded-3xl border border-emerald-900/15 shadow-sm overflow-hidden transition-all duration-300">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header Bar */}
      <div className="relative p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-950/5 bg-white/60 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0F5244] to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/15 shrink-0 ring-4 ring-emerald-500/10">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {isAr ? "الملخص الذكي للدرس" : "AI Lesson Summary"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0F5244]/10 text-[#0F5244] border border-[#0F5244]/20 flex items-center gap-1">
                <Bot size={11} />
                <span>Gemini AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {isAr
                ? "مراجعة ذكية وسريعة لأهم الأفكار والمفاهيم أعدها مساعدك الذكي"
                : "Key takeaways and core concepts generated by your AI Study Companion"}
            </p>
          </div>
        </div>

        {/* Right Action Tools: Language Selector + Toggle Collapse */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {/* Dual Language Selector */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeLang === "en"
                  ? "bg-[#0F5244] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("ar")}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeLang === "ar"
                  ? "bg-[#0F5244] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              العربية
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200/60 transition-all cursor-pointer"
            title={isExpanded ? (isAr ? "طي" : "Collapse") : (isAr ? "توسيع" : "Expand")}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="relative p-5 sm:p-6 space-y-4">
          {!hasRequested && !currentSummary ? (
            /* Case 1: Initial Unrequested CTA featuring Animated Robot Mascot */
            <div className="p-6 sm:p-7 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-xs backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left rtl:sm:text-right">
                {/* AI Toy Mascot */}
                <div className="shrink-0 flex items-center justify-center p-2 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 shadow-inner">
                  <AnimatedRobotCharacter size="sm" showCap={true} />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-black tracking-wide">
                    <Sparkles size={11} />
                    <span>{isAr ? "مساعدك الذكي جاهز" : "AI Study Companion"}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    {isAr
                      ? "هل ترغب بتلخيص سريع لهذا الدرس؟"
                      : "Ready to summarize this lesson?"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {isAr
                      ? "سأقوم بقراءة مرفقات وملاحظات الدرس واستخراج أهم المفاهيم والنقاط الرئيسية في ثوانٍ."
                      : "I will analyze the instructor's notes and materials to extract key points and takeaways in seconds."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchSummary(activeLang, false)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 group"
              >
                <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
                <span>
                  {isAr ? "تلخيص الدرس الآن" : "Summarize Lesson Now"}
                </span>
              </button>
            </div>
          ) : isLoading ? (
            /* Case 2: Loading State featuring Animated Mascot */
            <div className="py-8 px-6 text-center rounded-2xl bg-white/90 border border-emerald-900/10 shadow-xs flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <AnimatedRobotCharacter size="sm" showCap={true} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F5244] text-white flex items-center justify-center shadow-xs">
                  <RotateCw size={12} className="animate-spin" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-slate-800">
                  {isAr
                    ? "الرفيق الذكي يحلل محتوى ومرفقات الدرس..."
                    : "Gemini AI is analyzing lesson resources & notes..."}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isAr
                    ? "جاري إعداد ملخص مكثف ومنظم لأهم النقاط"
                    : "Drafting a concise, structured summary for you"}
                </p>
              </div>

              <div className="space-y-2 w-full max-w-sm mx-auto pt-1">
                <div className="h-2.5 bg-emerald-100/60 rounded-full animate-pulse w-5/6 mx-auto" />
                <div className="h-2.5 bg-emerald-100/60 rounded-full animate-pulse w-full mx-auto" />
                <div className="h-2.5 bg-emerald-100/60 rounded-full animate-pulse w-3/4 mx-auto" />
              </div>
            </div>
          ) : currentSummary?.status === "unavailable" ? (
            /* Case 3: Unavailable State (no readable notes or extractable text) */
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                  <FileQuestion size={20} />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-sm text-amber-900">
                    {isAr ? "الملخص غير متوفر لهذا الدرس" : "Summary Not Available Yet"}
                  </p>
                  <p className="text-amber-800/90 leading-relaxed font-medium">
                    {currentSummary.detail ||
                      currentSummary.message ||
                      (isAr
                        ? "لم يقم المدرب بإرفاق ملاحظات نصية أو مستندات قابلة للقراءة لهذا الدرس حتى الآن."
                        : "A summary isn't available for this lesson yet because the instructor hasn't provided readable text notes or extractable files.")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchSummary(activeLang, true)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <RotateCw size={12} className={isLoading ? "animate-spin" : ""} />
                <span>{isAr ? "تحقق مجدداً" : "Check Again"}</span>
              </button>
            </div>
          ) : currentSummary?.status === "failed" || errorMsg ? (
            /* Case 3: Failed / Retry State */
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-extrabold">
                    {isAr ? "تعذر إنشاء الملخص" : "Summary Generation Failed"}
                  </p>
                  <p className="text-rose-800 leading-relaxed font-medium">
                    {errorMsg ||
                      currentSummary?.message ||
                      (isAr
                        ? "الخدمة الذكية مشغولة حالياً، يرجى إعادة المحاولة."
                        : "The AI service is temporarily busy. Please retry.")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchSummary(activeLang, true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <RotateCw size={12} />
                <span>{isAr ? "إعادة المحاولة" : "Retry"}</span>
              </button>
            </div>
          ) : currentSummary?.status === "ready" && (currentSummary.summary || currentSummary.content) ? (
            /* Case 4: Ready / Cached Summary State with Toy Mascot badge */
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Meta information & actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
                    <AnimatedRobotCharacter size="xs" showCap={true} />
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    <span className="font-black text-[#0F5244]">
                      {activeLang === "ar" ? "ملخص باللغة العربية" : "English Summary"}
                    </span>
                    {currentSummary.model_version && (
                      <>
                        <span className="mx-1.5 text-slate-300">•</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {currentSummary.model_version}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50 text-slate-700 hover:text-[#0F5244] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title={isAr ? "نسخ الملخص" : "Copy summary"}
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span className="text-emerald-700 font-black">
                          {isAr ? "تم النسخ" : "Copied"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>{isAr ? "نسخ" : "Copy"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchSummary(activeLang, true)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50 text-slate-700 hover:text-[#0F5244] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                    title={isAr ? "إعادة التوليد" : "Regenerate"}
                  >
                    <RotateCw size={12} className={isLoading ? "animate-spin" : ""} />
                    <span>{isAr ? "تحديث" : "Refresh"}</span>
                  </button>
                </div>
              </div>

              {/* Summary Content Body */}
              <div
                className={`p-5 sm:p-6 rounded-2xl bg-white/95 border border-emerald-950/10 shadow-xs text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line ${
                  activeLang === "ar" ? "rtl text-right font-sans" : "ltr text-left"
                }`}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              >
                {currentSummary.summary || currentSummary.content}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
