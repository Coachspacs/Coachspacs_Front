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
} from "lucide-react";
import { GlobalBrandingConfig } from "@/types/cms";
import { DEFAULT_BRANDING } from "@/lib/cmsDefaults";

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
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.branding) {
          setBranding(json.branding);
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
        setStatusMessage(
          isAr
            ? "تم حفظ الهوية البصرية وتطبيق الألوان بنجاح!"
            : "Branding saved and applied globally across the platform!"
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>{isAr ? "إعدادات المظهر العام" : "Design System Customizer"}</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {isAr ? "تخصيص الهوية والألوان" : "Global Branding Settings"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToDefault}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            {isAr ? "استعادة الافتراضي" : "Reset Defaults"}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colors Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3">
            {isAr ? "لوحة الألوان الأساسية (Color Tokens)" : "Core Color Tokens"}
          </h3>

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
              <span>{isAr ? "لون التمييز (Accent Color)" : "Accent Highlight Color"}</span>
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
              {isAr ? "معاينة حية للمكونات بالألوان الجديدة:" : "Live UI Component Preview:"}
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
    </div>
  );
}
