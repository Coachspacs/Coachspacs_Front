"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Globe,
  GraduationCap,
  UserCheck,
  CheckCircle,
  Filter,
  X,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import {
  LandingSectionsData,
  LandingPageDoc,
  LandingSectionKey,
} from "@/types/cms";
import { DEFAULT_LANDING_SECTIONS, DEFAULT_SECTION_ORDER } from "@/lib/cmsDefaults";
import { SectionReorderDrawer } from "@/components/cms/SectionReorderDrawer";
import { CmsImageUpload } from "@/components/cms/CmsImageUpload";

type TabKey =
  | "hero"
  | "top_categories"
  | "master_craft"
  | "why_stands_out"
  | "real_stories"
  | "faq"
  | "join_future";

type TargetAudienceView = "guest" | "student" | "instructor";

interface TabDefinition {
  key: TabKey;
  icon: any;
  allowedViews: TargetAudienceView[];
  labels: {
    guest: { ar: string; en: string };
    student: { ar: string; en: string };
    instructor: { ar: string; en: string };
  };
  descriptions: {
    ar: string;
    en: string;
  };
}

const ALL_TABS: TabDefinition[] = [
  {
    key: "hero",
    icon: Sparkles,
    allowedViews: ["guest", "student", "instructor"],
    labels: {
      guest: { ar: "الواجهة الرئيسية", en: "Hero Banner" },
      student: { ar: "ترحيب ومسار الطالب", en: "Student Welcome" },
      instructor: { ar: "واجهة وترحيب المدرب", en: "Instructor Hero" },
    },
    descriptions: {
      ar: "واجهة الصفحة الرئيسية مع العنوان العريض، الشارات، الأزرار، وصورة البانر",
      en: "Main landing header with title, badges, action buttons, and hero image",
    },
  },
  {
    key: "top_categories",
    icon: Layers,
    allowedViews: ["guest", "student", "instructor"],
    labels: {
      guest: { ar: "أبرز المجالات", en: "Top Categories" },
      student: { ar: "مسارات التعلم والتخصصات", en: "Learning Tracks" },
      instructor: { ar: "تخصصات التدريس الأكثر طلباً", en: "High-Demand Disciplines" },
    },
    descriptions: {
      ar: "عرض مسارات التخصص والتصنيفات الأكثر طلباً لاكتشاف الدورات والتدريس",
      en: "Highlight popular course categories and teaching disciplines",
    },
  },
  {
    key: "master_craft",
    icon: Compass,
    allowedViews: ["guest", "student", "instructor"],
    labels: {
      guest: { ar: "إتقان المهارات", en: "Master Your Craft" },
      student: { ar: "تطوير المهارات والمشاريع", en: "Skill Mastery" },
      instructor: { ar: "أدوات وتقنيات التدريب", en: "Teaching Tools & Craft" },
    },
    descriptions: {
      ar: "مميزات التعلم التطبيقي، أدوات الاستوديو، والمشاريع والشهادات المعتمدة",
      en: "Focus on studio tools, verified credentials, and real-world projects",
    },
  },
  {
    key: "why_stands_out",
    icon: Award,
    allowedViews: ["guest", "student", "instructor"],
    labels: {
      guest: { ar: "لماذا كوتش سبيس", en: "Why Coach Space" },
      student: { ar: "مزايا تجربة التعلم", en: "Student Perks" },
      instructor: { ar: "مزايا التدريس بالمنصة", en: "Why Teach with Us" },
    },
    descriptions: {
      ar: "المزايا التنافسية والقيم الفارقة لمنظومة كوتش سبيس",
      en: "Key competitive advantages and platform value propositions",
    },
  },
  {
    key: "real_stories",
    icon: MessageSquare,
    allowedViews: ["guest", "student", "instructor"],
    labels: {
      guest: { ar: "قصص النجاح", en: "Success Stories" },
      student: { ar: "تجارب وقصص الزملاء", en: "Peer Testimonials" },
      instructor: { ar: "قصص وتجارب المدربين", en: "Instructor Success Stories" },
    },
    descriptions: {
      ar: "تقييمات وآراء الطلاب وقصص نجاح المدربين والخريجين المعتمدين",
      en: "Student ratings, instructor journeys, and success achievements",
    },
  },
  {
    key: "faq",
    icon: HelpCircle,
    allowedViews: ["guest", "student", "instructor"],
    labels: {
      guest: { ar: "الأسئلة الشائعة العامة", en: "General FAQs" },
      student: { ar: "أسئلة واستفسارات الطلاب", en: "Student FAQs" },
      instructor: { ar: "الأسئلة الشائعة للمدربين", en: "Instructor FAQs" },
    },
    descriptions: {
      ar: "إجابات الأسئلة المتكررة والتوضيحات الأساسية حول المنصة والمدفوعات",
      en: "Frequently asked questions and essential answers",
    },
  },
  {
    key: "join_future",
    icon: FileText,
    allowedViews: ["guest", "student", "instructor"],
    labels: {
      guest: { ar: "دعوة الانضمام كمدرب", en: "Become Instructor CTA" },
      student: { ar: "دعوة التدريس ومشاركة الخبرات", en: "Start Teaching CTA" },
      instructor: { ar: "دعوة إطلاق الدورة القادمة", en: "Launch Next Course CTA" },
    },
    descriptions: {
      ar: "شريط الدعوة الموجه لاتخاذ الخطوة القادمة وبدء التعلم أو التدريس",
      en: "Final call-to-action banner inviting users to take their next career leap",
    },
  },
];

// Framer-motion entrance animation variants for Step 1 cards
const audienceContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const audienceCardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

// Reusable clean Bilingual Input Component with refined modern aesthetics
function BilingualInput({
  labelAr,
  labelEn,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  placeholderAr,
  placeholderEn,
  highlight = false,
}: {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  onChangeAr: (val: string) => void;
  onChangeEn: (val: string) => void;
  placeholderAr?: string;
  placeholderEn?: string;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5 text-right">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-slate-800 tracking-tight">{labelAr}</label>
          <span className="px-2 py-0.5 rounded-md text-xs font-black bg-slate-50 text-brand-dark border border-slate-200/80 shadow-2xs select-none tracking-wide">
            عربي
          </span>
        </div>
        <input
          type="text"
          dir="rtl"
          value={valueAr || ""}
          onChange={(e) => onChangeAr(e.target.value)}
          placeholder={placeholderAr}
          className={`w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 hover:border-slate-300 focus:border-brand-dark focus:ring-3 focus:ring-brand-dark/15 rounded-xl px-3.5 py-2.5 text-sm text-right placeholder:text-slate-400 shadow-2xs focus:shadow-xs transition-all duration-200 font-sans outline-none ${
            highlight ? "text-brand-dark font-black bg-slate-50/20 border-slate-200" : "text-slate-900"
          }`}
        />
      </div>

      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between gap-2" dir="ltr">
          <label className="text-sm font-bold text-slate-800 tracking-tight">{labelEn}</label>
          <span className="px-2 py-0.5 rounded-md text-xs font-black bg-slate-100 text-slate-600 border border-slate-200/90 shadow-2xs select-none tracking-wide">
            EN
          </span>
        </div>
        <input
          type="text"
          dir="ltr"
          value={valueEn || ""}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholderEn}
          className={`w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 hover:border-slate-300 focus:border-brand-dark focus:ring-3 focus:ring-brand-dark/15 rounded-xl px-3.5 py-2.5 text-sm text-left placeholder:text-slate-400 shadow-2xs focus:shadow-xs transition-all duration-200 font-sans outline-none ${
            highlight ? "text-brand-dark font-black bg-slate-50/20 border-slate-200" : "text-slate-900"
          }`}
        />
      </div>
    </div>
  );
}

