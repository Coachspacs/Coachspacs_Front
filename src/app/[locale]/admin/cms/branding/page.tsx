"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Palette,
  Save,
  CheckCircle2,
  Loader2,
  Wand2,
  Type,
  Eye,
} from "lucide-react";
import { GlobalBrandingConfig } from "@/types/cms";
import { DEFAULT_BRANDING } from "@/lib/cmsDefaults";
import {
  autoHarmonizePalette,
  POPULAR_GOOGLE_FONTS_ARABIC,
  POPULAR_GOOGLE_FONTS_ENGLISH,
} from "@/lib/brandingCss";
import { CmsImageUpload } from "@/components/cms/CmsImageUpload";

export default function BrandingSettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("cms.branding");

  // State: holds the current temporary/preview branding configuration in the UI
  const [branding, setBranding] = useState<GlobalBrandingConfig>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. Initial Load: Fetch published branding from backend
  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.branding) {
          setBranding(json.branding);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("coachspace_cms_branding", JSON.stringify(json.branding));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Failed to load branding:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBranding();
  }, []);

  // 2. Real-time Temporary Preview State Sync (Without persisting to live database)
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      try {
        // Update local preview state for preview tabs
        localStorage.setItem("coachspace_cms_preview_branding", JSON.stringify(branding));
        window.dispatchEvent(
          new CustomEvent("cms-preview-branding-updated", { detail: branding })
        );

        // Broadcast to open preview windows
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("coachspace_cms_preview");
          bc.postMessage({ type: "PREVIEW_BRANDING_UPDATE", branding });
          bc.close();
        }
      } catch {}

      // Auto-save draft branding for the preview session (debounced 400ms)
      const timer = setTimeout(() => {
        fetch("/api/cms/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_branding_draft",
            data: branding,
          }),
        }).catch(() => {});
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [branding, isLoading]);

  // 3. Live Preview Action: Opens the site preview with temporary draft colors
  const handlePreview = async () => {
    setIsPreviewing(true);
    setStatusMessage(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("coachspace_cms_preview_branding", JSON.stringify(branding));
      }

      await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_branding_draft",
          data: branding,
        }),
      });

      if (typeof window !== "undefined") {
        window.open(`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`, "_blank");
      }
    } catch (e) {
      setStatusMessage(t("previewFailed"));
    } finally {
      setIsPreviewing(false);
    }
  };

  // 4. Save & Apply Action: Permanently persists the colors to backend & live platform
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_branding",
          data: branding,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const savedData = json.branding || branding;
        // Dynamically update state with saved data
        setBranding(savedData);

        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("coachspace_cms_preview_branding");
            localStorage.removeItem("coachspace_cms_preview_branding");
            localStorage.setItem("coachspace_cms_branding", JSON.stringify(savedData));
            window.dispatchEvent(
              new CustomEvent("cms-branding-updated", { detail: savedData })
            );
          } catch {}
        }

        setStatusMessage(t("savedSuccess"));
      } else {
        setStatusMessage(t("saveFailed"));
      }
    } catch (e) {
      setStatusMessage(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Reset to Default: Reverts local state to defaults
  const handleResetToDefault = () => {
    setBranding(DEFAULT_BRANDING);
    setStatusMessage(t("resetSuccess"));
  };

  // 6. Auto-Harmonize: Intelligently calculates harmonious colors from Primary Main
  const handleAutoHarmonize = () => {
    const harmonizedColors = autoHarmonizePalette(branding.colors.primaryMain);
    setBranding((prev) => ({
      ...prev,
      colors: harmonizedColors,
    }));
    setStatusMessage(t("harmonizeSuccess"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">
              <span className="p-1 rounded-md bg-slate-50 border border-slate-200/70 text-brand-dark">
                <Palette className="w-3.5 h-3.5" />
              </span>
              <span>{t("designSystem")}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t("globalBranding")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Reset Defaults Button */}
            <button
              onClick={handleResetToDefault}
              type="button"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
            >
              {t("resetDefaults")}
            </button>

            {/* Live Preview Button */}
            <button
              onClick={handlePreview}
              disabled={isPreviewing}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200/90 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title={
                t.has("previewTooltip")
                  ? t("previewTooltip")
                  : isAr
                  ? "معاينة بالألوان والخطوط الجديدة بدون حفظها للعامة"
                  : "Preview draft colors and typography without saving to live"
              }
            >
              {isPreviewing ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-dark" />
              ) : (
                <Eye className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {t.has("previewSite")
                  ? t("previewSite")
                  : isAr
                  ? "معاينة المنصة"
                  : "Live Preview Site"}
              </span>
            </button>

            {/* Save & Apply Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-dark hover:bg-[#07382E] text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-brand-dark/20 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{t("saveApply")}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-brand-dark text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-dark" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CORE COLOR TOKENS & LIVE COMPONENT PREVIEW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Colors Panel (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  {t("colorTokens")}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {t("colorTokensDesc")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoHarmonize}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-brand-dark text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                title={t("autoHarmonizeTooltip")}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{t("autoHarmonize")}</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Primary Main */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t("primaryMain")}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t("primaryMainDesc")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={branding.colors.primaryMain}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryMain: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-9 h-8 rounded-lg bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={branding.colors.primaryMain}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryMain: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-24 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-dark uppercase text-center font-bold"
                  />
                </div>
              </div>

              {/* Primary Dark */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t("primaryDark")}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t("primaryDarkDesc")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={branding.colors.primaryDark}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryDark: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-9 h-8 rounded-lg bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={branding.colors.primaryDark}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryDark: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-24 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-dark uppercase text-center font-bold"
                  />
                </div>
              </div>

              {/* Primary Light */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t("primaryLight")}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t("primaryLightDesc")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={branding.colors.primaryLight}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryLight: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-9 h-8 rounded-lg bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={branding.colors.primaryLight}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryLight: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-24 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-dark uppercase text-center font-bold"
                  />
                </div>
              </div>

              {/* Accent Mint */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t("accentMint")}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t("accentMintDesc")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={branding.colors.accentMint}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, accentMint: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-9 h-8 rounded-lg bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={branding.colors.accentMint}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, accentMint: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-24 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-dark uppercase text-center font-bold"
                  />
                </div>
              </div>

              {/* Secondary Soft Light */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t("secondarySoft")}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t("secondarySoftDesc")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={branding.colors.secondaryLight || "#D1FAE5"}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, secondaryLight: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-9 h-8 rounded-lg bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={branding.colors.secondaryLight || "#D1FAE5"}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, secondaryLight: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-24 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-dark uppercase text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live UI Components & Radius Preview (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                {t("livePreview")}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t("livePreviewDesc")}
              </p>
            </div>

            {/* Button Border Radius Selector */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-slate-800 block">
                {t("buttonRadius")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["6px", "8px", "12px", "9999px"] as const).map((rad) => (
                  <button
                    key={rad}
                    type="button"
                    onClick={() => setBranding({ ...branding, buttonRadius: rad })}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      branding.buttonRadius === rad
                        ? "bg-brand-dark border-brand-dark text-white shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    {rad === "9999px" ? t("pillRadius") : rad}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Previews */}
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              {/* Buttons Demo */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  {t("buttonsDemo")}
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    style={{
                      backgroundColor: branding.colors.primaryMain,
                      borderRadius: branding.buttonRadius,
                    }}
                    className="px-4 py-2 text-white font-bold text-xs shadow-xs transition-transform cursor-pointer"
                  >
                    {t("primaryAction")}
                  </button>

                  <button
                    type="button"
                    style={{
                      backgroundColor: branding.colors.secondaryLight,
                      color: branding.colors.primaryDark,
                      borderRadius: branding.buttonRadius,
                    }}
                    className="px-3.5 py-2 font-bold text-xs border border-slate-200/60 cursor-pointer"
                  >
                    {t("secondaryAction")}
                  </button>
                </div>
              </div>

              {/* Badges Demo */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-600 block">
                  {t("badgesDemo")}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      backgroundColor: `${branding.colors.accentMint}25`,
                      color: branding.colors.primaryDark,
                      borderColor: branding.colors.accentMint,
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border"
                  >
                    <span
                      style={{ backgroundColor: branding.colors.accentMint }}
                      className="w-1.5 h-1.5 rounded-full"
                    />
                    {t("activeBadge")}
                  </span>

                  <span
                    style={{
                      backgroundColor: branding.colors.secondaryLight,
                      color: branding.colors.primaryMain,
                    }}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold"
                  >
                    {t("softTag")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LOGOS & BRAND ASSETS (2x2 Grid) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-900">
            {t("logosAssets")}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("logosAssetsDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Header / Main Logo Upload */}
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/70">
            <CmsImageUpload
              label={t("headerLogo")}
              value={branding.logoUrl}
              onChange={(url) => setBranding({ ...branding, logoUrl: url })}
              folder="coachspace/branding"
              aspectRatio="auto"
              description={t("headerLogoDesc")}
              isAr={isAr}
            />
          </div>

          {/* Footer Logo Upload */}
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/70">
            <CmsImageUpload
              label={t("footerLogo")}
              value={branding.footerLogoUrl || ""}
              onChange={(url) => setBranding({ ...branding, footerLogoUrl: url })}
              folder="coachspace/branding"
              aspectRatio="auto"
              description={t("footerLogoDesc")}
              isAr={isAr}
            />
          </div>

          {/* Favicon Upload */}
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/70">
            <CmsImageUpload
              label={t("favicon")}
              value={branding.faviconUrl}
              onChange={(url) => setBranding({ ...branding, faviconUrl: url })}
              folder="coachspace/branding"
              aspectRatio="favicon"
              description={t("faviconDesc")}
              isAr={isAr}
            />
          </div>

          {/* Open Graph Social Share Image */}
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/70">
            <CmsImageUpload
              label={t("ogImage")}
              value={branding.ogImageUrl || ""}
              onChange={(url) => setBranding({ ...branding, ogImageUrl: url })}
              folder="coachspace/opengraph"
              aspectRatio="wide"
              description={t("ogImageDesc")}
              isAr={isAr}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TYPOGRAPHY STUDIO */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-50 text-brand-dark border border-slate-200/70 flex items-center justify-center shrink-0">
            <Type className="w-5 h-5 text-brand-dark" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t("typographyStudio")}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t("typographyStudioDesc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Arabic Font Selector */}
          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-slate-800 block">
              {t("arabicFont")}
            </label>
            <select
              value={branding.fontFamilyAr || "Cairo"}
              onChange={(e) => setBranding({ ...branding, fontFamilyAr: e.target.value })}
              className="w-full bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/20 cursor-pointer transition-all font-semibold"
            >
              {POPULAR_GOOGLE_FONTS_ARABIC.map((font) => (
                <option key={font} value={font}>
                  {font} {font === "Cairo" ? t("defaultOption") : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              {t("arabicFontDesc")}
            </p>
          </div>

          {/* English Font Selector */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-800 block" dir="ltr">
              {t("englishFont")}
            </label>
            <select
              dir="ltr"
              value={branding.fontFamilyEn || "Plus Jakarta Sans"}
              onChange={(e) => setBranding({ ...branding, fontFamilyEn: e.target.value })}
              className="w-full bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/20 cursor-pointer transition-all font-semibold"
            >
              {POPULAR_GOOGLE_FONTS_ENGLISH.map((font) => (
                <option key={font} value={font}>
                  {font} {font === "Plus Jakarta Sans" ? t("defaultOption") : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium" dir="ltr">
              {t("englishFontDesc")}
            </p>
          </div>

          {/* Custom Google Font Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>{t("customFontLabel")}</span>
              <span className="text-[10.5px] text-brand-dark font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">{t("optional")}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t("customFontPlaceholder")}
                value={branding.customGoogleFontName || ""}
                onChange={(e) => setBranding({ ...branding, customGoogleFontName: e.target.value })}
                className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/20 transition-all font-semibold"
              />
              {branding.customGoogleFontName && (
                <button
                  type="button"
                  onClick={() => setBranding({ ...branding, customGoogleFontName: "" })}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  title={t("clearCustomFont")}
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {t("customFontDesc")}
            </p>
          </div>
        </div>

        {/* Live Bilingual Typography Preview */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {t("liveTypographyPreview")}
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-brand-dark font-bold">
              <span>AR: {branding.customGoogleFontName || branding.fontFamilyAr || "Cairo"}</span>
              <span>EN: {branding.customGoogleFontName || branding.fontFamilyEn || "Plus Jakarta Sans"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Arabic Preview */}
            <div
              dir="rtl"
              style={{ fontFamily: `'${branding.customGoogleFontName || branding.fontFamilyAr || "Cairo"}', var(--font-cairo), system-ui, sans-serif` }}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs"
            >
              <h4 className="text-base font-black text-slate-900 mb-1">
                {t("previewArabicHeading")}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {t("previewArabicBody")}
              </p>
            </div>

            {/* English Preview */}
            <div
              dir="ltr"
              style={{ fontFamily: `'${branding.customGoogleFontName || branding.fontFamilyEn || "Plus Jakarta Sans"}', var(--font-jakarta), system-ui, sans-serif` }}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs"
            >
              <h4 className="text-base font-black text-slate-900 mb-1">
                {t("previewEnglishHeading")}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {t("previewEnglishBody")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
