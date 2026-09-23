"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Palette,
  Save,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  RefreshCw,
  Wand2,
  Type,
  Layers,
  HelpCircle,
} from "lucide-react";
import { GlobalBrandingConfig } from "@/types/cms";
import { DEFAULT_BRANDING } from "@/lib/cmsDefaults";
import {
  BRANDING_PRESETS,
  POPULAR_GOOGLE_FONTS_ARABIC,
  POPULAR_GOOGLE_FONTS_ENGLISH,
  autoHarmonizePalette,
  BrandingPreset,
} from "@/lib/brandingCss";

export default function BrandingSettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";

  const [branding, setBranding] = useState<GlobalBrandingConfig>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranding() {
      try {
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("coachspace_cms_branding");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.colors?.primaryMain) {
                setBranding(parsed);
              }
            } catch {}
          }
        }

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
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("coachspace_cms_branding", JSON.stringify(branding));
            window.dispatchEvent(
              new CustomEvent("cms-branding-updated", { detail: branding })
            );
          } catch {}
        }
        setStatusMessage(
          isAr
            ? "تم حفظ الهوية البصرية، الألوان، والخطوط وتطبيقها بنجاح على كامل المنصة!"
            : "Branding, palette tokens, and typography successfully saved and applied platform-wide!"
        );
      }
    } catch (e) {
      setStatusMessage(isAr ? "حدث خطأ أثناء الحفظ" : "Failed to save branding");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setBranding(DEFAULT_BRANDING);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("coachspace_cms_branding");
        window.dispatchEvent(
          new CustomEvent("cms-branding-updated", { detail: DEFAULT_BRANDING })
        );
      } catch {}
    }
    setStatusMessage(
      isAr ? "تمت استعادة إعدادات الهوية والخطوط الافتراضية" : "Reset to default branding settings"
    );
  };

  const handleApplyPreset = (preset: BrandingPreset) => {
    setBranding((prev) => ({
      ...prev,
      colors: { ...preset.colors },
      buttonRadius: preset.buttonRadius,
    }));
    setStatusMessage(
      isAr
        ? `تم تطبيق قالب الثيم: ${preset.nameAr}`
        : `Applied theme preset: ${preset.nameEn}`
    );
  };

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
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const activeFontAr = branding.customGoogleFontName?.trim() || branding.fontFamilyAr || "Cairo";
  const activeFontEn = branding.customGoogleFontName?.trim() || branding.fontFamilyEn || "Plus Jakarta Sans";

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>{isAr ? "إعدادات المظهر العام والهوية" : "Design System & Platform Branding"}</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {isAr ? "تخصيص الهوية، الألوان والخطوط" : "Global Branding & Typography"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleResetToDefault}
            type="button"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700"
          >
            {isAr ? "استعادة الافتراضي" : "Reset Defaults"}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isAr ? "حفظ وتطبيق" : "Save & Apply"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CURATED LUXURY PRESET PALETTES */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white">
              {isAr ? "قوالب ثيمات جاهزة (بنقرة واحدة)" : "Instant Curated Theme Presets"}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {isAr ? "اختر قالباً جاهزاً أو قم بتخصيص كل لون بنفسك" : "Click to apply a cohesive designer palette"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BRANDING_PRESETS.map((preset) => {
            const isActive = branding.colors.primaryMain.toLowerCase() === preset.colors.primaryMain.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer relative overflow-hidden group ${
                  isActive
                    ? "bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                    : "bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600"
                }`}
              >
                {/* 5-color Swatch Bar */}
                <div className="flex h-3 rounded-lg overflow-hidden mb-2.5 shadow-2xs border border-black/20">
                  <span className="flex-1" style={{ backgroundColor: preset.colors.primaryDark }} />
                  <span className="flex-1" style={{ backgroundColor: preset.colors.primaryMain }} />
                  <span className="flex-1" style={{ backgroundColor: preset.colors.primaryLight }} />
                  <span className="flex-1" style={{ backgroundColor: preset.colors.accentMint }} />
                  <span className="flex-1" style={{ backgroundColor: preset.colors.secondaryLight }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors truncate">
                    {isAr ? preset.nameAr : preset.nameEn}
                  </span>
                  {isActive && <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5">
                  {isAr ? preset.descriptionAr : preset.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CORE COLOR TOKENS & ASSETS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white">
              {isAr ? "لوحة الألوان الأساسية (Color Tokens)" : "Core Color Tokens"}
            </h3>
            <button
              type="button"
              onClick={handleAutoHarmonize}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              title={isAr ? "حساب الألوان المتناسقة آلياً بناءً على اللون الرئيسي" : "Auto-calculate harmonious palette"}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isAr ? "توليد متناسق ذكي" : "Auto-Harmonize"}</span>
            </button>
          </div>

          {/* Primary Main */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>{isAr ? "اللون الرئيسي (Primary Main)" : "Primary Main Color"}</span>
              <span className="font-mono text-slate-400">{branding.colors.primaryMain}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.colors.primaryMain}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, primaryMain: e.target.value },
                  })
                }
                className="w-12 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={branding.colors.primaryMain}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, primaryMain: e.target.value },
                  })
                }
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Primary Dark */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>{isAr ? "اللون الرئيسي الداكن (Primary Dark)" : "Primary Dark Color"}</span>
              <span className="font-mono text-slate-400">{branding.colors.primaryDark}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.colors.primaryDark}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, primaryDark: e.target.value },
                  })
                }
                className="w-12 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={branding.colors.primaryDark}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, primaryDark: e.target.value },
                  })
                }
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Primary Light */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>{isAr ? "اللون الفاتح (Primary Light)" : "Primary Light Color"}</span>
              <span className="font-mono text-slate-400">{branding.colors.primaryLight}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.colors.primaryLight}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, primaryLight: e.target.value },
                  })
                }
                className="w-12 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={branding.colors.primaryLight}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, primaryLight: e.target.value },
                  })
                }
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Accent Mint */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>{isAr ? "لون التمييز (Accent Highlight)" : "Accent Highlight Color"}</span>
              <span className="font-mono text-slate-400">{branding.colors.accentMint}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.colors.accentMint}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, accentMint: e.target.value },
                  })
                }
                className="w-12 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={branding.colors.accentMint}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, accentMint: e.target.value },
                  })
                }
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Secondary Light */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>{isAr ? "الخلفيات الناعمة (Secondary Soft Light)" : "Secondary Soft Tint"}</span>
              <span className="font-mono text-slate-400">{branding.colors.secondaryLight || "#D1FAE5"}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.colors.secondaryLight || "#D1FAE5"}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, secondaryLight: e.target.value },
                  })
                }
                className="w-12 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={branding.colors.secondaryLight || "#D1FAE5"}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    colors: { ...branding.colors, secondaryLight: e.target.value },
                  })
                }
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Assets & Styling Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3">
            {isAr ? "الشعار والأيقونات (Logos & Assets)" : "Brand Assets"}
          </h3>

          {/* Logo URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              {isAr ? "رابط الشعار الرئيسي (Logo URL)" : "Main Logo URL"}
            </label>
            <input
              type="text"
              value={branding.logoUrl}
              onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Favicon URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              {isAr ? "رابط الأيقونة المفضلة (Favicon URL)" : "Favicon URL"}
            </label>
            <input
              type="text"
              value={branding.faviconUrl}
              onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Button Radius */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
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
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  {rad === "9999px" ? (isAr ? "دائري" : "Pill") : rad}
                </button>
              ))}
            </div>
          </div>

          {/* Live Component Preview */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400">
              {isAr ? "معاينة حية للمكونات بالألوان المحددة:" : "Live UI Component Preview:"}
            </span>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                style={{
                  backgroundColor: branding.colors.primaryMain,
                  borderRadius: branding.buttonRadius,
                }}
                className="px-5 py-2.5 text-white font-bold text-xs shadow-md transition-transform"
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
                className="px-4 py-2 font-bold text-xs shadow-xs"
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Type className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black text-white">
            {isAr ? "استوديو الخطوط والطباعة (Typography Studio)" : "Global Typography Studio"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Arabic Font Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              {isAr ? "الخط العربي الأساسي (Arabic Font)" : "Primary Arabic Font"}
            </label>
            <select
              value={branding.fontFamilyAr || "Cairo"}
              onChange={(e) => setBranding({ ...branding, fontFamilyAr: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {POPULAR_GOOGLE_FONTS_ARABIC.map((font) => (
                <option key={font} value={font}>
                  {font} {font === "Cairo" ? "(الافتراضي)" : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 font-medium">
              {isAr ? "يتم تطبيقه على النصوص والواجهات باللغة العربية" : "Applied to RTL Arabic interfaces"}
            </p>
          </div>

          {/* English Font Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              {isAr ? "الخط الإنجليزي الأساسي (English Font)" : "Primary English Font"}
            </label>
            <select
              value={branding.fontFamilyEn || "Plus Jakarta Sans"}
              onChange={(e) => setBranding({ ...branding, fontFamilyEn: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {POPULAR_GOOGLE_FONTS_ENGLISH.map((font) => (
                <option key={font} value={font}>
                  {font} {font === "Plus Jakarta Sans" ? "(Default)" : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 font-medium">
              {isAr ? "يتم تطبيقه على النصوص والواجهات باللغة الإنجليزية" : "Applied to LTR English interfaces"}
            </p>
          </div>

          {/* Custom Google Font Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{isAr ? "إضافة أي خط مخصص من Google Fonts" : "Any Custom Google Font"}</span>
              <span className="text-[10.5px] text-emerald-400">{isAr ? "اختياري" : "Optional"}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isAr ? "مثال: Amiri, Rubik, Lemonada, Poppins..." : "e.g. Amiri, Lemonada, Montserrat..."}
                value={branding.customGoogleFontName || ""}
                onChange={(e) => setBranding({ ...branding, customGoogleFontName: e.target.value })}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              {branding.customGoogleFontName && (
                <button
                  type="button"
                  onClick={() => setBranding({ ...branding, customGoogleFontName: "" })}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  title={isAr ? "مسح الخط المخصص" : "Clear custom font"}
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {isAr ? "اكتب اسم أي خط معتمد في Google Fonts وسيتم جلبه وتطبيقه تلقائياً" : "Type any Google Font name to inject and apply globally"}
            </p>
          </div>
        </div>

        {/* Live Bilingual Typography Preview */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {isAr ? "معاينة حية للخطوط المختارة:" : "Live Typography Preview:"}
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400">
              <span>AR: {activeFontAr}</span>
              <span>EN: {activeFontEn}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Arabic Preview */}
            <div
              dir="rtl"
              style={{ fontFamily: `'${activeFontAr}', var(--font-cairo), system-ui, sans-serif` }}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800/80"
            >
              <h4 className="text-base font-black text-white mb-1">
                انطلق في مسارك نحو الاحتراف والريادة
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                اكتشف دورات تدريبية عملية يقودها نخبة من الخبراء لمساعدتك في بناء مهارات المستقبل.
              </p>
            </div>

            {/* English Preview */}
            <div
              dir="ltr"
              style={{ fontFamily: `'${activeFontEn}', var(--font-jakarta), system-ui, sans-serif` }}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800/80"
            >
              <h4 className="text-base font-black text-white mb-1">
                Elevate Your Career to True Mastery
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Explore practical industry-accredited courses led by certified leaders to accelerate your growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
