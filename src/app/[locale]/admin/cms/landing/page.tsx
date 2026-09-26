"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
  ArrowUpDown,
  ChevronDown,
  Check,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { LandingSectionsData, LandingPageDoc, SectionRolePermission, LandingSectionKey } from "@/types/cms";
import { DEFAULT_LANDING_SECTIONS } from "@/lib/cmsDefaults";
import { SectionVisibilityCard } from "@/components/cms/SectionVisibilityCard";
import { SectionReorderDrawer } from "@/components/cms/SectionReorderDrawer";
import { AiCopywriteButton } from "@/components/cms/AiCopywriteButton";

type TabKey = "hero" | "top_categories" | "master_craft" | "why_stands_out" | "real_stories" | "faq" | "join_future";

export default function LandingEditorPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("cms");

  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [sections, setSections] = useState<LandingSectionsData>(DEFAULT_LANDING_SECTIONS);
  const [landingDoc, setLandingDoc] = useState<LandingPageDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);

  const moreMenuRef = React.useRef<HTMLDivElement>(null);
  const sectionDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(event.target as Node)) {
        setIsSectionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveOrder = (newOrder: LandingSectionKey[]) => {
    setSections((prev) => ({
      ...prev,
      section_order: newOrder,
    }));
    setStatusMessage(t("landing.orderUpdated"));
  };

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
        setStatusMessage(t("landing.draftSaved"));
      }
    } catch (e) {
      setStatusMessage(t("landing.draftSaveFailed"));
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
        setStatusMessage(t("landing.publishSuccess"));
      }
    } catch (e) {
      setStatusMessage(t("landing.publishFailed"));
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-[#34D399] animate-spin" />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "hero", label: t("landing.tabs.hero"), icon: Sparkles },
    { key: "top_categories", label: t("landing.tabs.top_categories"), icon: Layers },
    { key: "master_craft", label: t("landing.tabs.master_craft"), icon: Compass },
    { key: "why_stands_out", label: t("landing.tabs.why_stands_out"), icon: Award },
    { key: "real_stories", label: t("landing.tabs.real_stories"), icon: MessageSquare },
    { key: "faq", label: t("landing.tabs.faq"), icon: HelpCircle },
    { key: "join_future", label: t("landing.tabs.join_future"), icon: FileText },
  ];

  const currentTabObj = tabs.find((t) => t.key === activeTab) || tabs[0];
  const CurrentTabIcon = currentTabObj.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header with structured visual hierarchy & generous spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F5244] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-[#0F5244]" />
            <span>{t("landing.bilingualStudio")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("landing.sectionsTitle")}
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {isAr
              ? "تحرير وتخصيص نصوص وأقسام الصفحة الرئيسية ثنائية اللغة بسهولة"
              : "Customize and manage all bilingual sections of the landing page"}
          </p>
        </div>

        {/* Action Buttons Toolbar with Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* More Options Dropdown (حفظ كمسودة، معاينة المسودة، إعادة ترتيب الأقسام) */}
          <div ref={moreMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer"
              title={isAr ? "خيارات إضافية" : "More Options"}
            >
              <MoreVertical className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{isAr ? "خيارات إضافية" : "More Options"}</span>
            </button>

            {isMoreMenuOpen && (
              <div
                className="absolute top-full mt-2 end-0 z-40 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleSaveDraft();
                    setIsMoreMenuOpen(false);
                  }}
                  disabled={isSaving}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-start cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#0F5244]" /> : <Save className="w-4 h-4 text-slate-500" />}
                  <span>{t("landing.saveDraft")}</span>
                </button>

                <Link
                  href={`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`}
                  target="_blank"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-start cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>{t("landing.previewDraft")}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsReorderOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-start cursor-pointer"
                >
                  <ArrowUpDown className="w-4 h-4 text-slate-500" />
                  <span>{t("landing.reorderSections")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button (The ONLY solid filled green button, prominent) */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:rotate-180" />}
            <span>{t("landing.publishLive")}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F5244]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Section Selector Dropdown */}
      <div className="relative" ref={sectionDropdownRef}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="text-xs font-bold text-slate-700">
            {isAr ? "القسم المراد تعديله:" : "Section to Edit:"}
          </label>
        </div>

        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsSectionDropdownOpen((prev) => !prev)}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 shadow-2xs flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0">
              <CurrentTabIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-900">{currentTabObj.label}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
              {isAr ? "تغيير القسم" : "Switch section"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSectionDropdownOpen ? "rotate-180 text-[#0F5244]" : ""}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isSectionDropdownOpen && (
          <div className="absolute top-full mt-2 inset-x-0 z-30 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 max-h-96 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setIsSectionDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 text-[#0F5244] font-bold border border-emerald-200/80"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-emerald-100/80 text-[#0F5244]" : "bg-slate-100 text-slate-600"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs">{tab.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#0F5244] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Panels Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs">
        {/* ===================== HERO SECTION ===================== */}
        {activeTab === "hero" && (
          <div className="space-y-5">
            {/* Group A: Visibility & Permissions */}
            <SectionVisibilityCard
              title={isAr ? "قسم البداية" : "Hero Section"}
              isVisible={sections.hero.is_visible !== false}
              allowedRoles={sections.hero.allowed_roles}
              onToggleVisible={(val) =>
                setSections({ ...sections, hero: { ...sections.hero, is_visible: val } })
              }
              onRolesChange={(roles) =>
                setSections({ ...sections, hero: { ...sections.hero, allowed_roles: roles } })
              }
              isAr={isAr}
            />

            {/* Group B: Hero Content */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isAr ? "محتوى قسم البداية (Hero)" : "Hero Section Content"}
                </h3>
                <AiCopywriteButton
                  sectionKey="hero"
                  fieldType="title"
                  currentTextAr={sections.hero.title_ar}
                  currentTextEn={sections.hero.title_en}
                  isAr={isAr}
                  onApply={(s) => {
                    setSections((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        ...(s.titleAr ? { title_ar: s.titleAr } : {}),
                        ...(s.titleEn ? { title_en: s.titleEn } : {}),
                        ...(s.descAr ? { description_ar: s.descAr } : {}),
                        ...(s.descEn ? { description_en: s.descEn } : {}),
                      },
                    }));
                  }}
                />
              </div>

              {/* Badge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-800 block">الشارة العلوية (عربي)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={sections.hero.badge_ar}
                    onChange={(e) =>
                      setSections({ ...sections, hero: { ...sections.hero, badge_ar: e.target.value } })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Top Badge (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={sections.hero.badge_en}
                    onChange={(e) =>
                      setSections({ ...sections, hero: { ...sections.hero, badge_en: e.target.value } })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-800 block">العنوان الرئيسي (عربي)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={sections.hero.title_ar}
                    onChange={(e) =>
                      setSections({ ...sections, hero: { ...sections.hero, title_ar: e.target.value } })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Main Heading (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={sections.hero.title_en}
                    onChange={(e) =>
                      setSections({ ...sections, hero: { ...sections.hero, title_en: e.target.value } })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Highlighted Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-800 block">النص الملون المكمل للعنوان (عربي)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={sections.hero.highlighted_text_ar}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        hero: { ...sections.hero, highlighted_text_ar: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-[#0F5244] font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Highlighted Sub-Heading (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={sections.hero.highlighted_text_en}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        hero: { ...sections.hero, highlighted_text_en: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-[#0F5244] font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-800 block">الوصف التوضيحي (عربي)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={sections.hero.description_ar}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        hero: { ...sections.hero, description_ar: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Subtitle Description (English)</label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={sections.hero.description_en}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        hero: { ...sections.hero, description_en: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Group C: Call To Action & Media */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-right">
                {isAr ? "الإجراء الرئيسي والوسائط (CTA & Media)" : "Call To Action & Media"}
              </h4>

              {/* CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-800 block">نص الزر الرئيسي (عربي)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={sections.hero.cta_primary_text_ar}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        hero: { ...sections.hero, cta_primary_text_ar: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Primary CTA Text (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={sections.hero.cta_primary_text_en}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        hero: { ...sections.hero, cta_primary_text_en: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">
                  {isAr ? "رابط صورة الهيرو (Hero Image URL)" : "Hero Image URL"}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.hero.hero_image_url}
                  onChange={(e) =>
                    setSections({ ...sections, hero: { ...sections.hero, hero_image_url: e.target.value } })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TOP CATEGORIES ===================== */}
        {activeTab === "top_categories" && (
          <div className="space-y-6">
            <SectionVisibilityCard
              title={isAr ? "أبرز المجالات والتصنيفات" : "Top Categories"}
              isVisible={sections.top_categories.is_visible !== false}
              allowedRoles={sections.top_categories.allowed_roles}
              onToggleVisible={(val) =>
                setSections({
                  ...sections,
                  top_categories: { ...sections.top_categories, is_visible: val },
                })
              }
              onRolesChange={(roles) =>
                setSections({
                  ...sections,
                  top_categories: { ...sections.top_categories, allowed_roles: roles },
                })
              }
              isAr={isAr}
            />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isAr ? "قسم التصنيفات الرئيسية" : "Top Categories Section"}
              </h3>
              <AiCopywriteButton
                sectionKey="top_categories"
                fieldType="title"
                currentTextAr={sections.top_categories.title_ar}
                currentTextEn={sections.top_categories.title_en}
                isAr={isAr}
                onApply={(s) => {
                  setSections((prev) => ({
                    ...prev,
                    top_categories: {
                      ...prev.top_categories,
                      ...(s.titleAr ? { title_ar: s.titleAr } : {}),
                      ...(s.titleEn ? { title_en: s.titleEn } : {}),
                      ...(s.descAr ? { subtitle_ar: s.descAr } : {}),
                      ...(s.descEn ? { subtitle_en: s.descEn } : {}),
                    },
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">العنوان (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.top_categories.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Heading (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.top_categories.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">الوصف الفرعي (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.top_categories.subtitle_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, subtitle_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Subtitle (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.top_categories.subtitle_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      top_categories: { ...sections.top_categories, subtitle_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== MASTER YOUR CRAFT ===================== */}
        {activeTab === "master_craft" && (
          <div className="space-y-6">
            <SectionVisibilityCard
              title={isAr ? "إتقان المهارات" : "Master Your Craft"}
              isVisible={sections.master_craft.is_visible !== false}
              allowedRoles={sections.master_craft.allowed_roles}
              onToggleVisible={(val) =>
                setSections({
                  ...sections,
                  master_craft: { ...sections.master_craft, is_visible: val },
                })
              }
              onRolesChange={(roles) =>
                setSections({
                  ...sections,
                  master_craft: { ...sections.master_craft, allowed_roles: roles },
                })
              }
              isAr={isAr}
            />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isAr ? "قسم إتقان المهارات (Master Your Craft)" : "Master Your Craft Section"}
              </h3>
              <AiCopywriteButton
                sectionKey="master_craft"
                fieldType="title"
                currentTextAr={sections.master_craft.heading_ar}
                currentTextEn={sections.master_craft.heading_en}
                isAr={isAr}
                onApply={(s) => {
                  setSections((prev) => ({
                    ...prev,
                    master_craft: {
                      ...prev.master_craft,
                      ...(s.titleAr ? { heading_ar: s.titleAr } : {}),
                      ...(s.titleEn ? { heading_en: s.titleEn } : {}),
                      ...(s.descAr ? { description_ar: s.descAr } : {}),
                      ...(s.descEn ? { description_en: s.descEn } : {}),
                    },
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">العنوان (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.master_craft.heading_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, heading_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Heading (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.master_craft.heading_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, heading_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">الوصف (عربي)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={sections.master_craft.description_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, description_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Description (English)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={sections.master_craft.description_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      master_craft: { ...sections.master_craft, description_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== WHY COACH SPACE ===================== */}
        {activeTab === "why_stands_out" && (
          <div className="space-y-6">
            <SectionVisibilityCard
              title={isAr ? "لماذا كوتش سبيس" : "Why Coach Space"}
              isVisible={sections.why_stands_out.is_visible !== false}
              allowedRoles={sections.why_stands_out.allowed_roles}
              onToggleVisible={(val) =>
                setSections({
                  ...sections,
                  why_stands_out: { ...sections.why_stands_out, is_visible: val },
                })
              }
              onRolesChange={(roles) =>
                setSections({
                  ...sections,
                  why_stands_out: { ...sections.why_stands_out, allowed_roles: roles },
                })
              }
              isAr={isAr}
            />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isAr ? "قسم لماذا كوتش سبيس (Why Coach Space)" : "Why Coach Space Stands Out"}
              </h3>
              <AiCopywriteButton
                sectionKey="why_stands_out"
                fieldType="title"
                currentTextAr={sections.why_stands_out.title_ar}
                currentTextEn={sections.why_stands_out.title_en}
                isAr={isAr}
                onApply={(s) => {
                  setSections((prev) => ({
                    ...prev,
                    why_stands_out: {
                      ...prev.why_stands_out,
                      ...(s.titleAr ? { title_ar: s.titleAr } : {}),
                      ...(s.titleEn ? { title_en: s.titleEn } : {}),
                      ...(s.descAr ? { subtitle_ar: s.descAr } : {}),
                      ...(s.descEn ? { subtitle_en: s.descEn } : {}),
                    },
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">العنوان (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.why_stands_out.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Heading (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.why_stands_out.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">الوصف (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.why_stands_out.subtitle_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, subtitle_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Subtitle (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.why_stands_out.subtitle_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      why_stands_out: { ...sections.why_stands_out, subtitle_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== REAL STORIES / TESTIMONIALS ===================== */}
        {activeTab === "real_stories" && (
          <div className="space-y-6">
            <SectionVisibilityCard
              title={isAr ? "قصص النجاح" : "Real Stories"}
              isVisible={sections.real_stories.is_visible !== false}
              allowedRoles={sections.real_stories.allowed_roles}
              onToggleVisible={(val) =>
                setSections({
                  ...sections,
                  real_stories: { ...sections.real_stories, is_visible: val },
                })
              }
              onRolesChange={(roles) =>
                setSections({
                  ...sections,
                  real_stories: { ...sections.real_stories, allowed_roles: roles },
                })
              }
              isAr={isAr}
            />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isAr ? "قسم قصص النجاح والآراء (Testimonials)" : "Testimonials & Success Stories"}
              </h3>
              <AiCopywriteButton
                sectionKey="real_stories"
                fieldType="title"
                currentTextAr={sections.real_stories.title_ar}
                currentTextEn={sections.real_stories.title_en}
                isAr={isAr}
                onApply={(s) => {
                  setSections((prev) => ({
                    ...prev,
                    real_stories: {
                      ...prev.real_stories,
                      ...(s.titleAr ? { title_ar: s.titleAr } : {}),
                      ...(s.titleEn ? { title_en: s.titleEn } : {}),
                      ...(s.descAr ? { subtitle_ar: s.descAr } : {}),
                      ...(s.descEn ? { subtitle_en: s.descEn } : {}),
                    },
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">العنوان (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.real_stories.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      real_stories: { ...sections.real_stories, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Heading (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.real_stories.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      real_stories: { ...sections.real_stories, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>

            {/* Testimonials List */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] border border-emerald-200/80 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة رأي" : "Add Quote"}</span>
                </button>
              </div>

              {sections.real_stories.testimonials.map((t, idx) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
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
                      className="text-rose-500 hover:text-rose-700 text-xs p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="الاسم بالعربي"
                      value={t.name_ar}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].name_ar = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-right text-slate-900 focus:border-[#0F5244] focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Name (English)"
                      value={t.name_en}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].name_en = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-left text-slate-900 focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea
                      rows={2}
                      dir="rtl"
                      placeholder="الرأي بالعربي"
                      value={t.quote_ar}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].quote_ar = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-right text-slate-900 focus:border-[#0F5244] focus:outline-none leading-relaxed"
                    />
                    <textarea
                      rows={2}
                      dir="ltr"
                      placeholder="Quote (English)"
                      value={t.quote_en}
                      onChange={(e) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].quote_en = e.target.value;
                        setSections({ ...sections, real_stories: { ...sections.real_stories, testimonials: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-left text-slate-900 focus:border-[#0F5244] focus:outline-none leading-relaxed"
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
            <SectionVisibilityCard
              title={isAr ? "الأسئلة الشائعة" : "FAQ Section"}
              isVisible={sections.faq.is_visible !== false}
              allowedRoles={sections.faq.allowed_roles}
              onToggleVisible={(val) =>
                setSections({
                  ...sections,
                  faq: { ...sections.faq, is_visible: val },
                })
              }
              onRolesChange={(roles) =>
                setSections({
                  ...sections,
                  faq: { ...sections.faq, allowed_roles: roles },
                })
              }
              isAr={isAr}
            />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isAr ? "قسم الأسئلة الشائعة (FAQ)" : "FAQ Section"}
              </h3>
              <AiCopywriteButton
                sectionKey="faq"
                fieldType="title"
                currentTextAr={sections.faq.title_ar}
                currentTextEn={sections.faq.title_en}
                isAr={isAr}
                onApply={(s) => {
                  setSections((prev) => ({
                    ...prev,
                    faq: {
                      ...prev.faq,
                      ...(s.titleAr ? { title_ar: s.titleAr } : {}),
                      ...(s.titleEn ? { title_en: s.titleEn } : {}),
                      ...(s.descAr ? { subtitle_ar: s.descAr } : {}),
                      ...(s.descEn ? { subtitle_en: s.descEn } : {}),
                    },
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">العنوان (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.faq.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      faq: { ...sections.faq, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Heading (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.faq.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      faq: { ...sections.faq, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>

            {/* FAQs List */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] border border-emerald-200/80 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة سؤال" : "Add FAQ"}</span>
                </button>
              </div>

              {sections.faq.items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
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
                      className="text-rose-500 hover:text-rose-700 text-xs p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="السؤال بالعربي"
                      value={item.question_ar}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].question_ar = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-right text-slate-900 focus:border-[#0F5244] focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Question (English)"
                      value={item.question_en}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].question_en = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-left text-slate-900 focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea
                      rows={2}
                      dir="rtl"
                      placeholder="الإجابة بالعربي"
                      value={item.answer_ar}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].answer_ar = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-right text-slate-900 focus:border-[#0F5244] focus:outline-none leading-relaxed"
                    />
                    <textarea
                      rows={2}
                      dir="ltr"
                      placeholder="Answer (English)"
                      value={item.answer_en}
                      onChange={(e) => {
                        const updated = [...sections.faq.items];
                        updated[idx].answer_en = e.target.value;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-left text-slate-900 focus:border-[#0F5244] focus:outline-none leading-relaxed"
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
            <SectionVisibilityCard
              title={isAr ? "دعوة التسجيل" : "Join Future CTA"}
              isVisible={sections.join_future.is_visible !== false}
              allowedRoles={sections.join_future.allowed_roles}
              onToggleVisible={(val) =>
                setSections({
                  ...sections,
                  join_future: { ...sections.join_future, is_visible: val },
                })
              }
              onRolesChange={(roles) =>
                setSections({
                  ...sections,
                  join_future: { ...sections.join_future, allowed_roles: roles },
                })
              }
              isAr={isAr}
            />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isAr ? "قسم دعوة التسجيل (Join CTA)" : "Join CTA Section"}
              </h3>
              <AiCopywriteButton
                sectionKey="join_future"
                fieldType="title"
                currentTextAr={sections.join_future.title_ar}
                currentTextEn={sections.join_future.title_en}
                isAr={isAr}
                onApply={(s) => {
                  setSections((prev) => ({
                    ...prev,
                    join_future: {
                      ...prev.join_future,
                      ...(s.titleAr ? { title_ar: s.titleAr } : {}),
                      ...(s.titleEn ? { title_en: s.titleEn } : {}),
                      ...(s.descAr ? { subtitle_ar: s.descAr } : {}),
                      ...(s.descEn ? { subtitle_en: s.descEn } : {}),
                    },
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">العنوان (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.join_future.title_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, title_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Heading (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.join_future.title_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, title_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">الوصف (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.join_future.subtitle_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, subtitle_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Subtitle (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.join_future.subtitle_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, subtitle_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-800 block">نص الزر (عربي)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sections.join_future.button_text_ar}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, button_text_ar: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Button Text (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={sections.join_future.button_text_en}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      join_future: { ...sections.join_future, button_text_en: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag & Drop Section Reorder Drawer */}
      <SectionReorderDrawer
        isOpen={isReorderOpen}
        onClose={() => setIsReorderOpen(false)}
        sectionsData={sections}
        isAr={isAr}
        onSaveOrder={handleSaveOrder}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
