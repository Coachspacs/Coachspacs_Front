"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Palette,
  FileText,
  Eye,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { GlobalBrandingConfig, LandingPageDoc } from "@/types/cms";

export default function CmsOverviewPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";

  const [branding, setBranding] = useState<GlobalBrandingConfig | null>(null);
  const [landingDoc, setLandingDoc] = useState<LandingPageDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCmsOverview() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success) {
          setBranding(json.branding);
          setLandingDoc(json.landing);
        }
      } catch (e) {
        console.warn("Failed to load CMS overview data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCmsOverview();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const json = await res.json();
      if (json.success) {
        setLandingDoc(json.landing);
        setStatusMessage(
          isAr
            ? "تم نشر التعديلات وتحديث الموقع العام بنجاح!"
            : "Published successfully! Public website cache revalidated."
        );
      }
    } catch (e) {
      setStatusMessage(isAr ? "فشل النشر، يرجى المحاولة لاحقاً" : "Failed to publish changes");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const hasDraft = landingDoc?.status === "has_draft_changes";

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "نظام إدارة المحتوى والهوية الموحدة" : "Unified CMS & Global Branding"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? "لوحة التحكم بالصفحات والهوية" : "Brand & Marketing Management"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              {isAr
                ? "تعديل محتوى الصفحة الرئيسية باللغتين العربية والإنجليزية، وتخصيص الهوية البصرية والألوان بضغطة زر دون الحاجة لأي برمجة أو إعادة بناء للتطبيق."
                : "Manage bilingual landing page content and customize global branding tokens with instant zero-deployment updates."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md cursor-pointer border border-slate-700"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{isAr ? "معاينة المسودة" : "Preview Draft"}</span>
            </Link>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black transition-all shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 rtl:rotate-180" />
              )}
              <span>{isAr ? "نشر التعديلات للعامة" : "Publish Live"}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Grid of Control Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Global Branding */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between hover:border-slate-700 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                {isAr ? "الهوية البصرية" : "Design Tokens"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {isAr ? "تخصيص الهوية والألوان" : "Global Branding & Colors"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isAr
                  ? "تعديل الألوان الأساسية، الشعار، الأيقونة المفضلة ونصف قطر الأزرار على مستوى الموقع كاملاً."
                  : "Modify primary & accent palette, brand logo, favicon, and button border radius globally."}
              </p>
            </div>

            {/* Current Swatches */}
            {branding && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-bold me-2">
                  {isAr ? "الألوان الحالية:" : "Active Colors:"}
                </span>
                <span
                  className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: branding.colors.primaryMain }}
                  title="Primary Main"
                />
                <span
                  className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: branding.colors.primaryDark }}
                  title="Primary Dark"
                />
                <span
                  className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: branding.colors.primaryLight }}
                  title="Primary Light"
                />
                <span
                  className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: branding.colors.accentMint }}
                  title="Accent Mint"
                />
              </div>
            )}
          </div>

          <div className="pt-6">
            <Link
              href={`/${locale}/admin/cms/branding`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <span>{isAr ? "فتح إعدادات الهوية" : "Configure Branding"}</span>
            </Link>
          </div>
        </div>

        {/* Module 2: Landing Page Sections */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between hover:border-slate-700 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  hasDraft
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {hasDraft
                  ? isAr
                    ? "توجد مسودة غير منشورة"
                    : "Draft Changes Pending"
                  : isAr
                  ? "منشور ومحدث"
                  : "All Changes Published"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {isAr ? "محرر الصفحة الرئيسية" : "Landing Page Sections"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isAr
                  ? "تعديل نصوص الهيرو، المميزات، الأسئلة الشائعة، وآراء الطلاب باللغتين العربية والإنجليزية."
                  : "Bilingual editor for Hero, Value Props, FAQs, Testimonials, and Call to Actions."}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isAr ? "آخر تحديث: " : "Last updated: "}
                {landingDoc?.updatedAt
                  ? new Date(landingDoc.updatedAt).toLocaleString(isAr ? "ar-EG" : "en-US")
                  : "Recently"}
              </span>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href={`/${locale}/admin/cms/landing`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <span>{isAr ? "تحرير أقسام الصفحة" : "Edit Sections"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
