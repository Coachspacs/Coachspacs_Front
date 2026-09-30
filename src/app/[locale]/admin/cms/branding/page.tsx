"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
      setStatusMessage(isAr ? "تعذر فتح وضع المعاينة" : "Failed to open preview mode");
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

        setStatusMessage(
          isAr
            ? "تم حفظ وتطبيق الهوية ولوحة الألوان بنجاح على كامل المنصة للجميع!"
            : "Branding and color palette successfully saved and applied platform-wide!"
        );
      } else {
        setStatusMessage(isAr ? "حدث خطأ أثناء الحفظ" : "Failed to save branding");
      }
    } catch (e) {
      setStatusMessage(isAr ? "حدث خطأ أثناء الحفظ" : "Failed to save branding");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Reset to Default: Reverts local state to defaults
  const handleResetToDefault = () => {
    setBranding(DEFAULT_BRANDING);
    setStatusMessage(
      isAr
        ? "تمت استعادة الإعدادات الافتراضية محلياً. اضغط 'حفظ وتطبيق' لتنفيذها للعامة."
        : "Reset to defaults locally. Click 'Save & Apply' to publish live."
    );
  };

  // 6. Auto-Harmonize: Intelligently calculates harmonious colors from Primary Main
  const handleAutoHarmonize = () => {
    const harmonizedColors = autoHarmonizePalette(branding.colors.primaryMain);
    setBranding((prev) => ({
      ...prev,
      colors: harmonizedColors,
    }));
    setStatusMessage(
      isAr
        ? "تم توليد وتنسيق ألوان الثيم تلقائياً بناءً على اللون الرئيسي!"
        : "Theme colors auto-harmonized based on primary main color!"
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-[#0F5244] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F5244] uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4 text-[#0F5244]" />
            <span>{isAr ? "إعدادات المظهر العام والهوية" : "Design System & Platform Branding"}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isAr ? "تخصيص الهوية ولوحة الألوان" : "Global Branding & Palette Tokens"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Reset Defaults Button */}
          <button
            onClick={handleResetToDefault}
            type="button"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
          >
            {isAr ? "استعادة الافتراضي" : "Reset Defaults"}
          </button>

          {/* Live Preview Button (Temporary State) */}
          <button
            onClick={handlePreview}
            disabled={isPreviewing}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title={isAr ? "معاينة بالألوان الجديدة بدون حفظها للعامة" : "Preview draft colors without saving to live"}
          >
            {isPreviewing ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0F5244]" />
            ) : (
              <Eye className="w-4 h-4 text-slate-500" />
            )}
            <span>{isAr ? "معاينة الموقع" : "Live Preview Site"}</span>
          </button>

          {/* Save & Apply Button (Persistent State) */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-[#0F5244]/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isAr ? "حفظ وتطبيق" : "Save & Apply"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F5244] text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F5244]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CORE COLOR TOKENS & ASSETS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Colors Panel */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xs h-full">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "لوحة الألوان الأساسية (Color Tokens)" : "Core Color Tokens"}
              </h3>
              <button
                type="button"
                onClick={handleAutoHarmonize}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-[#0F5244] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title={isAr ? "حساب الألوان المتناسقة آلياً بناءً على اللون الرئيسي" : "Auto-calculate harmonious palette"}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isAr ? "توليد متناسق ذكي" : "Auto-Harmonize"}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Primary Main */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>{isAr ? "اللون الرئيسي (Primary Main)" : "Primary Main Color"}</span>
                  <span className="font-mono text-slate-500">{branding.colors.primaryMain}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.colors.primaryMain}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryMain: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-12 h-10 rounded-xl bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
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
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white uppercase"
                  />
                </div>
              </div>

              {/* Primary Dark */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>{isAr ? "اللون الرئيسي الداكن (Primary Dark)" : "Primary Dark Color"}</span>
                  <span className="font-mono text-slate-500">{branding.colors.primaryDark}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.colors.primaryDark}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryDark: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-12 h-10 rounded-xl bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
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
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white uppercase"
                  />
                </div>
              </div>

              {/* Primary Light */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>{isAr ? "اللون الفاتح (Primary Light)" : "Primary Light Color"}</span>
                  <span className="font-mono text-slate-500">{branding.colors.primaryLight}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.colors.primaryLight}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, primaryLight: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-12 h-10 rounded-xl bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
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
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white uppercase"
                  />
                </div>
              </div>

              {/* Accent Mint */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>{isAr ? "لون التمييز (Accent Highlight)" : "Accent Highlight Color"}</span>
                  <span className="font-mono text-slate-500">{branding.colors.accentMint}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.colors.accentMint}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, accentMint: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-12 h-10 rounded-xl bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
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
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white uppercase"
                  />
                </div>
              </div>

              {/* Secondary Light */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>{isAr ? "الخلفيات الناعمة (Secondary Soft Light)" : "Secondary Soft Tint"}</span>
                  <span className="font-mono text-slate-500">{branding.colors.secondaryLight || "#D1FAE5"}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.colors.secondaryLight || "#D1FAE5"}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        colors: { ...branding.colors, secondaryLight: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-12 h-10 rounded-xl bg-transparent border border-slate-300 cursor-pointer p-0.5 shrink-0"
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
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assets & Styling Panel */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xs h-full">
          <div>
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-4 mb-6">
              {isAr ? "الشعار والأيقونات (Logos & Assets)" : "Brand Assets"}
            </h3>

            <div className="space-y-5">
              {/* Header / Main Logo Upload (Cloudinary) */}
              <CmsImageUpload
                label={isAr ? "شعار الهيدر / الرئيسي (Header Logo)" : "Header / Main Platform Logo"}
                value={branding.logoUrl}
                onChange={(url) => setBranding({ ...branding, logoUrl: url })}
                folder="coachspace/branding"
                aspectRatio="auto"
                description={isAr ? "يظهر في شريط التنقل العلوي والصفحات ذات الخلفيات الفاتحة" : "Displayed in top navigation bar and light-background sections"}
                isAr={isAr}
              />

              {/* Footer Logo Upload (Cloudinary) */}
              <CmsImageUpload
                label={isAr ? "شعار الفوتر (Footer Logo)" : "Footer Logo (Dark Background)"}
                value={branding.footerLogoUrl || ""}
                onChange={(url) => setBranding({ ...branding, footerLogoUrl: url })}
                folder="coachspace/branding"
                aspectRatio="auto"
                description={isAr ? "يظهر في أسفل الصفحة على الخلفية الخضراء الداكنة (يُفضل شعار بلون أبيض أو فاتح)" : "Displayed in the footer on dark green background (recommended: white or light logo)"}
                isAr={isAr}
              />

              {/* Favicon Upload (Cloudinary) */}
              <CmsImageUpload
                label={isAr ? "أيقونة التبويب (Favicon)" : "Favicon (Browser Tab Icon)"}
                value={branding.faviconUrl}
                onChange={(url) => setBranding({ ...branding, faviconUrl: url })}
                folder="coachspace/branding"
                aspectRatio="favicon"
                description={isAr ? "الأيقونة المصغرة التي تظهر في شريط تبويب المتصفح (ICO, PNG, SVG)" : "Browser tab icon (ICO, PNG, SVG)"}
                isAr={isAr}
              />

              {/* Open Graph Social Share Image (Cloudinary) */}
              <CmsImageUpload
                label={isAr ? "صورة المشاركة الاجتماعية (Open Graph / Social Share)" : "Social Preview Image (Open Graph)"}
                value={branding.ogImageUrl || ""}
                onChange={(url) => setBranding({ ...branding, ogImageUrl: url })}
                folder="coachspace/opengraph"
                aspectRatio="wide"
                description={isAr ? "الصورة التي تظهر تلقائياً عند مشاركة رابط الموقع على واتساب، تويتر، لينكد إن وفيسبوك (المقاس المثالي 1200×630)" : "Preview image when sharing links on WhatsApp, LinkedIn, X, Facebook (Ideal: 1200x630)"}
                isAr={isAr}
              />

              {/* Button Radius */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? "نصف قطر استدارة الأزرار (Button Border Radius)" : "Button Border Radius"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["6px", "8px", "12px", "9999px"] as const).map((rad) => (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => setBranding({ ...branding, buttonRadius: rad })}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        branding.buttonRadius === rad
                          ? "bg-[#0F5244] border-[#0F5244] text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      {rad === "9999px" ? (isAr ? "دائري" : "Pill") : rad}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Component Preview */}
          <div className="pt-5 mt-6 border-t border-slate-100 space-y-2.5">
            <span className="text-xs font-bold text-slate-600 block">
              {isAr ? "معاينة حية للمكونات بالألوان المحددة:" : "Live UI Component Preview:"}
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <button
                type="button"
                style={{
                  backgroundColor: branding.colors.primaryMain,
                  borderRadius: branding.buttonRadius,
                }}
                className="px-5 py-2.5 text-white font-bold text-xs shadow-xs transition-transform cursor-pointer"
              >
                {isAr ? "زر الإجراء الرئيسي" : "Primary Action"}
              </button>

              <button
                type="button"
                style={{
                  backgroundColor: branding.colors.secondaryLight,
                  color: branding.colors.primaryDark,
                  borderRadius: branding.buttonRadius,
                }}
                className="px-4 py-2 font-bold text-xs border border-slate-200/60 cursor-pointer"
              >
                {isAr ? "زر ثانوي" : "Secondary"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TYPOGRAPHY STUDIO (إضافة وإدارة أي خط) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F5244] border border-emerald-200/70 flex items-center justify-center shrink-0">
            <Type className="w-5 h-5 text-[#0F5244]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isAr ? "استوديو الخطوط والطباعة (Typography Studio)" : "Global Typography Studio"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isAr ? "تخصيص الخطوط الأساسية باللغتين العربية والإنجليزية وإمكانية استيراد أي خط من Google Fonts" : "Customize primary fonts for Arabic & English or inject any custom Google Font"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Arabic Font Selector */}
          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-slate-800 block">
              {isAr ? "الخط العربي الأساسي (Arabic Font)" : "Primary Arabic Font"}
            </label>
            <select
              value={branding.fontFamilyAr || "Cairo"}
              onChange={(e) => setBranding({ ...branding, fontFamilyAr: e.target.value })}
              className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 cursor-pointer transition-all"
            >
              {POPULAR_GOOGLE_FONTS_ARABIC.map((font) => (
                <option key={font} value={font}>
                  {font} {font === "Cairo" ? (isAr ? "(الافتراضي)" : "(Default)") : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              {isAr ? "يتم تطبيقه على النصوص والواجهات باللغة العربية" : "Applied to RTL Arabic interfaces"}
            </p>
          </div>

          {/* English Font Selector */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-800 block" dir="ltr">
              {isAr ? "الخط الإنجليزي الأساسي (English Font)" : "Primary English Font"}
            </label>
            <select
              dir="ltr"
              value={branding.fontFamilyEn || "Plus Jakarta Sans"}
              onChange={(e) => setBranding({ ...branding, fontFamilyEn: e.target.value })}
              className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 cursor-pointer transition-all"
            >
              {POPULAR_GOOGLE_FONTS_ENGLISH.map((font) => (
                <option key={font} value={font}>
                  {font} {font === "Plus Jakarta Sans" ? (isAr ? "(الافتراضي)" : "(Default)") : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium" dir="ltr">
              {isAr ? "يتم تطبيقه على النصوص والواجهات باللغة الإنجليزية" : "Applied to LTR English interfaces"}
            </p>
          </div>

          {/* Custom Google Font Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>{isAr ? "إضافة أي خط مخصص من Google Fonts" : "Any Custom Google Font"}</span>
              <span className="text-[10.5px] text-[#0F5244] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">{isAr ? "اختياري" : "Optional"}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isAr ? "مثال: Amiri, Rubik, Lemonada, Poppins..." : "e.g. Amiri, Lemonada, Montserrat..."}
                value={branding.customGoogleFontName || ""}
                onChange={(e) => setBranding({ ...branding, customGoogleFontName: e.target.value })}
                className="flex-1 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all"
              />
              {branding.customGoogleFontName && (
                <button
                  type="button"
                  onClick={() => setBranding({ ...branding, customGoogleFontName: "" })}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  title={isAr ? "مسح الخط المخصص" : "Clear custom font"}
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {isAr ? "اكتب اسم أي خط معتمد في Google Fonts وسيتم جلبه وتطبيقه تلقائياً" : "Type any Google Font name to inject and apply globally"}
            </p>
          </div>
        </div>

        {/* Live Bilingual Typography Preview */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {isAr ? "معاينة حية للخطوط المختارة:" : "Live Typography Preview:"}
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#0F5244] font-bold">
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
                انطلق في مسارك نحو الاحتراف والريادة
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                اكتشف دورات تدريبية عملية يقودها نخبة من الخبراء لمساعدتك في بناء مهارات المستقبل.
              </p>
            </div>

            {/* English Preview */}
            <div
              dir="ltr"
              style={{ fontFamily: `'${branding.customGoogleFontName || branding.fontFamilyEn || "Plus Jakarta Sans"}', var(--font-jakarta), system-ui, sans-serif` }}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs"
            >
              <h4 className="text-base font-black text-slate-900 mb-1">
                Elevate Your Career to True Mastery
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Explore practical industry-accredited courses led by certified leaders to accelerate your growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
