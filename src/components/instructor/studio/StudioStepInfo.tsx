"use client";

import React, { RefObject } from "react";
import Image from "next/image";
import {
  FileText,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Save,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { CategoryItem } from "@/types/catalog";

interface StudioStepInfoProps {
  t: any;
  locale: string;
  isAr: boolean;
  router: any;
  isSaving: boolean;
  isLockedForReview: boolean;
  step1Submitted: boolean;
  isStep1Valid: boolean;
  step1FieldErrors: Record<string, string>;
  titleEn: string;
  setTitleEn: (val: string) => void;
  titleAr: string;
  setTitleAr: (val: string) => void;
  descEn: string;
  setDescEn: (val: string) => void;
  descAr: string;
  setDescAr: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categoriesList: CategoryItem[];
  level: string;
  setLevel: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  coverPreview: string | null;
  isCoverValid: boolean;
  uploadError: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleDrop: (e: React.DragEvent) => void;
  handleSaveDraft: () => void;
  handleContinueToCurriculum: () => void;
  setShowPreviewModal: (val: boolean) => void;
}

export function StudioStepInfo({
  t,
  locale,
  isAr,
  router,
  isSaving,
  isLockedForReview,
  step1Submitted,
  isStep1Valid,
  step1FieldErrors,
  titleEn,
  setTitleEn,
  titleAr,
  setTitleAr,
  descEn,
  setDescEn,
  descAr,
  setDescAr,
  category,
  setCategory,
  categoriesList,
  level,
  setLevel,
  language,
  setLanguage,
  price,
  setPrice,
  coverPreview,
  isCoverValid,
  uploadError,
  fileInputRef,
  handleDrop,
  handleSaveDraft,
  handleContinueToCurriculum,
  setShowPreviewModal,
}: StudioStepInfoProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("courseDetailsTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t("courseDetailsSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{t("previewBtn")}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[var(--color-primary-main)]" />
            )}
            <span>{t("saveDraft")}</span>
          </button>
        </div>
      </div>

      {/* Validation Banner if submitted with errors */}
      {step1Submitted && !isStep1Valid && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold">
              {t("validationFixErrorsPrompt")}
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-rose-700">
              {step1FieldErrors.titleEn && (
                <li>{step1FieldErrors.titleEn}</li>
              )}
              {step1FieldErrors.titleAr && (
                <li>{step1FieldErrors.titleAr}</li>
              )}
              {step1FieldErrors.descEn && (
                <li>{step1FieldErrors.descEn}</li>
              )}
              {step1FieldErrors.descAr && (
                <li>{step1FieldErrors.descAr}</li>
              )}
              {step1FieldErrors.category && (
                <li>{step1FieldErrors.category}</li>
              )}
              {step1FieldErrors.price && (
                <li>{step1FieldErrors.price}</li>
              )}
              {step1FieldErrors.cover && (
                <li>{step1FieldErrors.cover}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Basic Info & Attributes */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[var(--color-primary-main)]">
              <FileText size={18} className="shrink-0 text-[var(--color-primary-main)]" />
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {t("basicInfoTitle")}
              </h2>
            </div>

            {/* Course Title (EN & AR) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                {t("courseTitleLabel")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    id="course-title-en"
                    type="text"
                    value={titleEn}
                    disabled={isLockedForReview}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder={t("titleEnglishPlaceholder")}
                    className={`w-full h-11 rounded-2xl border px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 ${
                      isLockedForReview
                        ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                        : step1Submitted && !titleEn.trim()
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                          : "border-slate-200 focus:border-brand-dark focus:ring-brand-dark/10"
                    }`}
                  />
                  {step1Submitted && !titleEn.trim() && (
                    <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                      {t("validationTitleEnRequired")}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    id="course-title-ar"
                    type="text"
                    value={titleAr}
                    disabled={isLockedForReview}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder={t("titleArabicPlaceholder")}
                    dir="rtl"
                    className={`w-full h-11 rounded-2xl border px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 text-right ${
                      isLockedForReview
                        ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                        : step1Submitted && !titleAr.trim()
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                          : "border-slate-200 focus:border-brand-dark focus:ring-brand-dark/10"
                    }`}
                  />
                  {step1Submitted && !titleAr.trim() && (
                    <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                      {t("validationTitleArRequired")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Course Description (EN & AR) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                {t("courseDescLabel")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <textarea
                    id="course-desc-en"
                    rows={4}
                    value={descEn}
                    disabled={isLockedForReview}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder={t("descEnglishPlaceholder")}
                    className={`w-full rounded-2xl border p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 resize-none ${
                      isLockedForReview
                        ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                        : step1Submitted && !descEn.trim()
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                          : "border-slate-200 focus:border-brand-dark focus:ring-brand-dark/10"
                    }`}
                  />
                  {step1Submitted && !descEn.trim() && (
                    <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                      {t("validationDescEnRequired")}
                    </span>
                  )}
                </div>

                <div>
                  <textarea
                    id="course-desc-ar"
                    rows={4}
                    value={descAr}
                    disabled={isLockedForReview}
                    onChange={(e) => setDescAr(e.target.value)}
                    placeholder={t("descArabicPlaceholder")}
                    dir="rtl"
                    className={`w-full rounded-2xl border p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 resize-none text-right ${
                      isLockedForReview
                        ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                        : step1Submitted && !descAr.trim()
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                          : "border-slate-200 focus:border-brand-dark focus:ring-brand-dark/10"
                    }`}
                  />
                  {step1Submitted && !descAr.trim() && (
                    <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                      {t("validationDescArRequired")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Attributes & Pricing Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[var(--color-primary-main)]">
              <Layers size={18} className="shrink-0 text-[var(--color-primary-main)]" />
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {t("attributesPricingTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  {t("categoryLabel")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  id="course-category-select"
                  value={category}
                  disabled={isLockedForReview}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full h-11 rounded-2xl border px-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 bg-slate-50/50 ${
                    isLockedForReview
                      ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                      : step1Submitted && !category
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                        : "border-slate-200 focus:border-brand-dark focus:ring-brand-dark/10"
                  }`}
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
                {step1Submitted && !category && (
                  <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                    {t("validationCategoryRequired")}
                  </span>
                )}
              </div>

              {/* Level Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  {t("levelLabel")}
                </label>
                <select
                  id="course-level-select"
                  value={level}
                  disabled={isLockedForReview}
                  onChange={(e) => setLevel(e.target.value)}
                  className={`w-full h-11 rounded-2xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-800 focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/10 bg-slate-50/50 ${
                    isLockedForReview
                      ? "bg-slate-100/80 cursor-not-allowed text-slate-600"
                      : ""
                  }`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels</option>
                </select>
              </div>

              {/* Primary Language */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  {t("primaryLanguageLabel")}
                </label>
                <select
                  id="course-language-select"
                  value={language}
                  disabled={isLockedForReview}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full h-11 rounded-2xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-800 focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/10 bg-slate-50/50 ${
                    isLockedForReview
                      ? "bg-slate-100/80 cursor-not-allowed text-slate-600"
                      : ""
                  }`}
                >
                  <option value="Bilingual (EN/AR)">
                    {t("bilingual")}
                  </option>
                  <option value="Arabic">{t("arabic")}</option>
                  <option value="English">{t("english")}</option>
                </select>
              </div>

              {/* Price Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  {t("priceLabel")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                    $
                  </span>
                  <input
                    id="course-price-input"
                    type="text"
                    value={price}
                    disabled={isLockedForReview}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={`w-full h-11 rounded-2xl border pl-8 rtl:pl-3.5 rtl:pr-8 text-xs sm:text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 ${
                      isLockedForReview
                        ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                        : step1Submitted &&
                            (isNaN(Number(price)) || Number(price) < 0)
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                          : "border-slate-200 focus:border-brand-dark focus:ring-brand-dark/10"
                    }`}
                  />
                </div>
                {step1Submitted &&
                  (isNaN(Number(price)) || Number(price) < 0) && (
                    <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                      {t("validationPriceRequired")}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Big Cover Image Upload Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[var(--color-primary-main)]">
            <ImageIcon size={18} className="shrink-0 text-[var(--color-primary-main)]" />
            <h2 className="font-extrabold text-slate-900 text-base">
              {t("courseCoverTitle")}{" "}
              <span className="text-rose-500">*</span>
            </h2>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload Course Cover"
            onClick={() => {
              if (!isLockedForReview) fileInputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (
                !isLockedForReview &&
                (e.key === "Enter" || e.key === " ")
              ) {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => !isLockedForReview && e.preventDefault()}
            onDrop={(e) => !isLockedForReview && handleDrop(e)}
            className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] ${
              isLockedForReview
                ? "border-slate-200 bg-slate-50/50 cursor-default"
                : step1Submitted && !isCoverValid
                  ? "border-rose-300 bg-rose-50/30 cursor-pointer"
                  : isCoverValid
                    ? "border-slate-300 bg-slate-100/20 cursor-pointer"
                    : "border-slate-300 hover:border-brand-dark hover:bg-slate-100/20 cursor-pointer"
            }`}
          >
            {isCoverValid && coverPreview ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden group">
                <Image
                  src={coverPreview}
                  alt="Course Cover"
                  width={400}
                  height={200}
                  unoptimized
                  className="w-full h-full object-cover"
                />
                {!isLockedForReview && (
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-extrabold bg-brand-dark px-4 py-2 rounded-xl shadow-md">
                      {t("changeCover")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[var(--color-primary-main)]">
                  <ImageIcon size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                    {t("dragDropImage")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("clickToBrowse")}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {t("coverDimensionsNotice")}
                </p>
              </>
            )}
          </div>

          {step1Submitted && !isCoverValid && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
              <AlertCircle size={14} className="shrink-0" />
              <span>{t("validationCoverRequired")}</span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
              <AlertCircle size={14} className="shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions for Step 1 */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/70">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/instructor/courses`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[var(--color-primary-main)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t("backToCourses")}</span>
        </button>

        <button
          type="button"
          onClick={handleContinueToCurriculum}
          className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md transition-all ${
            isStep1Valid
              ? "bg-brand-dark hover:bg-[#07382E] text-white cursor-pointer hover:shadow-lg hover:scale-[1.01]"
              : "bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer shadow-none"
          }`}
        >
          <span>{t("continueToCurriculum")}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
