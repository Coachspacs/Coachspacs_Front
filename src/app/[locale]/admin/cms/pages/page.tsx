"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  FileText,
  Save,
  Eye,
  CheckCircle2,
  Loader2,
  Plus,
  Sparkles,
  Shield,
  Calendar,
  Mail,
  AlertCircle,
  ChevronsUpDown,
  ExternalLink,
  Check,
  ArrowUpDown,
} from "lucide-react";
import {
  LegalPagesContent,
  LegalPagesDoc,
  LegalSectionData,
} from "@/types/cms";
import { DEFAULT_LEGAL_PAGES } from "@/lib/cmsDefaults";
import { LegalClauseCard } from "@/components/cms/legal/LegalClauseCard";
import { LegalDeleteConfirmModal } from "@/components/cms/legal/LegalDeleteConfirmModal";
import { LegalReorderModal } from "@/components/cms/legal/LegalReorderModal";
import {
  stripLeadingNumber,
  formatLegalDate,
  validateLegalEmail,
  convertBulletTextToHtml,
} from "@/components/cms/legal/legalUtils";

type PageKey = "privacy" | "terms";

export default function CmsLegalPagesEditor() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("cms");

  const [activePage, setActivePage] = useState<PageKey>("privacy");
  const [legalContent, setLegalContent] = useState<LegalPagesContent>(DEFAULT_LEGAL_PAGES);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [legalDoc, setLegalDoc] = useState<LegalPagesDoc | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusToast, setStatusToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Accordion expansion state per page: Record<clauseId, boolean>
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});

  // Modals & Drawers state
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    clauseIndex: number;
    clauseTitle?: string;
  }>({
    isOpen: false,
    clauseIndex: -1,
  });

  // Date settings
  const [autoDateOnPublish, setAutoDateOnPublish] = useState(true);
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => formatLegalDate().iso);

  // Validation & Error tracking
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const firstErrorRef = useRef<HTMLDivElement>(null);

  // Unsaved changes tracking
  const hasUnsavedChanges = useMemo(() => {
    if (!lastSavedContent) return false;
    return JSON.stringify(legalContent) !== lastSavedContent;
  }, [legalContent, lastSavedContent]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load Content on mount
  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.legal) {
          setLegalDoc(json.legal);
          const initialContent: LegalPagesContent =
            json.legal.draft || json.legal.published || DEFAULT_LEGAL_PAGES;

          // Migrate legacy numbers & bullets seamlessly
          const migratedContent: LegalPagesContent = {
            privacy: {
              ...initialContent.privacy,
              sections: (initialContent.privacy.sections || []).map((sec, idx) => ({
                ...sec,
                id: sec.id || `priv-${idx}-${Date.now()}`,
                title_ar: stripLeadingNumber(sec.title_ar),
                title_en: stripLeadingNumber(sec.title_en),
                content_ar: convertBulletTextToHtml(sec.content_ar),
                content_en: convertBulletTextToHtml(sec.content_en),
              })),
            },
            terms: {
              ...initialContent.terms,
              sections: (initialContent.terms.sections || []).map((sec, idx) => ({
                ...sec,
                id: sec.id || `term-${idx}-${Date.now()}`,
                title_ar: stripLeadingNumber(sec.title_ar),
                title_en: stripLeadingNumber(sec.title_en),
                content_ar: convertBulletTextToHtml(sec.content_ar),
                content_en: convertBulletTextToHtml(sec.content_en),
              })),
            },
          };

          setLegalContent(migratedContent);
          setLastSavedContent(JSON.stringify(migratedContent));

          // Expand the first clause by default
          if (migratedContent.privacy.sections.length > 0) {
            setExpandedClauses({ [migratedContent.privacy.sections[0].id]: true });
          }
        }
      } catch (err) {
        console.warn("Failed to load legal content:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, []);

  const currentPageData = legalContent[activePage];

  // Auto-sync real-time edits to localStorage and BroadcastChannel for preview
  useEffect(() => {
    if (isLoading) return;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("coachspace_cms_preview_legal", JSON.stringify(legalContent));
        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel("coachspace_cms_preview");
            bc.postMessage({ type: "PREVIEW_LEGAL_UPDATE", legal: legalContent });
            bc.close();
          }
        } catch {}
      }
    } catch {}
  }, [legalContent, isLoading]);

  const updateCurrentPage = useCallback((updates: Partial<typeof currentPageData>) => {
    setLegalContent((prev) => ({
      ...prev,
      [activePage]: {
        ...prev[activePage],
        ...updates,
      },
    }));
  }, [activePage]);

  // Handle Date picker change
  const handleDateChange = (newIsoDate: string) => {
    setSelectedIsoDate(newIsoDate);
    const formatted = formatLegalDate(newIsoDate);
    updateCurrentPage({
      lastUpdatedDate_ar: formatted.ar,
      lastUpdatedDate_en: formatted.en,
    });
  };

  // Reordering clauses
  const handleReorderClauses = (newSections: LegalSectionData[]) => {
    updateCurrentPage({ sections: newSections });
  };

  // Clause manipulation
  const handleToggleExpandClause = (clauseId: string) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [clauseId]: !prev[clauseId],
    }));
  };

  const handleToggleAllClauses = () => {
    const allExpanded = currentPageData.sections.every(
      (s) => expandedClauses[s.id]
    );
    const newExpandedState: Record<string, boolean> = {};
    currentPageData.sections.forEach((s) => {
      newExpandedState[s.id] = !allExpanded;
    });
    setExpandedClauses(newExpandedState);
  };

  const handleUpdateClause = (
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

  const handleAddClause = (atIndex?: number) => {
    const newClause: LegalSectionData = {
      id: `clause-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      icon: "Shield",
      title_ar: isAr ? "بند قانوني جديد" : "New Legal Clause",
      title_en: "New Legal Clause",
      content_ar: "<p>اكتب نص وبنود هذه السياسة بالتفصيل هنا...</p>",
      content_en: "<p>Write clause rules and policy details here...</p>",
    };

    const currentList = [...currentPageData.sections];
    if (atIndex !== undefined && atIndex >= 0) {
      currentList.splice(atIndex + 1, 0, newClause);
    } else {
      currentList.push(newClause);
    }

    updateCurrentPage({ sections: currentList });
    setExpandedClauses((prev) => ({ ...prev, [newClause.id]: true }));
  };

  const handleDuplicateClause = (index: number) => {
    const source = currentPageData.sections[index];
    if (!source) return;

    const duplicated: LegalSectionData = {
      ...source,
      id: `clause-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title_ar: `${source.title_ar} (${isAr ? "نسخة مكررة" : "Copy"})`,
      title_en: `${source.title_en} (Copy)`,
    };

    const updated = [...currentPageData.sections];
    updated.splice(index + 1, 0, duplicated);
    updateCurrentPage({ sections: updated });
    setExpandedClauses((prev) => ({ ...prev, [duplicated.id]: true }));

    setStatusToast({
      type: "info",
      message: isAr ? "تم تكرار البند بنجاح" : "Clause duplicated successfully",
    });
    setTimeout(() => setStatusToast(null), 3000);
  };

  const handleConfirmDeleteClause = () => {
    const { clauseIndex } = deleteModalState;
    if (clauseIndex < 0 || clauseIndex >= currentPageData.sections.length) return;

    const updated = currentPageData.sections.filter((_, i) => i !== clauseIndex);
    updateCurrentPage({ sections: updated });

    setStatusToast({
      type: "info",
      message: isAr ? "تم حذف البند بنجاح" : "Clause deleted successfully",
    });
    setTimeout(() => setStatusToast(null), 3000);
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Validate Header
    if (!currentPageData.title_ar.trim()) {
      errors.title_ar = isAr ? "عنوان الصفحة بالعربية مطلوب" : "Arabic title is required";
    }
    if (!currentPageData.title_en.trim()) {
      errors.title_en = isAr ? "عنوان الصفحة بالإنجليزية مطلوب" : "English title is required";
    }

    // 2. Validate Email
    const emailCheck = validateLegalEmail(currentPageData.contactEmail || "");
    if (!emailCheck.isValid) {
      errors.contactEmail = isAr ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email format";
    }

    // 3. Validate Clauses
    if (currentPageData.sections.length === 0) {
      errors.sections = isAr ? "يجب إضافة بند قانوني واحد على الأقل" : "At least one clause is required";
    }

    currentPageData.sections.forEach((sec, idx) => {
      if (!sec.title_ar?.trim() || !sec.content_ar?.trim()) {
        errors[`clause_${idx}_ar`] = isAr ? `البند #${idx + 1} يفتقد للعنوان أو النص العربي` : `Clause #${idx + 1} is missing Arabic title or content`;
      }
      if (!sec.title_en?.trim() || !sec.content_en?.trim()) {
        errors[`clause_${idx}_en`] = isAr ? `البند #${idx + 1} يفتقد للعنوان أو النص الإنجليزي` : `Clause #${idx + 1} is missing English title or content`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setStatusToast(null);

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
        setLastSavedContent(JSON.stringify(legalContent));
        setStatusToast({
          type: "success",
          message: isAr ? "تم حفظ المسودة بنجاح" : "Draft saved successfully",
        });
      }
    } catch {
      setStatusToast({
        type: "error",
        message: isAr ? "فشل حفظ المسودة، يرجى إعادة المحاولة" : "Failed to save draft",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusToast(null), 4000);
    }
  };

  // Publish Live
  const handlePublish = async () => {
    const isValid = validateForm();
    if (!isValid) {
      setStatusToast({
        type: "error",
        message: isAr ? "يرجى تعبئة الحقول المطلوبة قبل النشر" : "Please fill in all required fields before publishing",
      });
      firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setStatusToast(null), 5000);
      return;
    }

    setIsPublishing(true);
    setStatusToast(null);

    let contentToPublish = { ...legalContent };

    // Auto-update date to today if toggle is enabled
    if (autoDateOnPublish) {
      const todayFormatted = formatLegalDate(new Date());
      contentToPublish = {
        ...contentToPublish,
        [activePage]: {
          ...contentToPublish[activePage],
          lastUpdatedDate_ar: todayFormatted.ar,
          lastUpdatedDate_en: todayFormatted.en,
        },
      };
      setLegalContent(contentToPublish);
      setSelectedIsoDate(todayFormatted.iso);
    }

    try {
      // 1. Save draft
      await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_legal_draft", data: contentToPublish }),
      });

      // 2. Publish
      const res = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish_legal" }),
      });
      const json = await res.json();
      if (json.success) {
        setLegalDoc(json.legal);
        setLastSavedContent(JSON.stringify(contentToPublish));
        setStatusToast({
          type: "success",
          message: isAr ? "تم نشر السياسات للجمهور بنجاح!" : "Legal policies published live successfully!",
        });
      }
    } catch {
      setStatusToast({
        type: "error",
        message: isAr ? "حدث خطأ أثناء النشر، يرجى المحاولة لاحقاً" : "Publication failed, please try again",
      });
    } finally {
      setIsPublishing(false);
      setTimeout(() => setStatusToast(null), 5000);
    }
  };



  const emailValidation = validateLegalEmail(currentPageData.contactEmail || "");

  const handleLivePreview = (targetLang?: "ar" | "en", e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const selectedLang = targetLang || (locale as "ar" | "en") || "ar";
    const previewUrl =
      activePage === "privacy"
        ? `/${selectedLang}/privacy?preview=true`
        : `/${selectedLang}/terms?preview=true`;

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("coachspace_cms_preview_legal", JSON.stringify(legalContent));
        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel("coachspace_cms_preview");
            bc.postMessage({ type: "PREVIEW_LEGAL_UPDATE", legal: legalContent });
            bc.close();
          }
        } catch {}

        // Also save draft asynchronously so server-side has it
        fetch("/api/cms/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save_legal_draft", data: legalContent }),
        }).catch(() => {});
      }
    } catch {}

    window.open(previewUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 sm:p-20">
        <Loader2 className="w-8 h-8 text-[#0F5244] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans pb-16">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-2.5 px-4 sm:px-6 -mx-4 sm:-mx-6 -mt-2 mb-6 rounded-b-2xl shadow-xs transition-all">
        <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
          {/* Start: Icon, Title & Status Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F5244]" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <h1 className="text-xs sm:text-sm md:text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
                {isAr ? "الصفحات القانونية" : "Legal Pages"}
              </h1>
              {hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/90 text-amber-800 text-[10px] font-bold shrink-0 animate-pulse whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{isAr ? "غير محفوظ" : "Unsaved"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[10px] font-bold shrink-0 whitespace-nowrap">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{isAr ? "محفوظ" : "Saved"}</span>
                </span>
              )}
            </div>
          </div>

          {/* Center: Segmented Tabs (Desktop) */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setActivePage("privacy")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePage === "privacy"
                  ? "bg-white text-[#0F5244] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage("terms")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePage === "terms"
                  ? "bg-white text-[#0F5244] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{isAr ? "شروط الاستخدام" : "Terms of Service"}</span>
            </button>
          </div>

          {/* End: Actions Toolbar (Preview & Save Changes) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Public Live Preview Button */}
            <button
              type="button"
              onClick={(e) => handleLivePreview(locale as "ar" | "en", e)}
              aria-label={isAr ? "معاينة الصفحة" : "Preview Page"}
              title={isAr ? "معاينة الصفحة للجمهور في تبويب جديد" : "Preview live page in new tab"}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? "معاينة" : "Preview"}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Primary Save Changes Button */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isSaving}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span>{isAr ? "حفظ التعديلات" : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Tab Switcher Underneath */}
        <div className="flex md:hidden items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 mt-2">
          <button
            type="button"
            onClick={() => setActivePage("privacy")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePage === "privacy"
                ? "bg-white text-[#0F5244] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#0F5244]" />
            <span>{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePage("terms")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePage === "terms"
                ? "bg-white text-[#0F5244] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#0F5244]" />
            <span>{isAr ? "شروط الاستخدام" : "Terms of Service"}</span>
          </button>
        </div>
      </div>


      {/* Floating Status Toast */}
      {statusToast && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 ${
            statusToast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : statusToast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[#0F5244] shrink-0" />
            ) : statusToast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-slate-600 shrink-0" />
            )}
            <span>{statusToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Editor Body Form */}
      <div className="space-y-6">
        {/* ============================================================ */}
        {/* 1. Header & Meta Section */}
        {/* ============================================================ */}
        <div
          ref={validationErrors.title_ar || validationErrors.title_en ? firstErrorRef : undefined}
          className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F5244]" />
              <span>{isAr ? "العناوين الرئيسية والشارة" : "Page Header & Metadata"}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {activePage === "privacy"
                ? (isAr ? "سياسة الخصوصية" : "Privacy Policy")
                : (isAr ? "شروط الاستخدام" : "Terms of Service")}
            </span>
          </div>

          {/* Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-900 block">
                {isAr ? "الشارة العلوية (عربي)" : "Top Badge (Arabic)"}
              </label>
              <input
                type="text"
                dir="rtl"
                value={currentPageData.badge_ar}
                onChange={(e) => updateCurrentPage({ badge_ar: e.target.value })}
                placeholder="مثال: الخصوصية أولويتنا"
                className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold"
              />
              <p className="text-[10px] text-slate-400">
                {isAr ? "نص الشارة المعروضة أعلى عنوان الصفحة" : "Small label shown above the page title"}
              </p>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-900 block" dir="ltr">
                Top Badge (English)
              </label>
              <input
                type="text"
                dir="ltr"
                value={currentPageData.badge_en}
                onChange={(e) => updateCurrentPage({ badge_en: e.target.value })}
                placeholder="e.g. Privacy First"
                className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold"
              />
              <p className="text-[10px] text-slate-400">
                Label displayed inside the highlighted badge pill
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-900 block">
                {isAr ? "عنوان الصفحة الرئيسي (عربي)" : "Page Title (Arabic)"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                dir="rtl"
                value={currentPageData.title_ar}
                onChange={(e) => updateCurrentPage({ title_ar: e.target.value })}
                placeholder="مثال: سياسة الخصوصية"
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-black text-sm ${
                  validationErrors.title_ar ? "border-rose-300 bg-rose-50/20" : "border-slate-200/90"
                }`}
              />
              {validationErrors.title_ar && (
                <span className="text-[10px] font-bold text-rose-600 block">{validationErrors.title_ar}</span>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-900 block" dir="ltr">
                Page Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                value={currentPageData.title_en}
                onChange={(e) => updateCurrentPage({ title_en: e.target.value })}
                placeholder="e.g. Privacy Policy"
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-black text-sm ${
                  validationErrors.title_en ? "border-rose-300 bg-rose-50/20" : "border-slate-200/90"
                }`}
              />
              {validationErrors.title_en && (
                <span className="text-[10px] font-bold text-rose-600 block">{validationErrors.title_en}</span>
              )}
            </div>
          </div>

          {/* Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-900 block">
                {isAr ? "الوصف التمهيدي (عربي)" : "Subtitle (Arabic)"}
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={currentPageData.subtitle_ar}
                onChange={(e) => updateCurrentPage({ subtitle_ar: e.target.value })}
                placeholder="شرح موجز عن أهداف الصفحة والسياسة..."
                className="w-full bg-white border border-slate-200/90 rounded-xl p-3 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-900 block" dir="ltr">
                Subtitle (English)
              </label>
              <textarea
                rows={2}
                dir="ltr"
                value={currentPageData.subtitle_en}
                onChange={(e) => updateCurrentPage({ subtitle_en: e.target.value })}
                placeholder="Brief summary introducing the legal document..."
                className="w-full bg-white border border-slate-200/90 rounded-xl p-3 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Single Unified Date Picker */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-[#0F5244] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 block">
                    {isAr ? "تاريخ آخر تحديث الموحد" : "Unified Last Updated Date"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isAr
                      ? "يتم التنسيق التلقائي بالعربية والإنجليزية لتفادي أي تعارض"
                      : "Automatically formatted for Arabic and English to keep both in sync"}
                  </p>
                </div>
              </div>

              {/* Auto update toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoDateOnPublish}
                  onChange={(e) => setAutoDateOnPublish(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F5244] focus:ring-[#0F5244] accent-[#0F5244] cursor-pointer"
                />
                <span>{isAr ? "تحديث التاريخ تلقائياً عند كل نشر" : "Auto-set to today on publish"}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  {isAr ? "اختر التاريخ" : "Select Date"}
                </label>
                <input
                  type="date"
                  value={selectedIsoDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0F5244] cursor-pointer"
                />
              </div>

              {/* Arabic Auto Formatted Display */}
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-500 block">الصيغة العربية الناتجة:</span>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-right">
                  {currentPageData.lastUpdatedDate_ar || formatLegalDate(selectedIsoDate).ar}
                </div>
              </div>

              {/* English Auto Formatted Display */}
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-slate-500 block">Formatted English Preview:</span>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-left" dir="ltr">
                  {currentPageData.lastUpdatedDate_en || formatLegalDate(selectedIsoDate).en}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. Clauses & Sections List */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-100">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    {isAr ? "بنود وأقسام الصفحة" : "Page Clauses & Rules"}
                  </h2>
                  <span className="text-xs font-bold text-[#0F5244] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80">
                    {currentPageData.sections.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr
                    ? "انقر على أي بطاقة لفتحها وتعديل محتواها أو استخدم نافذة إعادة الترتيب"
                    : "Click any card to expand and edit, or use the reorder modal"}
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Reorder Clauses Modal Button */}
              <button
                type="button"
                onClick={() => setIsReorderModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0F5244] border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title={isAr ? "إعادة ترتيب وتنظيم البنود في نافذة مخصصة" : "Reorder & Organize Clauses"}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#0F5244]" />
                <span>{isAr ? "إعادة ترتيب البنود" : "Reorder Clauses"}</span>
              </button>

              {/* Expand / Collapse All Toggle */}
              <button
                type="button"
                onClick={handleToggleAllClauses}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span>{isAr ? "طي / توسيع الكل" : "Expand/Collapse All"}</span>
              </button>

              {/* Add Top Button */}
              <button
                type="button"
                onClick={() => handleAddClause()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? "إضافة بند جديد" : "Add Clause"}</span>
              </button>
            </div>
          </div>

          {/* Clean List of Clauses */}
          <div className="space-y-4">
            {currentPageData.sections.map((clause, idx) => {
              const hasClauseError = Boolean(
                validationErrors[`clause_${idx}_ar`] || validationErrors[`clause_${idx}_en`]
              );

              return (
                <LegalClauseCard
                  key={clause.id || idx}
                  clause={clause}
                  index={idx}
                  totalClauses={currentPageData.sections.length}
                  isExpanded={Boolean(expandedClauses[clause.id])}
                  onToggleExpand={() => handleToggleExpandClause(clause.id)}
                  onUpdate={(field, val) => handleUpdateClause(idx, field, val)}
                  onDuplicate={() => handleDuplicateClause(idx)}
                  onDeleteRequest={() =>
                    setDeleteModalState({
                      isOpen: true,
                      clauseIndex: idx,
                      clauseTitle: isAr ? clause.title_ar : clause.title_en,
                    })
                  }
                  isAr={isAr}
                  hasErrors={hasClauseError}
                />
              );
            })}
          </div>

          {/* Second Add Button at Bottom */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleAddClause()}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-[#0F5244] bg-emerald-50/30 hover:bg-emerald-50/70 text-[#0F5244] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة بند قانوني جديد أسفل القائمة" : "Add New Clause to Bottom"}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. Support & Contact Card Section */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0F5244]" />
              <span>{isAr ? "قسم التواصل والاستفسارات القانونية" : "Contact & Support Card"}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {isAr ? "معلومات التواصل في أسفل الصفحة" : "Page Footer Contact Info"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-900 block">
                {isAr ? "عنوان بطاقة الدعم (عربي)" : "Support Title (Arabic)"}
              </label>
              <input
                type="text"
                dir="rtl"
                value={currentPageData.contactTitle_ar}
                onChange={(e) => updateCurrentPage({ contactTitle_ar: e.target.value })}
                placeholder="مثال: لديك استفسار قانوني؟"
                className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-900 block" dir="ltr">
                Support Title (English)
              </label>
              <input
                type="text"
                dir="ltr"
                value={currentPageData.contactTitle_en}
                onChange={(e) => updateCurrentPage({ contactTitle_en: e.target.value })}
                placeholder="e.g. Have a Legal Question?"
                className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-900 block">
                {isAr ? "وصف بطاقة الدعم (عربي)" : "Support Description (Arabic)"}
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={currentPageData.contactDescription_ar}
                onChange={(e) => updateCurrentPage({ contactDescription_ar: e.target.value })}
                placeholder="تواصل مع فريق الشؤون القانونية لأي استفسارات..."
                className="w-full bg-white border border-slate-200/90 rounded-xl p-3 text-xs text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-900 block" dir="ltr">
                Support Description (English)
              </label>
              <textarea
                rows={2}
                dir="ltr"
                value={currentPageData.contactDescription_en}
                onChange={(e) => updateCurrentPage({ contactDescription_en: e.target.value })}
                placeholder="Contact our legal compliance team for any clarifications..."
                className="w-full bg-white border border-slate-200/90 rounded-xl p-3 text-xs text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all font-sans leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Email with validation & domain hint */}
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-bold text-slate-900 block">
              {isAr ? "البريد الإلكتروني المعتمد للدعم القانوني" : "Support & Legal Email"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              dir="ltr"
              value={currentPageData.contactEmail}
              onChange={(e) => updateCurrentPage({ contactEmail: e.target.value })}
              placeholder="e.g. legal@coachspace.com"
              className={`w-full sm:w-96 bg-white border rounded-xl px-3.5 py-2.5 text-xs text-left text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20 transition-all ${
                validationErrors.contactEmail ? "border-rose-300 bg-rose-50/20" : "border-slate-200/90"
              }`}
            />
            {validationErrors.contactEmail ? (
              <p className="text-[10px] font-bold text-rose-600">{validationErrors.contactEmail}</p>
            ) : !emailValidation.isBranded && currentPageData.contactEmail ? (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px] font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{t("pages.support.emailBrandedWarning")}</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400">
                {t("pages.support.emailHint")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reorder Clauses Modal */}
      <LegalReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        sections={currentPageData.sections}
        onApply={(newSections) => {
          updateCurrentPage({ sections: newSections });
          setStatusToast({
            type: "success",
            message: isAr ? "تم تطبيق الترتيب الجديد للبنود بنجاح" : "Clauses reordered successfully",
          });
          setTimeout(() => setStatusToast(null), 3000);
        }}
        isAr={isAr}
      />

      {/* Delete Confirmation Modal */}
      <LegalDeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, clauseIndex: -1 })}
        onConfirm={handleConfirmDeleteClause}
        clauseIndex={deleteModalState.clauseIndex}
        clauseTitle={deleteModalState.clauseTitle}
        isAr={isAr}
      />
    </div>
  );
}
