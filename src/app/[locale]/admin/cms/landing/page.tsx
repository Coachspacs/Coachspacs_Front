"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  Save,
  Send,
  Eye,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  HelpCircle,
  MessageSquare,
  Compass,
  Award,
  Plus,
  Trash2,
} from "lucide-react";
import { LandingSectionsData, LandingPageDoc } from "@/types/cms";
import { DEFAULT_LANDING_SECTIONS } from "@/lib/cmsDefaults";

type TabKey = "hero" | "top_categories" | "master_craft" | "why_stands_out" | "real_stories" | "faq" | "join_future";

export default function LandingEditorPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [sections, setSections] = useState<LandingSectionsData>(DEFAULT_LANDING_SECTIONS);
  const [landingDoc, setLandingDoc] = useState<LandingPageDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.landing) {
          setLandingDoc(json.landing);
          // If draft exists, load draft into editor
          setSections(json.landing.draft || json.landing.published || DEFAULT_LANDING_SECTIONS);
        }
      } catch (err) {
        console.warn("Failed to load landing sections:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          data: sections,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLandingDoc(json.landing);
        setStatusMessage(
          isAr
            ? "تم حفظ المسودة بنجاح! يمكنك الآن معاينتها بأمان قبل النشر."
            : "Draft saved successfully! You can now preview it before publishing."
        );
      }
    } catch (e) {
      setStatusMessage(isAr ? "حدث خطأ أثناء حفظ المسودة" : "Error saving draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      // First ensure current edits are saved as draft
      await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_draft", data: sections }),
      });

      // Then publish
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
            ? "تم نشر التعديلات بنجاح وأصبحت مباشرة لكافة الزوار!"
            : "Published successfully! Live on public website."
        );
      }
    } catch (e) {
      setStatusMessage(isAr ? "حدث خطأ أثناء النشر" : "Error publishing");
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

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "hero", label: isAr ? "قسم البداية (Hero)" : "Hero Section", icon: Sparkles },
    { key: "top_categories", label: isAr ? "أبرز المجالات" : "Categories", icon: Layers },
    { key: "master_craft", label: isAr ? "إتقان المهارات" : "Mastery Craft", icon: Compass },
    { key: "why_stands_out", label: isAr ? "لماذا كوتش سبيس" : "Value Props", icon: Award },
    { key: "real_stories", label: isAr ? "قصص النجاح" : "Testimonials", icon: MessageSquare },
    { key: "faq", label: isAr ? "الأسئلة الشائعة" : "FAQs", icon: HelpCircle },
    { key: "join_future", label: isAr ? "دعوة التسجيل (CTA)" : "Join CTA", icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header with sticky action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>{isAr ? "محرر المحتوى الثنائي" : "Bilingual Content Studio"}</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {isAr ? "تعديل أقسام الصفحة الرئيسية" : "Landing Page Sections"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md cursor-pointer border border-slate-700"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{isAr ? "معاينة المسودة" : "Preview Draft"}</span>
          </Link>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isAr ? "حفظ كمسودة" : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:rotate-180" />}
            <span>{isAr ? "نشر التعديلات" : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        {/* ===================== HERO SECTION ===================== */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">
              {isAr ? "بيانات قسم البداية (Hero Section)" : "Hero Section Details"}
            </h3>

            {/* Badge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">الشارة العلوية (عربي)</label>
                <input
                  type="text"
                  value={sections.hero.badge_ar}
                  onChange={(e) =>
                    setSections({ ...sections, hero: { ...sections.hero, badge_ar: e.target.value } })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Top Badge (English)</label>
                <input
                  type="text"
                  value={sections.hero.badge_en}
                  onChange={(e) =>
                    setSections({ ...sections, hero: { ...sections.hero, badge_en: e.target.value } })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العنوان الرئيسي (عربي)</label>
                <input
                  type="text"
                  value={sections.hero.title_ar}
                  onChange={(e) =>
                    setSections({ ...sections, hero: { ...sections.hero, title_ar: e.target.value } })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Main Heading (English)</label>
                <input
                  type="text"
                  value={sections.hero.title_en}
                  onChange={(e) =>
                    setSections({ ...sections, hero: { ...sections.hero, title_en: e.target.value } })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Highlighted Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">النص الملون المكمل للعنوان (عربي)</label>
                <input
                  type="text"
                  value={sections.hero.highlighted_text_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, highlighted_text_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Highlighted Sub-Heading (English)</label>
                <input
                  type="text"
                  value={sections.hero.highlighted_text_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, highlighted_text_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">الوصف التوضيحي (عربي)</label>
                <textarea
                  rows={3}
                  value={sections.hero.description_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, description_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Subtitle Description (English)</label>
                <textarea
                  rows={3}
                  value={sections.hero.description_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, description_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نص الزر الرئيسي (عربي)</label>
                <input
                  type="text"
                  value={sections.hero.cta_primary_text_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, cta_primary_text_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Primary CTA Text (English)</label>
                <input
                  type="text"
                  value={sections.hero.cta_primary_text_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, cta_primary_text_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Hero Image */}
            <div className="space-y-1.5 border-t border-slate-800 pt-4">
              <label className="text-xs font-bold text-slate-300">رابط صورة الهيرو (Hero Image URL)</label>
              <input
                type="text"
                value={sections.hero.hero_image_url}
                onChange={(e) =>
                  setSections({ ...sections, hero: { ...sections.hero, hero_image_url: e.target.value } })
                }
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white"
              />
            </div>
          </div>
        )}

        {/* ===================== TOP CATEGORIES ===================== */}
        {activeTab === "top_categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">
                {isAr ? "قسم التصنيفات الرئيسية" : "Top Categories Section"}
              </h3>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.top_categories.is_visible}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, is_visible: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-emerald-500 rounded"
                />
                <span className="text-xs font-bold text-slate-300">
                  {isAr ? "إظهار هذا القسم بالموقع" : "Show section on site"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العنوان (عربي)</label>
                <input
                  type="text"
                  value={sections.top_categories.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Heading (English)</label>
                <input
                  type="text"
                  value={sections.top_categories.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">الوصف الفرعي (عربي)</label>
                <input
                  type="text"
                  value={sections.top_categories.subtitle_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, subtitle_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Subtitle (English)</label>
                <input
                  type="text"
                  value={sections.top_categories.subtitle_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, subtitle_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== MASTER YOUR CRAFT ===================== */}
        {activeTab === "master_craft" && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">
              {isAr ? "قسم إتقان المهارات (Master Your Craft)" : "Master Your Craft Section"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العنوان (عربي)</label>
                <input
                  type="text"
                  value={sections.master_craft.heading_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, heading_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Heading (English)</label>
                <input
                  type="text"
                  value={sections.master_craft.heading_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, heading_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">الوصف (عربي)</label>
                <textarea
                  rows={3}
                  value={sections.master_craft.description_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, description_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description (English)</label>
                <textarea
                  rows={3}
                  value={sections.master_craft.description_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, description_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== WHY COACH SPACE ===================== */}
        {activeTab === "why_stands_out" && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">
              {isAr ? "قسم لماذا كوتش سبيس (Why Coach Space)" : "Why Coach Space Stands Out"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العنوان (عربي)</label>
                <input
                  type="text"
                  value={sections.why_stands_out.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Heading (English)</label>
                <input
                  type="text"
                  value={sections.why_stands_out.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">الوصف (عربي)</label>
                <input
                  type="text"
                  value={sections.why_stands_out.subtitle_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, subtitle_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Subtitle (English)</label>
                <input
                  type="text"
                  value={sections.why_stands_out.subtitle_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, subtitle_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== REAL STORIES / TESTIMONIALS ===================== */}
        {activeTab === "real_stories" && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">
              {isAr ? "قسم قصص النجاح والآراء (Testimonials)" : "Testimonials & Success Stories"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العنوان (عربي)</label>
                <input
                  type="text"
                  value={sections.real_stories.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      real_stories: { ...sections.real_stories, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Heading (English)</label>
                <input
                  type="text"
                  value={sections.real_stories.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      real_stories: { ...sections.real_stories, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Testimonials List */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {isAr ? "قائمة آراء الطلاب والمهنيين:" : "Learner Quotes:"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSections({
                      ...sections,
                      real_stories: {
                        ...sections.real_stories,
                        testimonials: [
                          ...sections.real_stories.testimonials,
                          {
                            id: `t-${Date.now()}`,
                            name_ar: "طالب جديد",
                            name_en: "New Learner",
                            role_ar: "مهندس",
                            role_en: "Engineer",
                            quote_ar: "رأي إيجابي حول الدورة",
                            quote_en: "Positive course feedback",
                            rating: 5,
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة رأي" : "Add Quote"}</span>
                </button>
              </div>

              {sections.real_stories.testimonials.map((t, idx) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSections({
                          ...sections,
                          real_stories: {
                            ...sections.real_stories,
                            testimonials: sections.real_stories.testimonials.filter((item) => item.id !== t.id),
                          },
                        })
                      }
                      className="text-rose-400 hover:text-rose-300 text-xs p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="الاسم بالعربي"
                      value={t.name_ar}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].name_ar = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Name (English)"
                      value={t.name_en}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].name_en = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea
                      rows={2}
                      placeholder="الرأي بالعربي"
                      value={t.quote_ar}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].quote_ar = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Quote (English)"
                      value={t.quote_en}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].quote_en = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== FAQ SECTION ===================== */}
        {activeTab === "faq" && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">
              {isAr ? "قسم الأسئلة الشائعة (FAQ)" : "FAQ Section"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العنوان (عربي)</label>
                <input
                  type="text"
                  value={sections.faq.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      faq: { ...sections.faq, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Heading (English)</label>
                <input
                  type="text"
                  value={sections.faq.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      faq: { ...sections.faq, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* FAQs List */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {isAr ? "قائمة الأسئلة والإجابات:" : "Questions & Answers:"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSections({
                      ...sections,
                      faq: {
                        ...sections.faq,
                        items: [
                          ...sections.faq.items,
                          {
                            id: `faq-${Date.now()}`,
                            question_ar: "سؤال جديد",
                            question_en: "New question",
                            answer_ar: "إجابة وافية للسؤال",
                            answer_en: "Detailed answer",
                          },
                        ],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة سؤال" : "Add FAQ"}</span>
                </button>
              </div>

              {sections.faq.items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSections({
                          ...sections,
                          faq: {
                            ...sections.faq,
                            items: sections.faq.items.filter((f) => f.id !== item.id),
                          },
                        })
                      }
                      className="text-rose-400 hover:text-rose-300 text-xs p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="السؤال بالعربي"
                      value={item.question_ar}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].question_ar = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Question (English)"
                      value={item.question_en}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].question_en = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea
                      rows={2}
                      placeholder="الإجابة بالعربي"
                      value={item.answer_ar}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].answer_ar = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Answer (English)"
                      value={item.answer_en}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].answer_en = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== JOIN FUTURE CTA ===================== */}
        {activeTab === "join_future" && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">
              {isAr ? "قسم دعوة التسجيل (Join CTA)" : "Join CTA Section"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">العنوان (عربي)</label>
                <input
                  type="text"
                  value={sections.join_future.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Heading (English)</label>
                <input
                  type="text"
                  value={sections.join_future.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">الوصف (عربي)</label>
                <input
                  type="text"
                  value={sections.join_future.subtitle_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, subtitle_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Subtitle (English)</label>
                <input
                  type="text"
                  value={sections.join_future.subtitle_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, subtitle_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نص الزر (عربي)</label>
                <input
                  type="text"
                  value={sections.join_future.button_text_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, button_text_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Button Text (English)</label>
                <input
                  type="text"
                  value={sections.join_future.button_text_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, button_text_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
