"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { categoryService } from "@/services/categoryService";
import { instructorCourseService } from "@/services/instructorCourseService";
import { CategoryItem } from "@/types/catalog";
import {
  FileText,
  Layers,
  Image as ImageIcon,
  CloudUpload,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  PlayCircle,
  AlertTriangle,
  AlertCircle,
  Settings,
  HelpCircle,
  Eye,
  X,
  CheckCircle2,
  ArrowLeft,
  Video,
  DollarSign,
  Globe,
  Sparkles,
  Save,
  Send,
  Loader2,
} from "lucide-react";

import { LessonVideoUploader } from "@/components/instructor/LessonVideoUploader";

interface Lesson {
  id: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  duration: string;
  duration_minutes?: number;
  video_url?: string;
  video_public_id?: string;
  is_preview?: boolean;
  isFreePreview?: boolean;
  warning?: string;
}

interface Section {
  id: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  lessons: Lesson[];
  warning?: string;
}

export function CreateCourseStudio() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const t = useTranslations("courseStudio");

  // Dynamic Categories from Backend
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);

  // Course ID for newly created or editing course draft
  const initialCourseId = searchParams?.get("courseId") || searchParams?.get("id") || "";
  const [courseId, setCourseId] = useState<string>(initialCourseId);
  const [isInitializingCourse, setIsInitializingCourse] = useState(false);

  // Active Tab: "info" (Course Info) | "curriculum" (Curriculum)
  const [activeTab, setActiveTab] = useState<"info" | "curriculum">("info");

  // Form State - Basic Info
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");

  // Attributes & Pricing
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState("Bilingual (EN/AR)");
  const [price, setPrice] = useState("49.00");

  // Fetch dynamic categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await categoryService.getCategories(locale);
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
          if (!category) {
            setCategory(String(cats[0].id));
          }
        }
      } catch (err) {
        console.warn("Could not load backend categories", err);
      }
    }
    loadCategories();
  }, [locale]);

  // Load existing course if courseId provided in URL
  useEffect(() => {
    if (!initialCourseId) return;
    async function loadCourse() {
      try {
        const data = await instructorCourseService.getInstructorCourse(initialCourseId);
        if (data) {
          setTitleEn(data.title_en || data.title || "");
          setTitleAr(data.title_ar || "");
          setDescEn(data.description_en || data.description || "");
          setDescAr(data.description_ar || "");
          if (data.category) setCategory(String(data.category));
          if (data.level) setLevel(data.level.toLowerCase());
          if (data.price) setPrice(String(data.price));
          if (data.cover_image) setCoverPreview(data.cover_image);

          if (Array.isArray(data.sections)) {
            setSections(
              data.sections.map((s: any) => ({
                id: String(s.id),
                title: isAr ? s.title_ar || s.title_en || s.title : s.title_en || s.title_ar || s.title,
                title_en: s.title_en || s.title,
                title_ar: s.title_ar || s.title,
                lessons: Array.isArray(s.lessons)
                  ? s.lessons.map((l: any) => ({
                      id: String(l.id),
                      title: isAr ? l.title_ar || l.title_en || l.title : l.title_en || l.title_ar || l.title,
                      title_en: l.title_en || l.title,
                      title_ar: l.title_ar || l.title,
                      duration: l.duration || `${l.duration_minutes || 5}:00`,
                      duration_minutes: l.duration_minutes || 5,
                      video_url: l.video_url,
                      video_public_id: l.video_public_id,
                      is_preview: l.is_preview,
                    }))
                  : [],
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Could not load instructor course:", err);
      }
    }
    loadCourse();
  }, [initialCourseId, isAr]);

  /**
   * Ensures a real database course ID exists before requesting upload signatures or adding lessons
   */
  const ensureBackendCourseId = async (): Promise<string | number> => {
    if (courseId && !String(courseId).startsWith("draft-") && !isNaN(Number(courseId))) {
      return courseId;
    }

    setIsInitializingCourse(true);
    try {
      const selectedCatId = Number(category) || (categoriesList[0]?.id ? Number(categoriesList[0].id) : 1);
      const created = await instructorCourseService.createCourse({
        title_ar: titleAr.trim() || "دورة جديدة",
        title_en: titleEn.trim() || "New Course Draft",
        description_ar: descAr.trim() || "وصف المسودة",
        description_en: descEn.trim() || "Draft description",
        category: selectedCatId,
        level: level || "beginner",
        language: language.includes("Arabic") ? "ar" : "en",
        price: price || "49.00",
      });

      if (created?.id) {
        const newId = String(created.id);
        setCourseId(newId);

        // Auto-create initial section on backend
        try {
          const sec = await instructorCourseService.createSection(created.id, {
            title_ar: "المقدمة",
            title_en: "Introduction",
          });
          if (sec?.id) {
            setSections([
              {
                id: String(sec.id),
                title: isAr ? sec.title_ar || "المقدمة" : sec.title_en || "Introduction",
                title_en: sec.title_en || "Introduction",
                title_ar: sec.title_ar || "المقدمة",
                lessons: [],
              },
            ]);
          }
        } catch (secErr) {
          console.warn("Could not create initial section:", secErr);
        }

        return created.id;
      }
    } catch (err: any) {
      console.warn("Could not auto-create course draft on backend:", err);
    } finally {
      setIsInitializingCourse(false);
    }

    return courseId;
  };

  // Cover Image State
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curriculum Sections State
  const [sections, setSections] = useState<Section[]>([
    {
      id: "sec-1",
      title: t("defaultSectionTitle"),
      lessons: [
        {
          id: "les-1",
          title: t("defaultLessonTitle"),
          title_en: "Welcome to the Course",
          title_ar: "مرحباً بك في الدورة التدريبية",
          duration: "02:15",
          duration_minutes: 2,
          is_preview: true,
        },
      ],
    },
    {
      id: "sec-2",
      title: t("defaultSectionTitle"),
      warning: t("videoQualityWarning"),
      lessons: [],
    },
    {
      id: "sec-3",
      title: t("defaultSectionTitle"),
      lessons: [],
    },
  ]);

  // Lesson Edit Modal State
  const [editingLessonInfo, setEditingLessonInfo] = useState<{
    sectionId: string;
    lesson: Lesson;
    isNew?: boolean;
  } | null>(null);

  // Modals / Preview / Save Feedback
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handlers for Cover Image
  const handleCoverUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t("fileSizeExceedsLimit"));
      return;
    }
    setUploadError(null);
    setCoverPreview(URL.createObjectURL(file));

    try {
      const validCourseId = await ensureBackendCourseId();
      if (validCourseId) {
        const res = await instructorCourseService.uploadCourseCoverImage(validCourseId, file);
        if (res?.cover_image) {
          setCoverPreview(res.cover_image);
        }
      }
    } catch (e: any) {
      console.warn("Cover image upload info:", e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
  };

  /**
   * Ensures a real database section ID exists before creating or updating lessons
   */
  const ensureBackendSectionId = async (
    targetSecId: string,
    currentCourseId: string | number
  ): Promise<string | number> => {
    if (targetSecId && !isNaN(Number(targetSecId))) {
      return targetSecId;
    }

    const targetSection = sections.find((s) => s.id === targetSecId);
    const title_en = targetSection?.title_en || targetSection?.title || "Section";
    const title_ar = targetSection?.title_ar || targetSection?.title || "قسم";

    try {
      const secRes = await instructorCourseService.createSection(currentCourseId, {
        title_ar: title_ar,
        title_en: title_en,
      });
      if (secRes?.id) {
        const realSecId = String(secRes.id);
        setSections((prev) =>
          prev.map((s) => (s.id === targetSecId ? { ...s, id: realSecId } : s))
        );
        return realSecId;
      }
    } catch (e) {
      console.warn("Could not create section on backend:", e);
    }
    return targetSecId;
  };

  // Section Handlers
  const addSection = async () => {
    const nextNum = sections.length + 1;
    const defaultEn = `Section ${nextNum}: Core Content`;
    const defaultAr = `القسم ${nextNum}: المحتوى الأساسي`;

    const validCourseId = await ensureBackendCourseId();
    let newSecId = `sec-${Date.now()}`;

    try {
      const secRes = await instructorCourseService.createSection(validCourseId, {
        title_ar: defaultAr,
        title_en: defaultEn,
      });
      if (secRes?.id) {
        newSecId = String(secRes.id);
      }
    } catch (e) {
      console.warn("Could not create section on backend:", e);
    }

    const newSec: Section = {
      id: newSecId,
      title: isAr ? defaultAr : defaultEn,
      title_en: defaultEn,
      title_ar: defaultAr,
      lessons: [],
    };
    setSections((prev) => [...prev, newSec]);
  };

  const openAddLessonModal = async (secId: string) => {
    const validCourseId = await ensureBackendCourseId();
    const validSecId = await ensureBackendSectionId(secId, validCourseId);

    const newLes: Lesson = {
      id: `les-${Date.now()}`,
      title: isAr ? "درس جديد" : "New Lesson",
      title_en: "New Lesson",
      title_ar: "درس جديد",
      duration: "05:00",
      duration_minutes: 5,
      is_preview: false,
    };
    setEditingLessonInfo({
      sectionId: String(validSecId),
      lesson: newLes,
      isNew: true,
    });
  };

  const openEditLessonModal = async (secId: string, lesson: Lesson) => {
    const validCourseId = await ensureBackendCourseId();
    const validSecId = await ensureBackendSectionId(secId, validCourseId);

    const isPreview = Boolean(lesson.is_preview ?? lesson.isFreePreview ?? false);
    setEditingLessonInfo({
      sectionId: String(validSecId),
      lesson: {
        ...lesson,
        is_preview: isPreview,
        isFreePreview: isPreview,
      },
      isNew: false,
    });
  };

  const saveEditedLesson = async (updatedLesson: Lesson) => {
    if (!editingLessonInfo) return;
    const { sectionId, isNew } = editingLessonInfo;

    const isPreviewVal = Boolean(updatedLesson.is_preview || updatedLesson.isFreePreview);
    const finalLesson = {
      ...updatedLesson,
      is_preview: isPreviewVal,
      isFreePreview: isPreviewVal,
    };

    try {
      if (isNew) {
        if (!isNaN(Number(sectionId))) {
          const res = await instructorCourseService.createLesson(sectionId, {
            title_ar: updatedLesson.title_ar || updatedLesson.title || "درس جديد",
            title_en: updatedLesson.title_en || updatedLesson.title || "New Lesson",
            duration_minutes: Number(updatedLesson.duration_minutes) || 5,
            is_preview: isPreviewVal,
            video_public_id: updatedLesson.video_public_id,
            video_url: updatedLesson.video_url,
          });
          if (res && res.id) {
            finalLesson.id = String(res.id);
          }
        }
      } else {
        if (finalLesson.id && !isNaN(Number(finalLesson.id))) {
          await instructorCourseService.updateLesson(finalLesson.id, {
            title_ar: finalLesson.title_ar || finalLesson.title,
            title_en: finalLesson.title_en || finalLesson.title,
            duration_minutes: Number(finalLesson.duration_minutes) || 5,
            is_preview: isPreviewVal,
            video_public_id: finalLesson.video_public_id,
            video_url: finalLesson.video_url,
          });
        }
      }
    } catch (e) {
      console.warn("Could not sync lesson changes to backend API:", e);
    }

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          if (isNew) {
            return {
              ...sec,
              lessons: [...sec.lessons, finalLesson],
            };
          }
          return {
            ...sec,
            lessons: sec.lessons.map((l) => (l.id === finalLesson.id ? finalLesson : l)),
          };
        }
        return sec;
      })
    );
    setEditingLessonInfo(null);
  };

  const deleteSection = async (secId: string) => {
    if (confirm(t("deleteSectionConfirm") || "Delete section?")) {
      if (!isNaN(Number(secId))) {
        try {
          await instructorCourseService.deleteSection(secId);
        } catch (e) {
          console.warn("Delete section API error:", e);
        }
      }
      setSections((prev) => prev.filter((sec) => sec.id !== secId));
    }
  };

  const deleteLesson = async (secId: string, lesId: string) => {
    if (confirm(t("deleteLessonConfirm") || "Delete lesson?")) {
      if (!isNaN(Number(lesId))) {
        try {
          await instructorCourseService.deleteLesson(lesId);
        } catch (e) {
          console.warn("Delete lesson API error:", e);
        }
      }
      setSections((prev) =>
        prev.map((sec) => {
          if (sec.id === secId) {
            return {
              ...sec,
              lessons: sec.lessons.filter((l) => l.id !== lesId),
            };
          }
          return sec;
        })
      );
    }
  };

  const handleSaveDraft = async () => {
    try {
      const validCourseId = await ensureBackendCourseId();
      await instructorCourseService.updateCourse(validCourseId, {
        title_ar: titleAr.trim() || undefined,
        title_en: titleEn.trim() || undefined,
        description_ar: descAr.trim() || undefined,
        description_en: descEn.trim() || undefined,
        category: Number(category) || 1,
        level: level || "beginner",
        price: price || "49.00",
      });
    } catch (e) {
      console.warn("Save draft sync info:", e);
    } finally {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSubmitCourse = () => {
    alert(t("courseSubmittedSuccess"));
    router.push(`/${locale}/instructor/courses`);
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F4F7F6] text-slate-800 font-sans pb-10 flex flex-col antialiased"
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        id="course-cover-file-input"
        aria-label="Upload Course Cover Image"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 flex-1 w-full">

        {/* Top Control & Tabs Bar (Inline Pills, No White Sticky Header) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 border border-slate-300/50">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "info"
                  ? "bg-white text-[#0F5244] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("courseInfoTab")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("curriculum")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "curriculum"
                  ? "bg-white text-[#0F5244] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("curriculumTab")}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>{t("previewBtn")}</span>
          </button>
        </div>

        {/* Save Draft Success Notification Toast */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{t("draftSavedSuccess")}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: COURSE DETAILS TAB                                */}
        {/* ========================================================= */}
        {activeTab === "info" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Title Bar */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t("courseDetailsTitle")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                {t("courseDetailsSubtitle")}
              </p>
            </div>

            {/* Grid Layout: Left Basic Info & Pricing + Right Big Cover Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* LEFT COLUMN (2 Cols): Basic Info Card & Attributes Card */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Basic Information Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#0F5244]">
                    <FileText size={18} className="shrink-0 text-[#0F5244]" />
                    <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {t("basicInfoTitle")}
                    </h2>
                  </div>

                  {/* Course Title (English & Arabic inputs side-by-side) */}
                  <div className="space-y-1.5">
                    <label htmlFor="course-title-en" className="block text-xs font-bold text-slate-700">
                      {t("courseTitleLabel")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        id="course-title-en"
                        type="text"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder={t("titleEnglishPlaceholder")}
                        className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50"
                      />
                      <input
                        id="course-title-ar"
                        aria-label={t("titleArabicPlaceholder")}
                        type="text"
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        placeholder={t("titleArabicPlaceholder")}
                        dir="rtl"
                        className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50 text-right"
                      />
                    </div>
                  </div>

                  {/* Course Description (English & Arabic textareas side-by-side) */}
                  <div className="space-y-1.5">
                    <label htmlFor="course-desc-en" className="block text-xs font-bold text-slate-700">
                      {t("courseDescLabel")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <textarea
                        id="course-desc-en"
                        rows={4}
                        value={descEn}
                        onChange={(e) => setDescEn(e.target.value)}
                        placeholder={t("descEnglishPlaceholder")}
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50 resize-none"
                      />
                      <textarea
                        id="course-desc-ar"
                        aria-label={t("descArabicPlaceholder")}
                        rows={4}
                        value={descAr}
                        onChange={(e) => setDescAr(e.target.value)}
                        placeholder={t("descArabicPlaceholder")}
                        dir="rtl"
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50 resize-none text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Attributes & Pricing Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#0F5244]">
                    <Layers size={18} className="shrink-0 text-[#0F5244]" />
                    <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {t("attributesPricingTitle")}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Select */}
                    <div className="space-y-1.5">
                      <label htmlFor="course-category-select" className="block text-xs font-bold text-slate-700">
                        {t("categoryLabel")}
                      </label>
                      <select
                        id="course-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-700 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50"
                      >
                        <option value="">{t("selectCategory")}</option>
                        {categoriesList.length > 0 ? (
                          categoriesList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="1">Programming</option>
                            <option value="4">Business Coaching</option>
                            <option value="5">Career Coaching</option>
                            <option value="2">Fitness Coaching</option>
                            <option value="6">Life & Mindfulness</option>
                            <option value="3">Nutrition</option>
                            <option value="7">Public Speaking</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Level Select */}
                    <div className="space-y-1.5">
                      <label htmlFor="course-level-select" className="block text-xs font-bold text-slate-700">
                        {t("levelLabel")}
                      </label>
                      <select
                        id="course-level-select"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-700 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50"
                      >
                        <option value="">{t("selectLevel")}</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="all">All Levels</option>
                      </select>
                    </div>

                    {/* Primary Language */}
                    <div className="space-y-1.5">
                      <label htmlFor="course-language-select" className="block text-xs font-bold text-slate-700">
                        {t("primaryLanguageLabel")}
                      </label>
                      <select
                        id="course-language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-700 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50"
                      >
                        <option value="Bilingual (EN/AR)">{t("bilingual")}</option>
                        <option value="Arabic">{t("arabic")}</option>
                        <option value="English">{t("english")}</option>
                      </select>
                    </div>

                    {/* Price Input ($ USD) */}
                    <div className="space-y-1.5">
                      <label htmlFor="course-price-input" className="block text-xs font-bold text-slate-700">
                        {t("priceLabel")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                          $
                        </span>
                        <input
                          id="course-price-input"
                          type="text"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full h-11 rounded-xl border border-slate-200 pl-8 rtl:pl-3.5 rtl:pr-8 text-xs sm:text-sm text-slate-900 font-bold placeholder:text-slate-500 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (1 Col): Vertical Big Course Cover Upload Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#0F5244]">
                  <ImageIcon size={18} className="shrink-0 text-[#0F5244]" />
                  <h2 className="font-extrabold text-slate-900 text-base">
                    {t("courseCoverTitle")}
                  </h2>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload Course Cover Image"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="rounded-2xl border-2 border-dashed border-slate-200/90 bg-slate-50/50 p-8 text-center hover:border-[#0F5244] hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[340px]"
                >
                  {coverPreview ? (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                      <Image
                        src={coverPreview}
                        alt="Course Cover"
                        width={600}
                        height={340}
                        unoptimized={coverPreview.startsWith("data:") || coverPreview.startsWith("blob:")}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-xs font-bold px-4 py-2 rounded-lg bg-white/20 backdrop-blur-xs">
                          {t("changeCover")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/60 text-slate-600">
                        <CloudUpload size={28} />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-black text-slate-900">
                          {t("dragDropImage")}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {t("clickToBrowse")}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal max-w-xs font-medium pt-2">
                        {t("coverDimensionsNotice")}
                      </p>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CURRICULUM BUILDER TAB                            */}
        {/* ========================================================= */}
        {activeTab === "curriculum" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {t("curriculumBuilderTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  {t("curriculumBuilderSubtitle")}
                </p>
              </div>

              <button
                type="button"
                aria-label={t("addSectionBtn")}
                onClick={addSection}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0F5244] border border-[#0F5244]/30 text-xs sm:text-sm font-extrabold shadow-2xs transition-all cursor-pointer w-fit"
              >
                <Plus size={16} />
                <span>{t("addSectionBtn")}</span>
              </button>
            </div>

            {/* Grid Layout: Left Sections List + Right Cover Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* LEFT COLUMN: Sections & Lessons List */}
              <div className="lg:col-span-2 space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                  >
                    {/* Section Header Row */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <GripVertical size={18} className="text-slate-400 cursor-grab shrink-0" />
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {section.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={t("editSectionTitlePrompt")}
                          onClick={() => {
                            const newTitle = prompt(
                              t("editSectionTitlePrompt"),
                              section.title
                            );
                            if (newTitle) {
                              setSections(
                                sections.map((s) =>
                                  s.id === section.id ? { ...s, title: newTitle } : s
                                )
                              );
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#0F5244] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete section"
                          onClick={() => deleteSection(section.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Section Warning Alert */}
                    {section.warning && (
                      <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200/90 text-red-700 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-600 shrink-0" />
                        <span>{section.warning}</span>
                      </div>
                    )}

                    {/* Sub-Lessons List */}
                    <div className="space-y-2 pt-1">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium group hover:bg-slate-100/80 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <GripVertical size={16} className="text-slate-400 group-hover:text-slate-500 cursor-grab shrink-0" />
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                              lesson.video_url || lesson.video_public_id
                                ? "bg-emerald-100 text-[#0F5244]"
                                : "bg-slate-200/70 text-slate-500"
                            }`}>
                              <PlayCircle size={15} />
                            </div>
                            <div className="truncate">
                              <span className="text-slate-900 font-bold block truncate">
                                {isAr ? lesson.title_ar || lesson.title : lesson.title_en || lesson.title}
                              </span>
                              {lesson.is_preview && (
                                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                                  {isAr ? "معاينة مجانية" : "Free Preview"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-500 text-[11px] font-mono">{lesson.duration || `${lesson.duration_minutes || 5}:00`}</span>
                            
                            <button
                              type="button"
                              aria-label="Edit lesson"
                              onClick={() => openEditLessonModal(section.id, lesson)}
                              className="p-1 text-slate-500 hover:text-[#0F5244] rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                              title={t("editLesson") || "Edit Lesson"}
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              type="button"
                              aria-label="Delete lesson"
                              onClick={() => deleteLesson(section.id, lesson.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Button inside section */}
                      <button
                        type="button"
                        aria-label={t("addVideoLesson")}
                        onClick={() => openAddLessonModal(section.id)}
                        className="w-full mt-2 py-2 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-[#0F5244] hover:text-[#0F5244] hover:bg-emerald-50/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>{t("addVideoLesson")}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Dotted Drop Zone Placeholder */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={t("clickToAddSection")}
                  onClick={addSection}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") addSection();
                  }}
                  className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/40 p-8 text-center hover:border-[#0F5244] hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                >
                  <Plus size={24} className="text-slate-500 group-hover:text-[#0F5244] transition-colors" />
                  <span className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-[#0F5244]">
                    {t("clickToAddSection")}
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: Course Settings & Cover Image Upload Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2.5">
                  {t("courseSettingsTitle")}
                </h3>

                <div className="space-y-2">
                  <label htmlFor="course-settings-file" className="block text-xs font-bold text-slate-700">
                    {t("coverImageRequired")}
                  </label>

                  {/* Upload Box Container */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload Cover Image"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 min-h-[160px] ${
                      uploadError
                        ? "border-red-300 bg-red-50/50"
                        : coverPreview
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-red-300/80 bg-red-50/20 hover:bg-red-50/40"
                    }`}
                  >
                    {coverPreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                        <Image
                          src={coverPreview}
                          alt="Cover Preview"
                          width={400}
                          height={160}
                          unoptimized={coverPreview.startsWith("data:") || coverPreview.startsWith("blob:")}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-bold">
                            {t("changeCover")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100/80 text-red-600">
                          <ImageIcon size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                            {t("clickToUploadDrop")}
                          </p>
                          <p className="text-[10px] text-red-600 font-semibold">
                            {t("onlyImagesNotice")}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Size Error Notification */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 pt-1">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>
                      {uploadError || t("fileSizeExceedsLimit")}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CLEAN BOTTOM ACTIONS ROW (Without White Card Wrapper, Compact Spacing) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-2">
          {/* Left Side: Back Link */}
          <button
            type="button"
            aria-label={t("backToCourses")}
            onClick={() => router.push(`/${locale}/instructor/courses`)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0F5244] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t("backToCourses")}</span>
          </button>

          {/* Right Side: Save Draft & Submit Course Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              aria-label={t("saveDraft")}
              onClick={handleSaveDraft}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Save size={16} />
              <span>{t("saveDraft")}</span>
            </button>

            <button
              type="button"
              aria-label={t("submitCourse")}
              onClick={handleSubmitCourse}
              className="px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Send size={16} />
              <span>{t("submitCourse")}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Lesson Edit / Video Upload Modal */}
      {editingLessonInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center">
                  <PlayCircle className="h-4 w-4 text-[#0F5244]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingLessonInfo.isNew
                    ? isAr
                      ? "إضافة درس جديد"
                      : "Add New Lesson"
                    : isAr
                    ? "تعديل الدرس"
                    : "Edit Lesson"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLessonInfo(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Title EN & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("lessonTitleEn") || "Lesson Title (English)"} *
                  </label>
                  <input
                    type="text"
                    value={editingLessonInfo.lesson.title_en ?? editingLessonInfo.lesson.title}
                    onChange={(e) =>
                      setEditingLessonInfo({
                        ...editingLessonInfo,
                        lesson: {
                          ...editingLessonInfo.lesson,
                          title_en: e.target.value,
                          title: isAr ? editingLessonInfo.lesson.title : e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Introduction to Routing"
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("lessonTitleAr") || "Lesson Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingLessonInfo.lesson.title_ar ?? ""}
                    onChange={(e) =>
                      setEditingLessonInfo({
                        ...editingLessonInfo,
                        lesson: {
                          ...editingLessonInfo.lesson,
                          title_ar: e.target.value,
                          title: isAr ? e.target.value : editingLessonInfo.lesson.title,
                        },
                      })
                    }
                    placeholder="مثال: مقدمة إلى التوجيه"
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244] text-right"
                  />
                </div>
              </div>

              {/* Duration & Free Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("lessonDuration") || "Duration (Minutes)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={editingLessonInfo.lesson.duration_minutes ?? 5}
                    onChange={(e) =>
                      setEditingLessonInfo({
                        ...editingLessonInfo,
                        lesson: {
                          ...editingLessonInfo.lesson,
                          duration_minutes: Number(e.target.value),
                          duration: `${e.target.value}:00`,
                        },
                      })
                    }
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244]"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(editingLessonInfo.lesson.is_preview || editingLessonInfo.lesson.isFreePreview)}
                      onChange={(e) =>
                        setEditingLessonInfo({
                          ...editingLessonInfo,
                          lesson: {
                            ...editingLessonInfo.lesson,
                            is_preview: e.target.checked,
                            isFreePreview: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-[#0F5244] focus:ring-[#0F5244] accent-[#0F5244]"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {t("freePreview") || "Free Preview (Publicly accessible)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Direct-to-Cloudinary Video Uploader */}
              <div className="pt-2">
                <LessonVideoUploader
                  courseId={courseId}
                  sectionId={editingLessonInfo.sectionId}
                  lessonId={editingLessonInfo.isNew ? undefined : editingLessonInfo.lesson.id}
                  initialVideoUrl={editingLessonInfo.lesson.video_url}
                  isAr={isAr}
                  lessonData={{
                    title_ar: editingLessonInfo.lesson.title_ar,
                    title_en: editingLessonInfo.lesson.title_en,
                    duration_minutes: editingLessonInfo.lesson.duration_minutes,
                    is_preview: editingLessonInfo.lesson.is_preview,
                  }}
                  onUploadComplete={(result) => {
                    setEditingLessonInfo((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        lesson: {
                          ...prev.lesson,
                          video_url: result.video_url,
                          video_public_id: result.public_id,
                          duration_minutes: result.duration
                            ? Math.round(result.duration / 60)
                            : prev.lesson.duration_minutes,
                          duration: result.duration
                            ? `${Math.round(result.duration / 60)}:00`
                            : prev.lesson.duration,
                        },
                      };
                    });
                  }}
                  onVideoRemove={() => {
                    setEditingLessonInfo((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        lesson: {
                          ...prev.lesson,
                          video_url: undefined,
                          video_public_id: undefined,
                        },
                      };
                    });
                  }}
                  onExternalUrlChange={(url) => {
                    setEditingLessonInfo((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        lesson: {
                          ...prev.lesson,
                          video_url: url,
                          video_public_id: undefined,
                        },
                      };
                    });
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingLessonInfo(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                {t("cancel") || "Cancel"}
              </button>

              <button
                type="button"
                onClick={() => saveEditedLesson(editingLessonInfo.lesson)}
                className="px-5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                {t("saveLesson") || "Save Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {t("coursePreviewTitle")}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                aria-label={t("closePreview")}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <p><strong>Title (EN):</strong> {titleEn || "React 19 & Next.js Masterclass"}</p>
              <p><strong>العنوان (AR):</strong> {titleAr || "دورة احتراف React 19 و Next.js"}</p>
              <p><strong>Category:</strong> {category || "Web Development"}</p>
              <p><strong>Price:</strong> ${price}</p>
              <p><strong>{t("sectionsCount")}:</strong> {sections.length}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                aria-label={t("closePreview")}
                className="px-5 py-2.5 rounded-xl bg-[#0F5244] text-white text-xs font-bold hover:bg-[#07382E]"
              >
                {t("closePreview")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
