"use client";

import React, { useState, useRef, memo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
  Send
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  warning?: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  warning?: string;
}

export function CreateCourseStudio() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const t = useTranslations("courseStudio");

  // Active Tab: "info" (Course Info) | "curriculum" (Curriculum)
  const [activeTab, setActiveTab] = useState<"info" | "curriculum">("info");

  // Form State - Basic Info
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");

  // Attributes & Pricing
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [language, setLanguage] = useState("Bilingual (EN/AR)");
  const [price, setPrice] = useState("0.00");

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
          duration: "02:15",
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

  // Modals / Preview / Save Feedback
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handlers for Cover Image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(t("fileSizeExceedsLimit"));
        return;
      }
      setUploadError(null);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(t("fileSizeExceedsLimit"));
        return;
      }
      setUploadError(null);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Section Handlers
  const addSection = () => {
    const nextNum = sections.length + 1;
    const newSec: Section = {
      id: `sec-${Date.now()}`,
      title: `${t("defaultSectionTitle")} ${nextNum}`,
      lessons: [
        {
          id: `les-${Date.now()}`,
          title: t("defaultLessonTitle"),
          duration: "05:00",
        },
      ],
    };
    setSections((prev) => [...prev, newSec]);
  };

  const addLesson = (secId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: [
              ...sec.lessons,
              {
                id: `les-${Date.now()}`,
                title: t("defaultLessonTitle"),
                duration: "03:30",
              },
            ],
          };
        }
        return sec;
      })
    );
  };

  const deleteSection = (secId: string) => {
    setSections(sections.filter((sec) => sec.id !== secId));
  };

  const deleteLesson = (secId: string, lesId: string) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.filter((l) => l.id !== lesId),
          };
        }
        return sec;
      })
    );
  };

  const handleSaveDraft = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
                        <option value="web-dev">Web Development</option>
                        <option value="ai">AI & Data Science</option>
                        <option value="design">UI/UX Design</option>
                        <option value="business">Business & Management</option>
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
                      <img
                        src={coverPreview}
                        alt="Course Cover"
                        width={600}
                        height={340}
                        loading="lazy"
                        decoding="async"
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
                          <div className="flex items-center gap-2.5">
                            <GripVertical size={16} className="text-slate-400 group-hover:text-slate-500 cursor-grab" />
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F5244]/10 text-[#0F5244] shrink-0">
                              <PlayCircle size={15} />
                            </div>
                            <span className="text-slate-900 font-bold">{lesson.title}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-[11px] font-mono">{lesson.duration}</span>
                            <button
                              type="button"
                              aria-label="Delete lesson"
                              onClick={() => deleteLesson(section.id, lesson.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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
                        onClick={() => addLesson(section.id)}
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
                        <img
                          src={coverPreview}
                          alt="Cover Preview"
                          width={400}
                          height={160}
                          loading="lazy"
                          decoding="async"
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
