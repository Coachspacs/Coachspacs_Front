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
  HelpCircle,
} from "lucide-react";
import { GlobalBrandingConfig } from "@/types/cms";
import { DEFAULT_BRANDING } from "@/lib/cmsDefaults";
import { autoHarmonizePalette } from "@/lib/brandingCss";

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
            ? "تم حفظ الهوية البصرية ولوحة الألوان بنجاح وتطبيقها على كامل المنصة!"
            : "Branding and color palette tokens successfully saved and applied platform-wide!"
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
      isAr ? "تمت استعادة إعدادات الهوية والألوان الافتراضية" : "Reset to default branding settings"
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
          <button
            onClick={handleResetToDefault}
            type="button"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
          >
            {isAr ? "استعادة الافتراضي" : "Reset Defaults"}
          </button>

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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F5244] text-xs font-bold flex items-center gap-2">
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
                        colors: { ...branding.colors, primaryMain: e.target.value },
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
                        colors: { ...branding.colors, primaryMain: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white"
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
                        colors: { ...branding.colors, primaryDark: e.target.value },
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
                        colors: { ...branding.colors, primaryDark: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white"
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
                        colors: { ...branding.colors, primaryLight: e.target.value },
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
                        colors: { ...branding.colors, primaryLight: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white"
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
                        colors: { ...branding.colors, accentMint: e.target.value },
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
                        colors: { ...branding.colors, accentMint: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white"
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
                        colors: { ...branding.colors, secondaryLight: e.target.value },
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
                        colors: { ...branding.colors, secondaryLight: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white"
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

            <div className="space-y-4">
              {/* Logo URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? "رابط الشعار الرئيسي (Logo URL)" : "Main Logo URL"}
                </label>
                <input
                  type="text"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white font-mono"
                />
              </div>

              {/* Favicon URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? "رابط الأيقونة المفضلة (Favicon URL)" : "Favicon URL"}
                </label>
                <input
                  type="text"
                  value={branding.faviconUrl}
                  onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F5244] focus:bg-white font-mono"
                />
              </div>

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
    </div>
  );
}
