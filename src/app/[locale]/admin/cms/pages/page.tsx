"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  FileText,
  Save,
  Send,
  Eye,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  Database,
  UserCheck,
  Lock,
  Eye as EyeIcon,
  BookOpen,
  Award,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Mail,
  MoreVertical,
} from "lucide-react";
import { LegalPagesContent, LegalPagesDoc, LegalSectionData } from "@/types/cms";
import { DEFAULT_LEGAL_PAGES } from "@/lib/cmsDefaults";

type PageKey = "privacy" | "terms";

const ICON_OPTIONS = [
  { id: "Shield", label: "درع (Shield)", icon: Shield },
  { id: "Database", label: "قاعدة بيانات (Database)", icon: Database },
  { id: "UserCheck", label: "مستخدم موثق (UserCheck)", icon: UserCheck },
  { id: "Lock", label: "قفل وأمان (Lock)", icon: Lock },
  { id: "Eye", label: "عين وخصوصية (Eye)", icon: EyeIcon },
  { id: "FileText", label: "مستند (FileText)", icon: FileText },
  { id: "CheckCircle2", label: "علامة تحقق (CheckCircle)", icon: CheckCircle2 },
  { id: "BookOpen", label: "كتاب وترخيص (BookOpen)", icon: BookOpen },
  { id: "Award", label: "شهادة وتقدير (Award)", icon: Award },
  { id: "ShieldAlert", label: "تنبيه وقواعد (ShieldAlert)", icon: ShieldAlert },
];