// Reusable clean Bilingual Textarea Component with refined modern aesthetics
function BilingualTextarea({
  labelAr,
  labelEn,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  placeholderAr,
  placeholderEn,
  rows = 3,
}: {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  onChangeAr: (val: string) => void;
  onChangeEn: (val: string) => void;
  placeholderAr?: string;
  placeholderEn?: string;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5 text-right">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-slate-800 tracking-tight">{labelAr}</label>
          <span className="px-2 py-0.5 rounded-md text-xs font-black bg-slate-50 text-brand-dark border border-slate-200/80 shadow-2xs select-none tracking-wide">
            عربي
          </span>
        </div>
        <textarea
          rows={rows}
          dir="rtl"
          value={valueAr || ""}
          onChange={(e) => onChangeAr(e.target.value)}
          placeholder={placeholderAr}
          className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 hover:border-slate-300 focus:border-brand-dark focus:ring-3 focus:ring-brand-dark/15 rounded-xl px-3.5 py-2.5 text-sm text-right text-slate-900 placeholder:text-slate-400 shadow-2xs focus:shadow-xs transition-all duration-200 font-sans leading-relaxed resize-y outline-none"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between gap-2" dir="ltr">
          <label className="text-sm font-bold text-slate-800 tracking-tight">{labelEn}</label>
          <span className="px-2 py-0.5 rounded-md text-xs font-black bg-slate-100 text-slate-600 border border-slate-200/90 shadow-2xs select-none tracking-wide">
            EN
          </span>
        </div>
        <textarea
          rows={rows}
          dir="ltr"
          value={valueEn || ""}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholderEn}
          className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 hover:border-slate-300 focus:border-brand-dark focus:ring-3 focus:ring-brand-dark/15 rounded-xl px-3.5 py-2.5 text-sm text-left text-slate-900 placeholder:text-slate-400 shadow-2xs focus:shadow-xs transition-all duration-200 font-sans leading-relaxed resize-y outline-none"
        />
      </div>
    </div>
  );
}

function mergeLandingViewWithDefaults(
  savedView: Partial<LandingSectionsData> | undefined,
  defaultView: LandingSectionsData
): LandingSectionsData {
  if (!savedView) return defaultView;
  return {
    ...defaultView,
    ...savedView,
    hero: {
      ...defaultView.hero,
      ...(savedView.hero || {}),
      title_ar: savedView.hero?.title_ar || defaultView.hero.title_ar,
      title_en: savedView.hero?.title_en || defaultView.hero.title_en,
      is_visible: savedView.hero?.is_visible !== undefined ? savedView.hero.is_visible : defaultView.hero.is_visible,
    },
    top_categories: {
      ...defaultView.top_categories,
      ...(savedView.top_categories || {}),
      title_ar: savedView.top_categories?.title_ar || defaultView.top_categories.title_ar,
      title_en: savedView.top_categories?.title_en || defaultView.top_categories.title_en,
      is_visible: savedView.top_categories?.is_visible !== undefined ? savedView.top_categories.is_visible : defaultView.top_categories.is_visible,
    },
    master_craft: {
      ...defaultView.master_craft,
      ...(savedView.master_craft || {}),
      heading_ar: savedView.master_craft?.heading_ar || defaultView.master_craft.heading_ar,
      heading_en: savedView.master_craft?.heading_en || defaultView.master_craft.heading_en,
      features: (savedView.master_craft?.features && savedView.master_craft.features.length > 0) ? savedView.master_craft.features : defaultView.master_craft.features,
      is_visible: savedView.master_craft?.is_visible !== undefined ? savedView.master_craft.is_visible : defaultView.master_craft.is_visible,
    },
    why_stands_out: {
      ...defaultView.why_stands_out,
      ...(savedView.why_stands_out || {}),
      title_ar: savedView.why_stands_out?.title_ar || defaultView.why_stands_out.title_ar,
      title_en: savedView.why_stands_out?.title_en || defaultView.why_stands_out.title_en,
      cards: (savedView.why_stands_out?.cards && savedView.why_stands_out.cards.length > 0) ? savedView.why_stands_out.cards : defaultView.why_stands_out.cards,
      is_visible: savedView.why_stands_out?.is_visible !== undefined ? savedView.why_stands_out.is_visible : defaultView.why_stands_out.is_visible,
    },
    real_stories: {
      ...defaultView.real_stories,
      ...(savedView.real_stories || {}),
      title_ar: savedView.real_stories?.title_ar || defaultView.real_stories.title_ar,
      title_en: savedView.real_stories?.title_en || defaultView.real_stories.title_en,
      testimonials: (savedView.real_stories?.testimonials && savedView.real_stories.testimonials.length >= 3) ? savedView.real_stories.testimonials : defaultView.real_stories.testimonials,
      is_visible: savedView.real_stories?.is_visible !== undefined ? savedView.real_stories.is_visible : defaultView.real_stories.is_visible,
    },
    faq: {
      ...defaultView.faq,
      ...(savedView.faq || {}),
      items: (savedView.faq?.items && savedView.faq.items.length > 0) ? savedView.faq.items : defaultView.faq.items,
      is_visible: savedView.faq?.is_visible !== undefined ? savedView.faq.is_visible : defaultView.faq.is_visible,
    },
    join_future: {
      ...defaultView.join_future,
      ...(savedView.join_future || {}),
      title_ar: savedView.join_future?.title_ar || defaultView.join_future.title_ar,
      title_en: savedView.join_future?.title_en || defaultView.join_future.title_en,
      is_visible: savedView.join_future?.is_visible !== undefined ? savedView.join_future.is_visible : defaultView.join_future.is_visible,
    },
    section_order: (savedView.section_order && savedView.section_order.length >= 6) ? savedView.section_order : defaultView.section_order,
  };
}

