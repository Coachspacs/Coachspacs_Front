"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

  const [activePage, setActivePage] = useState<PageKey>("privacy");
  const [legalContent, setLegalContent] = useState<LegalPagesContent>(DEFAULT_LEGAL_PAGES);
  const [legalDoc, setLegalDoc] = useState<LegalPagesDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
        setStatusMessage(
          isAr
            ? "تم حفظ مسودة الصفحات القانونية بنجاح! يمكنك الآن معاينتها."
            : "Draft saved successfully! You can preview it before publishing."
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
        setStatusMessage(
          isAr
            ? "تم نشر الصفحات القانونية بنجاح وأصبحت مباشرة على الموقع العام!"
            : "Legal pages published successfully to the live platform!"
        );
      }
    } catch (e) {
      setStatusMessage(isAr ? "حدث خطأ أثناء النشر" : "Error publishing");
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
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const publicPreviewUrl =
    activePage === "privacy"
      ? `/${locale}/privacy-policy?preview=true`
      : `/${locale}/terms-of-service?preview=true`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* Header with sticky action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? "إدارة السياسات والاتفاقيات" : "Legal Content Studio"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isAr ? "تحرير الصفحات القانونية" : "Legal & Policy Pages"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={publicPreviewUrl}
            target="_blank"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer border border-slate-700"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{isAr ? "معاينة الصفحة" : "Preview Page"}</span>
          </Link>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isAr ? "حفظ كمسودة" : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 rtl:rotate-180" />
            )}
            <span>{isAr ? "نشر التعديلات" : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Page Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActivePage("privacy")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activePage === "privacy"
              ? "bg-purple-600 text-white shadow-md shadow-purple-950/40"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{isAr ? "سياسة الخصوصية (Privacy Policy)" : "Privacy Policy"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePage("terms")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activePage === "terms"
              ? "bg-purple-600 text-white shadow-md shadow-purple-950/40"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isAr ? "شروط الاستخدام (Terms of Service)" : "Terms of Service"}</span>
        </button>
      </div>

      {/* Editor Main Content */}
      <div className="space-y-8">
        {/* Section 1: Page Header & Meta */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{isAr ? "العناوين الرئيسية والشارة" : "Header & Metadata"}</span>
          </h3>

          {/* Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">الشارة العلوية (عربي)</label>
              <input
                type="text"
                value={currentPageData.badge_ar}
                onChange={(e) => updateCurrentPage({ badge_ar: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Badge Text (EN)</label>
              <input
                type="text"
                value={currentPageData.badge_en}
                onChange={(e) => updateCurrentPage({ badge_en: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">عنوان الصفحة الرئيسي (عربي)</label>
              <input
                type="text"
                value={currentPageData.title_ar}
                onChange={(e) => updateCurrentPage({ title_ar: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Page Title (EN)</label>
              <input
                type="text"
                value={currentPageData.title_en}
                onChange={(e) => updateCurrentPage({ title_en: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">الوصف التمهيدي (عربي)</label>
              <textarea
                rows={2}
                value={currentPageData.subtitle_ar}
                onChange={(e) => updateCurrentPage({ subtitle_ar: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Page Subtitle (EN)</label>
              <textarea
                rows={2}
                value={currentPageData.subtitle_en}
                onChange={(e) => updateCurrentPage({ subtitle_en: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          {/* Last Updated Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">تاريخ آخر تحديث (عربي)</label>
              <input
                type="text"
                value={currentPageData.lastUpdatedDate_ar}
                onChange={(e) => updateCurrentPage({ lastUpdatedDate_ar: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Last Updated Date (EN)</label>
              <input
                type="text"
                value={currentPageData.lastUpdatedDate_en}
                onChange={(e) => updateCurrentPage({ lastUpdatedDate_en: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Policy & Terms Clauses / Sections */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>{isAr ? "بنود وأقسام الصفحة" : "Page Sections & Clauses"}</span>
              <span className="text-xs font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                {currentPageData.sections.length}
              </span>
            </h3>

            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "إضافة قسم جديد" : "Add Section"}</span>
            </button>
          </div>

          <div className="space-y-6">
            {currentPageData.sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-300 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {section.title_ar || section.title_en || (isAr ? "قسم بدون عنوان" : "Untitled")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Icon selector */}
                    <select
                      value={section.icon || "Shield"}
                      onChange={(e) => handleUpdateSection(idx, "icon", e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-500"
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
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title={isAr ? "حذف هذا القسم" : "Delete section"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">عنوان البند (عربي)</label>
                    <input
                      type="text"
                      value={section.title_ar}
                      onChange={(e) => handleUpdateSection(idx, "title_ar", e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">Clause Title (EN)</label>
                    <input
                      type="text"
                      value={section.title_en}
                      onChange={(e) => handleUpdateSection(idx, "title_en", e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Section Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">نص البند والتفاصيل (عربي)</label>
                    <textarea
                      rows={4}
                      value={section.content_ar}
                      onChange={(e) => handleUpdateSection(idx, "content_ar", e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-y leading-relaxed font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">Clause Details & Content (EN)</label>
                    <textarea
                      rows={4}
                      value={section.content_en}
                      onChange={(e) => handleUpdateSection(idx, "content_en", e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-y leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Contact & Support Footer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            <span>{isAr ? "قسم التواصل والاستفسارات القانونية" : "Contact & Support Card"}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">عنوان بطاقة الدعم (عربي)</label>
              <input
                type="text"
                value={currentPageData.contactTitle_ar}
                onChange={(e) => updateCurrentPage({ contactTitle_ar: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Support Card Title (EN)</label>
              <input
                type="text"
                value={currentPageData.contactTitle_en}
                onChange={(e) => updateCurrentPage({ contactTitle_en: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">وصف بطاقة الدعم (عربي)</label>
              <textarea
                rows={2}
                value={currentPageData.contactDescription_ar}
                onChange={(e) => updateCurrentPage({ contactDescription_ar: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Support Card Description (EN)</label>
              <textarea
                rows={2}
                value={currentPageData.contactDescription_en}
                onChange={(e) => updateCurrentPage({ contactDescription_en: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">البريد الإلكتروني للدعم (Support Email)</label>
            <input
              type="email"
              value={currentPageData.contactEmail}
              onChange={(e) => updateCurrentPage({ contactEmail: e.target.value })}
              className="w-full sm:w-80 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