export default function CmsLegalPagesEditor() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("cms");

  const [activePage, setActivePage] = useState<PageKey>("privacy");
  const [legalContent, setLegalContent] = useState<LegalPagesContent>(DEFAULT_LEGAL_PAGES);
  const [legalDoc, setLegalDoc] = useState<LegalPagesDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const moreMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.legal) {
          setLegalDoc(json.legal);
          setLegalContent(json.legal.draft || json.legal.published || DEFAULT_LEGAL_PAGES);
        }
      } catch (err) {
        console.warn("Failed to load legal content:", err);
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
          action: "save_legal_draft",
          data: legalContent,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLegalDoc(json.legal);
        setStatusMessage(t("pages.draftSaved"));
      }
    } catch (e) {
      setStatusMessage(t("pages.draftSaveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      // First ensure current state is saved
      await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_legal_draft", data: legalContent }),
      });

      // Then trigger publication
      const res = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish_legal" }),
      });
      const json = await res.json();
      if (json.success) {
        setLegalDoc(json.legal);
        setStatusMessage(t("pages.publishSuccess"));
      }
    } catch (e) {
      setStatusMessage(t("pages.publishFailed"));
    } finally {
      setIsPublishing(false);
    }
  };

  const currentPageData = legalContent[activePage];

  const updateCurrentPage = (updates: Partial<typeof currentPageData>) => {
    setLegalContent((prev) => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        ...updates,
      },
    }));
  };

  const handleUpdateSection = (
    index: number,
    field: keyof LegalSectionData,
    value: string
  ) => {
    const updatedSections = [...currentPageData.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
    };
    updateCurrentPage({ sections: updatedSections });
  };

  const handleAddSection = () => {
    const newSection: LegalSectionData = {
      id: `section-${Date.now()}`,
      icon: "Shield",
      title_ar: "قسم جديد",
      title_en: "New Section",
      content_ar: "اكتب محتوى القسم هنا...",
      content_en: "Write section content here...",
    };
    updateCurrentPage({ sections: [...currentPageData.sections, newSection] });
  };

  const handleRemoveSection = (index: number) => {
    const updatedSections = currentPageData.sections.filter((_, i) => i !== index);
    updateCurrentPage({ sections: updatedSections });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 sm:p-20">
        <Loader2 className="w-8 h-8 text-[#0F5244] animate-spin" />
      </div>
    );
  }

  const publicPreviewUrl =
    activePage === "privacy"
      ? `/${locale}/privacy?preview=true`
      : `/${locale}/terms?preview=true`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header with structured visual hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F5244] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F5244]" />
            <span>{t("pages.legalStudio")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("pages.legalTitle")}
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {isAr
              ? "تحرير وتخصيص نصوص الشروط وسياسة الخصوصية ثنائية اللغة بسهولة"
              : "Customize and manage all bilingual legal policies and terms"}
          </p>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2.5">
          {/* More Options Dropdown */}
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
                className="absolute top-full mt-2 end-0 z-40 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95"
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
                  <span>{t("pages.saveDraft")}</span>
                </button>

                <Link
                  href={publicPreviewUrl}
                  target="_blank"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-start cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>{t("pages.previewPage")}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Primary Action Button (The ONLY solid filled green button) */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 rtl:rotate-180" />
            )}
            <span>{t("pages.publishLive")}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F5244]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Page Selector Segmented Pill Control */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/70 w-fit">
        <button
          type="button"
          onClick={() => setActivePage("privacy")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === "privacy"
              ? "bg-[#0F5244] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60 bg-transparent font-medium"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{t("pages.tabs.privacy")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePage("terms")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === "terms"
              ? "bg-[#0F5244] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60 bg-transparent font-medium"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t("pages.tabs.terms")}</span>
        </button>
      </div>

      {/* Editor Main Content */}
      <div className="space-y-6">
        {/* Section 1: Page Header & Meta */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F5244]" />
            <span>{isAr ? "العناوين الرئيسية والشارة" : "Header & Metadata"}</span>
          </h3>

          {/* Badge */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 block">الشارة العلوية (عربي)</label>
              <input
                type="text"
                dir="rtl"
                value={currentPageData.badge_ar}
                onChange={(e) => updateCurrentPage({ badge_ar: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Top Badge (English)</label>
              <input
                type="text"
                dir="ltr"
                value={currentPageData.badge_en}
                onChange={(e) => updateCurrentPage({ badge_en: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 block">عنوان الصفحة الرئيسي (عربي)</label>
              <input
                type="text"
                dir="rtl"
                value={currentPageData.title_ar}
                onChange={(e) => updateCurrentPage({ title_ar: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Page Title (English)</label>
              <input
                type="text"
                dir="ltr"
                value={currentPageData.title_en}
                onChange={(e) => updateCurrentPage({ title_en: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 block">الوصف التمهيدي (عربي)</label>
              <textarea
                rows={2}
                dir="rtl"
                value={currentPageData.subtitle_ar}
                onChange={(e) => updateCurrentPage({ subtitle_ar: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Page Subtitle (English)</label>
              <textarea
                rows={2}
                dir="ltr"
                value={currentPageData.subtitle_en}
                onChange={(e) => updateCurrentPage({ subtitle_en: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Last Updated Date */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 block">تاريخ آخر تحديث (عربي)</label>
              <input
                type="text"
                dir="rtl"
                value={currentPageData.lastUpdatedDate_ar}
                onChange={(e) => updateCurrentPage({ lastUpdatedDate_ar: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Last Updated Date (English)</label>
              <input
                type="text"
                dir="ltr"
                value={currentPageData.lastUpdatedDate_en}
                onChange={(e) => updateCurrentPage({ lastUpdatedDate_en: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Policy & Terms Clauses / Sections */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F5244]" />
              <span>{isAr ? "بنود وأقسام الصفحة" : "Page Sections & Clauses"}</span>
              <span className="text-xs font-bold text-[#0F5244] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80">
                {currentPageData.sections.length}
              </span>
            </h3>

            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] border border-emerald-200/80 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "إضافة قسم جديد" : "Add Section"}</span>
            </button>
          </div>

          <div className="space-y-4">
            {currentPageData.sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="bg-slate-50/60 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-emerald-100/90 text-[#0F5244] text-[11px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {section.title_ar || section.title_en || (isAr ? "قسم بدون عنوان" : "Untitled")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Icon selector */}
                    <select
                      value={section.icon || "Shield"}
                      onChange={(e) => handleUpdateSection(idx, "icon", e.target.value)}
                      className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0F5244] cursor-pointer"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={isAr ? "حذف هذا القسم" : "Delete section"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-slate-800 block">عنوان البند (عربي)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={section.title_ar}
                      onChange={(e) => handleUpdateSection(idx, "title_ar", e.target.value)}
                      className="w-full bg-white hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-right text-slate-900 focus:outline-none focus:border-[#0F5244]"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Clause Title (English)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={section.title_en}
                      onChange={(e) => handleUpdateSection(idx, "title_en", e.target.value)}
                      className="w-full bg-white hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-left text-slate-900 focus:outline-none focus:border-[#0F5244]"
                    />
                  </div>
                </div>

                {/* Section Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-slate-800 block">نص البند والتفاصيل (عربي)</label>
                    <textarea
                      rows={4}
                      dir="rtl"
                      value={section.content_ar}
                      onChange={(e) => handleUpdateSection(idx, "content_ar", e.target.value)}
                      className="w-full bg-white hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-right text-slate-900 focus:outline-none focus:border-[#0F5244] resize-y leading-relaxed font-sans"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Clause Details & Content (English)</label>
                    <textarea
                      rows={4}
                      dir="ltr"
                      value={section.content_en}
                      onChange={(e) => handleUpdateSection(idx, "content_en", e.target.value)}
                      className="w-full bg-white hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-left text-slate-900 focus:outline-none focus:border-[#0F5244] resize-y leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Contact & Support Footer */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0F5244]" />
            <span>{isAr ? "قسم التواصل والاستفسارات القانونية" : "Contact & Support Card"}</span>
          </h3>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 block">عنوان بطاقة الدعم (عربي)</label>
              <input
                type="text"
                dir="rtl"
                value={currentPageData.contactTitle_ar}
                onChange={(e) => updateCurrentPage({ contactTitle_ar: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Support Card Title (English)</label>
              <input
                type="text"
                dir="ltr"
                value={currentPageData.contactTitle_en}
                onChange={(e) => updateCurrentPage({ contactTitle_en: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans"
              />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-800 block">وصف بطاقة الدعم (عربي)</label>
              <textarea
                rows={2}
                dir="rtl"
                value={currentPageData.contactDescription_ar}
                onChange={(e) => updateCurrentPage({ contactDescription_ar: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-semibold text-slate-500 block" dir="ltr">Support Card Description (English)</label>
              <textarea
                rows={2}
                dir="ltr"
                value={currentPageData.contactDescription_en}
                onChange={(e) => updateCurrentPage({ contactDescription_en: e.target.value })}
                className="w-full bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>
          </div>

          <div className="relative z-10 space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-800 block">البريد الإلكتروني للدعم (Support Email)</label>
            <input
              type="email"
              dir="ltr"
              value={currentPageData.contactEmail}
              onChange={(e) => updateCurrentPage({ contactEmail: e.target.value })}
              className="w-full sm:w-80 bg-white/95 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