export default function LandingEditorPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("cms");

  const [targetView, setTargetView] = useState<TargetAudienceView>("guest");
  const [activeTab, setActiveTab] = useState<TabKey>("hero");

  const defaultGuest = DEFAULT_LANDING_SECTIONS.views?.guest || DEFAULT_LANDING_SECTIONS;
  const defaultStudent = DEFAULT_LANDING_SECTIONS.views?.student || DEFAULT_LANDING_SECTIONS;
  const defaultInstructor = DEFAULT_LANDING_SECTIONS.views?.instructor || DEFAULT_LANDING_SECTIONS;

  const [allViewsData, setAllViewsData] = useState<Record<TargetAudienceView, LandingSectionsData>>({
    guest: defaultGuest,
    student: defaultStudent,
    instructor: defaultInstructor,
  });

  // Current view's section data being actively edited
  const sections: LandingSectionsData = allViewsData[targetView] || allViewsData.guest;

  // Scoped setter that updates only the current audience view's data
  const setSections = (
    updater:
      | LandingSectionsData
      | ((prev: LandingSectionsData) => LandingSectionsData)
  ) => {
    setAllViewsData((prev) => {
      const current = prev[targetView] || prev.guest;
      const updated = typeof updater === "function" ? updater(current) : updater;
      return {
        ...prev,
        [targetView]: updated,
      };
    });
  };

  const [landingDoc, setLandingDoc] = useState<LandingPageDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  const sectionDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sectionDropdownRef.current &&
        !sectionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSectionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to compile a full backward-compatible LandingSectionsData document containing isolated views
  const getFullCombinedPayload = (viewsMap: Record<TargetAudienceView, LandingSectionsData>): LandingSectionsData => {
    return {
      ...viewsMap.guest, // Backward compatibility for legacy top-level consumer components
      views: {
        guest: viewsMap.guest,
        student: viewsMap.student,
        instructor: viewsMap.instructor,
      },
    };
  };

  // Helper to persist draft to backend immediately
  const saveDraftToServer = async (dataToSave?: LandingSectionsData) => {
    setIsSaving(true);
    const payload = dataToSave || getFullCombinedPayload(allViewsData);
    try {
      const res = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          data: payload,
        }),
      });
      const json = await res.json();
      if (json.success && json.landing) {
        setLandingDoc(json.landing);
      }
    } catch (e) {
      console.error("Auto save draft failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOrder = async (newOrder: LandingSectionKey[]) => {
    const updatedSections: LandingSectionsData = {
      ...sections,
      section_order: newOrder,
    };
    const newAllViews = {
      ...allViewsData,
      [targetView]: updatedSections,
    };
    setAllViewsData(newAllViews);
    setStatusMessage(t("landing.orderUpdated"));
    await saveDraftToServer(getFullCombinedPayload(newAllViews));
  };

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.landing) {
          setLandingDoc(json.landing);
          const rawDoc: LandingSectionsData =
            json.landing.draft || json.landing.published || DEFAULT_LANDING_SECTIONS;

          const defGuest = DEFAULT_LANDING_SECTIONS.views?.guest || DEFAULT_LANDING_SECTIONS;
          const defStudent = DEFAULT_LANDING_SECTIONS.views?.student || DEFAULT_LANDING_SECTIONS;
          const defInstructor = DEFAULT_LANDING_SECTIONS.views?.instructor || DEFAULT_LANDING_SECTIONS;

          const loadedViews: Record<TargetAudienceView, LandingSectionsData> = {
            guest: mergeLandingViewWithDefaults(rawDoc.views?.guest || rawDoc, defGuest),
            student: mergeLandingViewWithDefaults(rawDoc.views?.student, defStudent),
            instructor: mergeLandingViewWithDefaults(rawDoc.views?.instructor, defInstructor),
          };

          setAllViewsData(loadedViews);
        }
      } catch (err) {
        console.warn("Failed to load landing sections:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, []);

  // Real-time synchronization to localStorage and BroadcastChannel for instant live preview
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      const combined = getFullCombinedPayload(allViewsData);
      try {
        localStorage.setItem("coachspace_cms_preview_landing", JSON.stringify(combined));
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("coachspace_cms_preview");
          bc.postMessage({ type: "PREVIEW_LANDING_UPDATE", sections: combined, view: targetView });
          bc.close();
        }
      } catch (err) {
        console.warn("Failed to sync landing preview to localStorage:", err);
      }

      // Debounced auto-save draft to backend (400ms)
      const timer = setTimeout(() => {
        saveDraftToServer(combined);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [allViewsData, targetView, isLoading]);

  const handleSaveDraft = async () => {
    const combined = getFullCombinedPayload(allViewsData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("coachspace_cms_preview_landing", JSON.stringify(combined));
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("coachspace_cms_preview");
          bc.postMessage({ type: "PREVIEW_LANDING_UPDATE", sections: combined, view: targetView });
          bc.close();
        }
      } catch {}
    }
    await saveDraftToServer(combined);
    setStatusMessage(t("landing.draftSaved"));
  };

  const handleOpenPreviewTab = async () => {
    const combined = getFullCombinedPayload(allViewsData);
    // 1. Immediately cache in localStorage & broadcast to any open preview tab
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("coachspace_cms_preview_landing", JSON.stringify(combined));
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("coachspace_cms_preview");
          bc.postMessage({ type: "PREVIEW_LANDING_UPDATE", sections: combined, view: targetView });
          bc.close();
        }
      } catch (err) {
        console.warn("Failed broadcasting preview update:", err);
      }
    }

    // 2. Sync current React state to server draft before launching preview tab
    await saveDraftToServer(combined);

    // 3. Launch live preview in target audience mode
    window.open(
      `/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}&view=${targetView}&t=${Date.now()}`,
      "_blank"
    );
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const combined = getFullCombinedPayload(allViewsData);
      await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_draft", data: combined }),
      });

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

  // Helper to check if a section is active for a given audience view
  const isSectionActiveForData = (
    sectionsData: LandingSectionsData,
    key: TabKey,
    view: TargetAudienceView
  ) => {
    const sec = sectionsData[key] as any;
    if (!sec) return false;
    if (sec.is_visible === false) return false;
    if (Array.isArray(sec.hidden_in_views) && sec.hidden_in_views.includes(view)) {
      return false;
    }
    return true;
  };

  const isSectionActive = (key: TabKey, view: TargetAudienceView = targetView) => {
    const viewData = allViewsData[view] || sections;
    return isSectionActiveForData(viewData, key, view);
  };

  // Delete Section Handler (scoped strictly to current targetView so other audience views are preserved)
  const handleDeleteSection = async (key: TabKey) => {
    const currentSec = (sections[key] as any) || {};
    const existingHiddenViews: TargetAudienceView[] = Array.isArray(currentSec.hidden_in_views)
      ? currentSec.hidden_in_views
      : [];

    // Add targetView to hidden_in_views for this section (keeps other audience views intact!)
    const newHiddenViews = Array.from(new Set([...existingHiddenViews, targetView]));

    const updatedSections: LandingSectionsData = {
      ...sections,
      [key]: {
        ...currentSec,
        hidden_in_views: newHiddenViews,
      },
    };

    const newAllViews = {
      ...allViewsData,
      [targetView]: updatedSections,
    };
    setAllViewsData(newAllViews);

    const viewName =
      targetView === "instructor"
        ? (isAr ? "صفحة المدربين" : "Instructors page")
        : targetView === "student"
        ? (isAr ? "صفحة الطلاب" : "Students page")
        : (isAr ? "صفحة الزوار" : "Visitors page");

    setStatusMessage(
      isAr
        ? `تم حذف وإخفاء القسم من ${viewName} بنجاح. لن يظهر بالمعاينة لـ ${viewName}، وباقي الواجهات لم تتأثر.`
        : `Section removed from ${viewName}. Other audience views remain active.`
    );

    // Save draft immediately to server so Live Preview is instantly synced!
    await saveDraftToServer(getFullCombinedPayload(newAllViews));

    // Switch to another active tab if current tab was removed from this view
    const remainingActiveTabs = ALL_TABS.filter(
      (t) =>
        t.allowedViews.includes(targetView) &&
        t.key !== key &&
        isSectionActiveForData(updatedSections, t.key, targetView)
    );
    if (remainingActiveTabs.length > 0) {
      setActiveTab(remainingActiveTabs[0].key);
    }
  };

  // Add / Restore Section Handler for current targetView
  const handleAddSection = async (key: TabKey) => {
    const currentSec = (sections[key] as any) || {};
    const existingHiddenViews: TargetAudienceView[] = Array.isArray(currentSec.hidden_in_views)
      ? currentSec.hidden_in_views
      : [];

    // Remove current targetView from hidden_in_views
    const newHiddenViews = existingHiddenViews.filter((v) => v !== targetView);

    const currentOrder = sections.section_order || DEFAULT_SECTION_ORDER;
    const newOrder = currentOrder.includes(key)
      ? currentOrder
      : [...currentOrder, key];

    const updatedSections: LandingSectionsData = {
      ...sections,
      [key]: {
        ...currentSec,
        is_visible: true,
        hidden_in_views: newHiddenViews,
      },
      section_order: newOrder,
    };

    const newAllViews = {
      ...allViewsData,
      [targetView]: updatedSections,
    };
    setAllViewsData(newAllViews);
    setActiveTab(key);
    setIsAddSectionModalOpen(false);

    const viewName =
      targetView === "instructor"
        ? (isAr ? "صفحة المدربين" : "Instructors page")
        : targetView === "student"
        ? (isAr ? "صفحة الطلاب" : "Students page")
        : (isAr ? "صفحة الزوار" : "Visitors page");

    setStatusMessage(
      isAr
        ? `تمت إضافة القسم إلى ${viewName} بنجاح!`
        : `Section restored to ${viewName} successfully!`
    );

    await saveDraftToServer(getFullCombinedPayload(newAllViews));
  };

  const targetViews = [
    {
      id: "guest" as TargetAudienceView,
      title: isAr ? "صفحة الزوار" : "Visitors Page",
      badge: isAr ? "عام للزوار" : "Public Visitors",
      desc: isAr
        ? "الواجهة الترويجية العامة المخصصة للزوار لاستكشاف المنصة والتسجيل"
        : "Main promotional landing page for visitors to explore and sign up",
      icon: Globe,
    },
    {
      id: "student" as TargetAudienceView,
      title: isAr ? "صفحة الطلاب" : "Students Page",
      badge: isAr ? "للطلاب المسجلين" : "Active Students",
      desc: isAr
        ? "تجربة الصفحة المخصصة للطلاب لمتابعة التعلم واستكشاف المسارات"
        : "Home experience for active students to continue learning",
      icon: GraduationCap,
    },
    {
      id: "instructor" as TargetAudienceView,
      title: isAr ? "صفحة المدربين" : "Instructors Page",
      badge: isAr ? "للمدربين والخبراء" : "Coaches & Instructors",
      desc: isAr
        ? "واجهة ومحتوى المدربين للوصول السريع للأكاديمية واستوديو الدورات"
        : "Specialized dashboard view for instructors and academy resources",
      icon: UserCheck,
    },
  ];

  // Active tabs for current target view
  const activeTabsForView = ALL_TABS.filter(
    (tab) =>
      tab.allowedViews.includes(targetView) && isSectionActive(tab.key)
  );

  // Inactive / deleted tabs that can be added to this target view
  const availableToAddTabs = ALL_TABS.filter(
    (tab) =>
      tab.allowedViews.includes(targetView) && !isSectionActive(tab.key)
  );

  const handleTargetViewChange = (newView: TargetAudienceView) => {
    setTargetView(newView);
    const targetData = allViewsData[newView] || allViewsData.guest;
    const validTabsForView = ALL_TABS.filter(
      (t) =>
        t.allowedViews.includes(newView) && isSectionActiveForData(targetData, t.key, newView)
    );
    if (validTabsForView.length > 0 && !validTabsForView.some((t) => t.key === activeTab)) {
      setActiveTab(validTabsForView[0].key);
    } else if (validTabsForView.length === 0) {
      const allForView = ALL_TABS.filter((t) => t.allowedViews.includes(newView));
      if (allForView.length > 0) setActiveTab(allForView[0].key);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
      </div>
    );
  }

  const currentTabObj =
    activeTabsForView.find((t) => t.key === activeTab) ||
    ALL_TABS.find((t) => t.key === activeTab) ||
    ALL_TABS[0];
  const CurrentTabIcon = currentTabObj.icon;
  const currentTabLabel =
    currentTabObj.labels[targetView]?.[isAr ? "ar" : "en"] ||
    currentTabObj.labels.guest[isAr ? "ar" : "en"];

  const currentIndex = activeTabsForView.findIndex((t) => t.key === activeTab);
  const totalActive = activeTabsForView.length;

  const handleNextSection = () => {
    if (totalActive === 0) return;
    const nextIdx = (currentIndex + 1) % totalActive;
    setActiveTab(activeTabsForView[nextIdx].key);
  };

  const handlePrevSection = () => {
    if (totalActive === 0) return;
    const prevIdx = (currentIndex - 1 + totalActive) % totalActive;
    setActiveTab(activeTabsForView[prevIdx].key);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header with structured visual hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-brand-dark" />
            <span>{t("landing.bilingualStudio")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("landing.sectionsTitle")}
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {isAr
              ? "تحرير، إضافة، حذف، وإعادة ترتيب أقسام الصفحة الرئيسية بسهولة تامة"
              : "Customize, add, remove, and reorder landing page sections with ease"}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Drag & Drop Reorder Button */}
          <button
            type="button"
            onClick={() => setIsReorderOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-brand-dark text-xs font-bold border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
            title={isAr ? "إعادة ترتيب الأقسام بالسحب والإفلات" : "Drag & Drop Section Reorder"}
          >
            <ArrowUpDown className="w-4 h-4 text-brand-dark" />
            <span>{t("landing.reorderSections")}</span>
          </button>

          {/* Preview Draft Button */}
          <button
            type="button"
            onClick={handleOpenPreviewTab}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
            title={isAr ? "معاينة المسودة في نافذة جديدة" : "Preview Draft in New Tab"}
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>{t("landing.previewDraft")}</span>
          </button>

          {/* Primary Action Button (Publish) */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-dark via-[#105d4d] to-[#0d4a3d] hover:brightness-110 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 active:scale-95"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:rotate-180" />}
            <span>{t("landing.publishLive")}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-brand-dark text-xs font-bold flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-dark" />
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-brand-dark hover:text-brand-dark p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 1: Audience & Page Perspective Selector */}
      <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-dark to-[var(--color-primary-main)] text-white text-xs font-black flex items-center justify-center shadow-xs">
                1
              </span>
              <span>{isAr ? "اختر الصفحة المراد تخصيصها:" : "Select Target Landing Experience:"}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              {isAr
                ? "حدد نوع الصفحة لعرض وتعديل الأقسام المخصصة لها فقط مع إمكانية إضافة وحذف أي قسم"
                : "Choose audience view to manage and customize its dedicated sections"}
            </p>
          </div>
        </div>

        {/* 3 Experience Selector Cards with Staggered Entrance and Clean Modern Hover */}
        <motion.div
          variants={audienceContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1"
        >
          {targetViews.map((v) => {
            const isSelected = targetView === v.id;
            const Icon = v.icon;
            const viewData = allViewsData[v.id] || allViewsData.guest;
            const activeCount = ALL_TABS.filter(
              (t) => t.allowedViews.includes(v.id) && isSectionActiveForData(viewData, t.key, v.id)
            ).length;

            return (
              <motion.button
                key={v.id}
                variants={audienceCardVariants}
                type="button"
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                onClick={() => handleTargetViewChange(v.id)}
                className={`group relative text-start p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3.5 overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-slate-50/50 via-slate-50/15 to-white border-brand-dark shadow-xs hover:shadow-sm"
                    : "bg-white hover:bg-slate-50/70 border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "bg-brand-dark text-white shadow-xs group-hover:scale-105"
                          : "bg-slate-100 text-slate-700 group-hover:bg-brand-dark group-hover:text-white group-hover:scale-105 group-hover:shadow-xs"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span
                        className={`text-sm sm:text-base font-black block leading-tight transition-colors ${
                          isSelected
                            ? "text-slate-900"
                            : "text-slate-800 group-hover:text-brand-dark"
                        }`}
                      >
                        {v.title}
                      </span>
                      <span className="text-xs text-slate-500 font-medium group-hover:text-slate-600 transition-colors">
                        {v.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isSelected
                        ? "border-brand-dark bg-brand-dark text-white shadow-xs group-hover:scale-105"
                        : "border-slate-300 bg-white group-hover:border-[var(--color-primary-main)] group-hover:bg-slate-50/50 group-hover:scale-105"
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 group-hover:text-slate-700 leading-relaxed relative z-10 font-normal">
                  {v.desc}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 group-hover:border-slate-200 text-xs font-bold relative z-10 transition-colors">
                  <span
                    className={
                      isSelected
                        ? "text-brand-dark font-black"
                        : "text-slate-500 group-hover:text-slate-800 font-semibold"
                    }
                  >
                    {isAr
                      ? `${activeCount} أقسام نشطة`
                      : `${activeCount} Active Sections`}
                  </span>
                  {isSelected ? (
                    <span className="text-brand-dark bg-slate-100/90 border border-slate-200/80 px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs">
                      {isAr ? "محدد حالياً" : "Active Selection"}
                    </span>
                  ) : (
                    <span className="text-slate-400 group-hover:text-brand-dark text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>{isAr ? "تخصيص" : "Customize"}</span>
                      <span className="rtl:rotate-180 inline-block font-mono">→</span>
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* STEP 2: Soft & Minimalist Section Command Bar */}
      <div ref={sectionDropdownRef} className="relative z-30">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 shadow-xs flex items-center justify-between gap-2.5 transition-all">
          {/* Section Trigger (Soft & Clean) */}
          <button
            type="button"
            onClick={() => setIsSectionDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 text-start cursor-pointer transition-colors group flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-brand-dark flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
              <CurrentTabIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {currentTabLabel}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  ({currentIndex >= 0 ? `${currentIndex + 1}/${totalActive}` : ""})
                </span>
              </div>
              <span className="text-xs sm:text-[13px] text-slate-500 font-normal block truncate">
                {currentTabObj.descriptions[isAr ? "ar" : "en"]}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform ms-auto shrink-0 ${
                isSectionDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Soft Prev/Next Navigation */}
          <div className="flex items-center gap-1 border-s border-slate-100 ps-2 shrink-0">
            <button
              type="button"
              onClick={handlePrevSection}
              disabled={totalActive <= 1}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title={isAr ? "القسم السابق" : "Previous"}
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
            </button>
            <button
              type="button"
              onClick={handleNextSection}
              disabled={totalActive <= 1}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title={isAr ? "القسم التالي" : "Next"}
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
            </button>
          </div>

          {/* Soft Quick Actions */}
          <div className="flex items-center gap-1.5 border-s border-slate-100 ps-2 shrink-0">
            {/* Reorder Button */}
            <button
              type="button"
              onClick={() => setIsReorderOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              title={isAr ? "إعادة الترتيب بالسحب" : "Reorder"}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-xs">{isAr ? "ترتيب" : "Reorder"}</span>
            </button>

            {/* Add Section Button */}
            <button
              type="button"
              onClick={() => setIsAddSectionModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-dark hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title={isAr ? "إضافة سكشن جديد" : "Add Section"}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs">{isAr ? "إضافة قسم" : "Add Section"}</span>
            </button>
          </div>
        </div>

        {/* Soft Dropdown Popover with Smooth Framer Motion Animation */}
        <AnimatePresence>
          {isSectionDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full start-0 end-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xl p-2 z-50"
            >
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 font-bold border-b border-slate-100/80 mb-1">
              <span>{isAr ? "الانتقال إلى قسم:" : "Switch Section:"}</span>
              <span className="text-xs text-slate-400 font-semibold">{totalActive} {isAr ? "أقسام مفعلة" : "sections"}</span>
            </div>

            <div className="space-y-0.5 max-h-[320px] overflow-y-auto p-0.5">
              {activeTabsForView.map((tab, idx) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.key;
                const label =
                  tab.labels[targetView]?.[isAr ? "ar" : "en"] ||
                  tab.labels.guest[isAr ? "ar" : "en"];
                const desc = tab.descriptions[isAr ? "ar" : "en"];
                const indexStr = String(idx + 1).padStart(2, "0");

                return (
                  <div
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setIsSectionDropdownOpen(false);
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-slate-50/90 text-brand-dark font-bold"
                        : "hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`text-xs font-bold w-4 text-center ${
                          isSelected ? "text-brand-dark" : "text-slate-300"
                        }`}
                      >
                        {indexStr}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-slate-100 text-brand-dark"
                            : "bg-slate-100 text-slate-500 group-hover:text-slate-800"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold block truncate leading-tight">
                          {label}
                        </span>
                        <span className="text-xs text-slate-500 font-normal block truncate mt-0.5">
                          {desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-brand-dark" />
                      ) : null}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const viewName =
                            targetView === "instructor"
                              ? "صفحة المدربين"
                              : targetView === "student"
                              ? "صفحة الطلاب"
                              : "صفحة الزوار";
                          if (
                            confirm(
                              isAr
                                ? `هل أنت متأكد من رغبتك في حذف وإخفاء "${label}" من ${viewName}؟ لن يتم حذفه من الواجهات الأخرى.`
                                : `Are you sure you want to remove "${label}" from ${targetView} view? Other views remain active.`
                            )
                          ) {
                            handleDeleteSection(tab.key);
                          }
                        }}
                        title={isAr ? "حذف السكشن" : "Delete section"}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between px-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsSectionDropdownOpen(false);
                  setIsReorderOpen(true);
                }}
                className="text-slate-500 hover:text-brand-dark font-bold flex items-center gap-1.5 cursor-pointer py-1"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span className="text-[11px]">{isAr ? "ترتيب بالسحب" : "Reorder"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSectionDropdownOpen(false);
                  setIsAddSectionModalOpen(true);
                }}
                className="text-brand-dark hover:text-[#07382E] font-bold flex items-center gap-1 cursor-pointer py-1"
              >
                <Plus className="w-3 h-3" />
                <span className="text-[11px]">{isAr ? "إضافة قسم" : "Add Section"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Main Section Editor Canvas with Smooth Tab Motion */}
    <AnimatePresence mode="wait">
      {isSectionActive(activeTab) ? (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs"
        >
          {/* Section Action Bar: Soft & Clean */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/60 text-brand-dark flex items-center justify-center shrink-0 shadow-2xs">
                <CurrentTabIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">{currentTabLabel}</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  {currentTabObj.descriptions[isAr ? "ar" : "en"]}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const viewName =
                  targetView === "instructor"
                    ? "صفحة المدربين"
                    : targetView === "student"
                    ? "صفحة الطلاب"
                    : "صفحة الزوار";
                if (
                  confirm(
                    isAr
                      ? `هل أنت متأكد من رغبتك في حذف وإخفاء "${currentTabLabel}" من ${viewName}؟ لن يتم حذفه من الواجهات الأخرى.`
                      : `Are you sure you want to remove "${currentTabLabel}" from ${targetView} view? Other views remain active.`
                  )
                ) {
                  handleDeleteSection(activeTab);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-transparent hover:border-rose-100"
              title={isAr ? "حذف هذا السكشن" : "Delete section"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? "حذف السكشن" : "Delete Section"}</span>
            </button>
          </div>

          {/* ===================== HERO SECTION ===================== */}
          {activeTab === "hero" && (
            <div className="space-y-5">
              <div className="space-y-4 pt-1">
                {/* Badge */}
                <BilingualInput
                  labelAr="الشارة العلوية"
                  labelEn="Top Badge"
                  valueAr={sections.hero.badge_ar}
                  valueEn={sections.hero.badge_en}
                  onChangeAr={(val) =>
                    setSections({ ...sections, hero: { ...sections.hero, badge_ar: val } })
                  }
                  onChangeEn={(val) =>
                    setSections({ ...sections, hero: { ...sections.hero, badge_en: val } })
                  }
                  placeholderAr="مثال: المنصة الرائدة في تمكين الكفاءات"
                  placeholderEn="e.g. Leading Platform for Career Mastery"
                />

                {/* Title */}
                <BilingualInput
                  labelAr="العنوان الرئيسي"
                  labelEn="Main Heading"
                  valueAr={sections.hero.title_ar}
                  valueEn={sections.hero.title_en}
                  onChangeAr={(val) =>
                    setSections({ ...sections, hero: { ...sections.hero, title_ar: val } })
                  }
                  onChangeEn={(val) =>
                    setSections({ ...sections, hero: { ...sections.hero, title_en: val } })
                  }
                  placeholderAr="مثال: انطلق في مسارك نحو"
                  placeholderEn="e.g. Elevate Your Career to"
                />

                {/* Highlighted Text */}
                <BilingualInput
                  labelAr="النص الملون المكمل للعنوان"
                  labelEn="Highlighted Sub-Heading"
                  valueAr={sections.hero.highlighted_text_ar}
                  valueEn={sections.hero.highlighted_text_en}
                  onChangeAr={(val) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, highlighted_text_ar: val },
                    })
                  }
                  onChangeEn={(val) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, highlighted_text_en: val },
                    })
                  }
                  placeholderAr="مثال: الاحتراف والريادة"
                  placeholderEn="e.g. True Mastery"
                  highlight={true}
                />

                {/* Description */}
                <BilingualTextarea
                  labelAr="الوصف التوضيحي"
                  labelEn="Subtitle Description"
                  valueAr={sections.hero.description_ar}
                  valueEn={sections.hero.description_en}
                  onChangeAr={(val) =>
                    setSections({ ...sections, hero: { ...sections.hero, description_ar: val } })
                  }
                  onChangeEn={(val) =>
                    setSections({ ...sections, hero: { ...sections.hero, description_en: val } })
                  }
                  placeholderAr="اكتب وصفاً موجزاً وجذاباً للواجهة الرئيسية..."
                  placeholderEn="Write a concise and compelling hero description..."
                  rows={3}
                />
              </div>

              {/* Group C: Call To Action & Media */}
              <div className="space-y-4 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-1 rounded-full bg-brand-dark" />
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    {isAr ? "الإجراء الرئيسي والوسائط" : "Call To Action & Media"}
                  </h4>
                  <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1 ms-2" />
                </div>

                {/* CTAs */}
                <BilingualInput
                  labelAr="نص الزر الرئيسي"
                  labelEn="Primary CTA Text"
                  valueAr={sections.hero.cta_primary_text_ar}
                  valueEn={sections.hero.cta_primary_text_en}
                  onChangeAr={(val) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, cta_primary_text_ar: val },
                    })
                  }
                  onChangeEn={(val) =>
                    setSections({
                      ...sections,
                      hero: { ...sections.hero, cta_primary_text_en: val },
                    })
                  }
                  placeholderAr="مثال: استكشف الدورات"
                  placeholderEn="e.g. Explore Courses"
                />

                {/* Hero Image */}
                <div className="pt-2 border-t border-slate-100">
                  <CmsImageUpload
                    label={isAr ? "صورة قسم الواجهة الرئيسية" : "Hero Banner Image"}
                    value={sections.hero.hero_image_url || ""}
                    onChange={(url) =>
                      setSections({ ...sections, hero: { ...sections.hero, hero_image_url: url } })
                    }
                    folder="coachspace/landing"
                    aspectRatio="hero"
                    description={
                      isAr
                        ? "الصورة التوضيحية أو صورة المدرب في قسم الواجهة الرئيسي"
                        : "Main hero coach visual or illustration at top of homepage"
                    }
                    isAr={isAr}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================== TOP CATEGORIES ===================== */}
          {activeTab === "top_categories" && (
            <div className="space-y-6">
              <BilingualInput
                labelAr="عنوان القسم"
                labelEn="Section Heading"
                valueAr={sections.top_categories.title_ar}
                valueEn={sections.top_categories.title_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    top_categories: { ...sections.top_categories, title_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    top_categories: { ...sections.top_categories, title_en: val },
                  })
                }
                placeholderAr="مثال: أبرز المجالات التدريبية"
                placeholderEn="e.g. Top Learning Categories"
              />

              <BilingualInput
                labelAr="الوصف الفرعي"
                labelEn="Section Subtitle"
                valueAr={sections.top_categories.subtitle_ar}
                valueEn={sections.top_categories.subtitle_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    top_categories: { ...sections.top_categories, subtitle_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    top_categories: { ...sections.top_categories, subtitle_en: val },
                  })
                }
                placeholderAr="مثال: اختر مجالك وابدأ بتطوير مهاراتك اليوم"
                placeholderEn="e.g. Choose your field and start advancing today"
              />
            </div>
          )}

          {/* ===================== MASTER YOUR CRAFT ===================== */}
          {activeTab === "master_craft" && (
            <div className="space-y-6">
              <BilingualInput
                labelAr="عنوان القسم"
                labelEn="Section Heading"
                valueAr={sections.master_craft.heading_ar}
                valueEn={sections.master_craft.heading_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    master_craft: { ...sections.master_craft, heading_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    master_craft: { ...sections.master_craft, heading_en: val },
                  })
                }
                placeholderAr="مثال: أتقن مجالك وتفوق مهنياً"
                placeholderEn="e.g. Master Your Craft and Excel"
              />

              <BilingualTextarea
                labelAr="الوصف التوضيحي"
                labelEn="Section Description"
                valueAr={sections.master_craft.description_ar}
                valueEn={sections.master_craft.description_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    master_craft: { ...sections.master_craft, description_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    master_craft: { ...sections.master_craft, description_en: val },
                  })
                }
                placeholderAr="اكتب وصف قسم إتقان المهارات..."
                placeholderEn="Write the description for master your craft section..."
                rows={3}
              />
            </div>
          )}

          {/* ===================== WHY COACH SPACE ===================== */}
          {activeTab === "why_stands_out" && (
            <div className="space-y-6">
              <BilingualInput
                labelAr="عنوان القسم"
                labelEn="Section Heading"
                valueAr={sections.why_stands_out.title_ar}
                valueEn={sections.why_stands_out.title_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    why_stands_out: { ...sections.why_stands_out, title_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    why_stands_out: { ...sections.why_stands_out, title_en: val },
                  })
                }
                placeholderAr="مثال: ما الذي يميز منصة كوتش سبيس؟"
                placeholderEn="e.g. Why Platform Stands Out?"
              />

              <BilingualInput
                labelAr="الوصف الفرعي"
                labelEn="Section Subtitle"
                valueAr={sections.why_stands_out.subtitle_ar}
                valueEn={sections.why_stands_out.subtitle_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    why_stands_out: { ...sections.why_stands_out, subtitle_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    why_stands_out: { ...sections.why_stands_out, subtitle_en: val },
                  })
                }
                placeholderAr="مثال: منظومة متكاملة لربط الكفاءات بأفضل المدربين"
                placeholderEn="e.g. An integrated ecosystem connecting learners with leaders"
              />
            </div>
          )}

          {/* ===================== REAL STORIES / TESTIMONIALS ===================== */}
          {activeTab === "real_stories" && (
            <div className="space-y-6">
              <BilingualInput
                labelAr="عنوان القسم"
                labelEn="Section Heading"
                valueAr={sections.real_stories.title_ar}
                valueEn={sections.real_stories.title_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    real_stories: { ...sections.real_stories, title_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    real_stories: { ...sections.real_stories, title_en: val },
                  })
                }
                placeholderAr="مثال: ماذا يقول خريجو المنصة؟"
                placeholderEn="e.g. Real Stories & Reviews"
              />

              {/* Testimonials List */}
              <div className="space-y-4 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-1 rounded-full bg-brand-dark" />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      {isAr ? "قائمة آراء الطلاب والمهنيين" : "Learner Quotes"}
                    </span>
                  </div>
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
                              quote_ar: "تجربة تدريبية ممتازة وملهمة",
                              quote_en: "An inspiring and practical learning experience",
                              rating: 5,
                            },
                          ],
                        },
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-brand-dark border border-slate-200/80 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إضافة رأي" : "Add Quote"}</span>
                  </button>
                </div>

                {sections.real_stories.testimonials.map((tItem, idx) => (
                  <div
                    key={tItem.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSections({
                            ...sections,
                            real_stories: {
                              ...sections.real_stories,
                              testimonials: sections.real_stories.testimonials.filter(
                                (item) => item.id !== tItem.id
                              ),
                            },
                          })
                        }
                        className="text-rose-500 hover:text-rose-700 text-xs p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <BilingualInput
                      labelAr="اسم الشخص"
                      labelEn="Person Name"
                      valueAr={tItem.name_ar}
                      valueEn={tItem.name_en}
                      onChangeAr={(val) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].name_ar = val;
                        setSections({
                          ...sections,
                          real_stories: { ...sections.real_stories, testimonials: updated },
                        });
                      }}
                      onChangeEn={(val) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].name_en = val;
                        setSections({
                          ...sections,
                          real_stories: { ...sections.real_stories, testimonials: updated },
                        });
                      }}
                      placeholderAr="مثال: م. أحمد عبد الله"
                      placeholderEn="e.g. Ahmed Abdullah"
                    />

                    <BilingualInput
                      labelAr="المسمى الوظيفي"
                      labelEn="Job Title / Role"
                      valueAr={tItem.role_ar}
                      valueEn={tItem.role_en}
                      onChangeAr={(val) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].role_ar = val;
                        setSections({
                          ...sections,
                          real_stories: { ...sections.real_stories, testimonials: updated },
                        });
                      }}
                      onChangeEn={(val) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].role_en = val;
                        setSections({
                          ...sections,
                          real_stories: { ...sections.real_stories, testimonials: updated },
                        });
                      }}
                      placeholderAr="مثال: مهندس برمجيات أول"
                      placeholderEn="e.g. Senior Software Engineer"
                    />

                    <BilingualTextarea
                      labelAr="نص الرأي والتقييم"
                      labelEn="Testimonial Quote"
                      valueAr={tItem.quote_ar}
                      valueEn={tItem.quote_en}
                      onChangeAr={(val) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].quote_ar = val;
                        setSections({
                          ...sections,
                          real_stories: { ...sections.real_stories, testimonials: updated },
                        });
                      }}
                      onChangeEn={(val) => {
                        const updated = [...sections.real_stories.testimonials];
                        updated[idx].quote_en = val;
                        setSections({
                          ...sections,
                          real_stories: { ...sections.real_stories, testimonials: updated },
                        });
                      }}
                      placeholderAr="اكتب تفاصيل تجربة ورأي الخريج..."
                      placeholderEn="Write details of the student's review..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== FAQ SECTION ===================== */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              <BilingualInput
                labelAr="عنوان القسم"
                labelEn="Section Heading"
                valueAr={sections.faq.title_ar}
                valueEn={sections.faq.title_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    faq: { ...sections.faq, title_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    faq: { ...sections.faq, title_en: val },
                  })
                }
                placeholderAr="مثال: الأسئلة الأكثر شيوعاً"
                placeholderEn="e.g. Frequently Asked Questions"
              />

              {/* FAQs List */}
              <div className="space-y-4 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-1 rounded-full bg-brand-dark" />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      {isAr ? "قائمة الأسئلة والإجابات" : "Questions & Answers"}
                    </span>
                  </div>
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-brand-dark border border-slate-200/80 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إضافة سؤال" : "Add FAQ"}</span>
                  </button>
                </div>

                {sections.faq.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
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
                        className="text-rose-500 hover:text-rose-700 text-xs p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <BilingualInput
                      labelAr="نص السؤال"
                      labelEn="Question"
                      valueAr={item.question_ar}
                      valueEn={item.question_en}
                      onChangeAr={(val) => {
                        const updated = [...sections.faq.items];
                        updated[idx].question_ar = val;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      onChangeEn={(val) => {
                        const updated = [...sections.faq.items];
                        updated[idx].question_en = val;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      placeholderAr="اكتب السؤال هنا..."
                      placeholderEn="Write the question here..."
                    />

                    <BilingualTextarea
                      labelAr="نص الإجابة"
                      labelEn="Answer"
                      valueAr={item.answer_ar}
                      valueEn={item.answer_en}
                      onChangeAr={(val) => {
                        const updated = [...sections.faq.items];
                        updated[idx].answer_ar = val;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      onChangeEn={(val) => {
                        const updated = [...sections.faq.items];
                        updated[idx].answer_en = val;
                        setSections({ ...sections, faq: { ...sections.faq, items: updated } });
                      }}
                      placeholderAr="اكتب الإجابة الشاملة هنا..."
                      placeholderEn="Write the complete answer here..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== JOIN FUTURE CTA ===================== */}
          {activeTab === "join_future" && (
            <div className="space-y-6">
              <BilingualInput
                labelAr="عنوان القسم"
                labelEn="Section Heading"
                valueAr={sections.join_future.title_ar}
                valueEn={sections.join_future.title_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    join_future: { ...sections.join_future, title_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    join_future: { ...sections.join_future, title_en: val },
                  })
                }
                placeholderAr="مثال: جاهز للبدء في رحلتك التعليمية؟"
                placeholderEn="e.g. Ready to begin your learning journey?"
              />

              <BilingualInput
                labelAr="الوصف الفرعي"
                labelEn="Section Subtitle"
                valueAr={sections.join_future.subtitle_ar}
                valueEn={sections.join_future.subtitle_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    join_future: { ...sections.join_future, subtitle_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    join_future: { ...sections.join_future, subtitle_en: val },
                  })
                }
                placeholderAr="مثال: انضم إلى آلاف المتعلمين والخبراء اليوم"
                placeholderEn="e.g. Join thousands of active learners today"
              />

              <BilingualInput
                labelAr="نص زر الدعوة"
                labelEn="CTA Button Text"
                valueAr={sections.join_future.button_text_ar}
                valueEn={sections.join_future.button_text_en}
                onChangeAr={(val) =>
                  setSections({
                    ...sections,
                    join_future: { ...sections.join_future, button_text_ar: val },
                  })
                }
                onChangeEn={(val) =>
                  setSections({
                    ...sections,
                    join_future: { ...sections.join_future, button_text_en: val },
                  })
                }
                placeholderAr="مثال: سجّل الآن مجاناً"
                placeholderEn="e.g. Register Now for Free"
              />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {isAr ? "لم يتم تحديد أي قسم نشط" : "No active section selected"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAr
              ? "يرجى اختيار قسم من القائمة أو إضافة قسم جديد لتعديل محتواه."
              : "Please pick a section from the command bar or add a new section to customize."}
          </p>
          <button
            type="button"
            onClick={() => setIsAddSectionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? "إضافة سكشن جديد" : "Add New Section"}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Add Section Modal with Smooth Framer Motion */}
      <AnimatePresence>
        {isAddSectionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-dark text-white flex items-center justify-center shadow-xs">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {isAr ? "إضافة قسم جديد إلى الصفحة" : "Add Section to Page"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {isAr
                        ? `اختر السكشن المراد تفعيله وإضافته لـ ${
                            targetViews.find((v) => v.id === targetView)?.title
                          }`
                        : `Select a section to add to ${
                            targetViews.find((v) => v.id === targetView)?.title
                          }`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: Available Sections to Add */}
              <div className="p-5 overflow-y-auto space-y-3 flex-1">
                {availableToAddTabs.length > 0 ? (
                  availableToAddTabs.map((tab) => {
                    const Icon = tab.icon;
                    const label =
                      tab.labels[targetView]?.[isAr ? "ar" : "en"] ||
                      tab.labels.guest[isAr ? "ar" : "en"];
                    const desc = tab.descriptions[isAr ? "ar" : "en"];

                    return (
                      <div
                        key={tab.key}
                        className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/30 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 text-brand-dark border border-slate-100 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {label}
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              {desc}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddSection(tab.key)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-dark hover:bg-[#07382E] text-white text-xs font-bold shrink-0 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAr ? "إضافة" : "Add"}</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-50 text-brand-dark flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isAr
                        ? "جميع الأقسام مضافة ونشطة بالفعل!"
                        : "All sections are already active!"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? "كافة الأقسام المتاحة لهذه الصفحة مفعلة وموجودة في قائمة التعديل."
                        : "All available sections for this page are already active and visible."}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white cursor-pointer transition-colors"
                >
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Section Reorder Drawer */}
      <SectionReorderDrawer
        isOpen={isReorderOpen}
        onClose={() => setIsReorderOpen(false)}
        sectionsData={sections}
        isAr={isAr}
        targetView={targetView}
        onSaveOrder={handleSaveOrder}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
