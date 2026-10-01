"use client";

import React from "react";
import Image from "next/image";
import {
  Layers,
  Image as ImageIcon,
  PlayCircle,
  AlertCircle,
  Eye,
  Sparkles,
  Save,
  Send,
  Loader2,
  BookOpen,
  Clock,
  DollarSign,
  Film,
  ArrowLeft,
} from "lucide-react";
import { Section } from "./types";

interface StudioStepReviewProps {
  t: any;
  isAr: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isLockedForReview: boolean;
  isUnderReview: boolean;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  courseStatus: string;
  price: string;
  categoryDisplayName: string;
  level: string;
  language: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  coverPreview: string | null;
  sections: Section[];
  totalLessonsCount: number;
  totalDurationMins: number;
  setActiveStep: (step: "info" | "curriculum" | "review") => void;
  handleSaveDraft: () => void;
  handlePublishCourse: () => void;
  setShowPreviewModal: (val: boolean) => void;
}

export function StudioStepReview({
  t,
  isAr,
  isSaving,
  isPublishing,
  isLockedForReview,
  isUnderReview,
  isStep1Valid,
  isStep2Valid,
  courseStatus,
  price,
  categoryDisplayName,
  level,
  language,
  titleEn,
  titleAr,
  descEn,
  coverPreview,
  sections,
  totalLessonsCount,
  totalDurationMins,
  setActiveStep,
  handleSaveDraft,
  handlePublishCourse,
  setShowPreviewModal,
}: StudioStepReviewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("reviewTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t("reviewSubtitle")}
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
              <Save className="w-3.5 h-3.5 text-[#0F5244]" />
            )}
            <span>{t("saveDraft")}</span>
          </button>
        </div>
      </div>

      {/* Validation Checklist Alert Banner */}
      {isStep1Valid && isStep2Valid ? (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black">{t("readyToPublish")}</h3>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              {t("allRequirementsMet")}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3.5 shadow-2xs">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-black">
              {t("missingItemsAlert")}
            </h3>
            <div className="flex gap-2.5 flex-wrap">
              {!isStep1Valid && (
                <button
                  type="button"
                  onClick={() => setActiveStep("info")}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-2xs hover:bg-rose-700 cursor-pointer"
                >
                  {t("goToStep1")}
                </button>
              )}
              {!isStep2Valid && (
                <button
                  type="button"
                  onClick={() => setActiveStep("curriculum")}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-2xs hover:bg-rose-700 cursor-pointer"
                >
                  {t("goToStep2")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Summary Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Cover Image */}
          <div className="relative w-full md:w-64 h-44 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs bg-slate-100">
            {coverPreview ? (
              <Image
                src={coverPreview}
                alt="Course Cover"
                width={400}
                height={250}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon size={36} />
              </div>
            )}
            <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
              <span className="px-3 py-1 rounded-full bg-[#0F5244] text-white text-xs font-black shadow-md">
                {Number(price) > 0 ? `$${price}` : t("freeCourse")}
              </span>
            </div>
          </div>

          {/* Course Main Details */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#0F5244] border border-emerald-200/80 text-xs font-extrabold">
                {categoryDisplayName}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold uppercase">
                {level}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold">
                {language}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {titleEn}
            </h2>
            {titleAr && (
              <h3 dir="rtl" className="text-lg font-bold text-slate-700">
                {titleAr}
              </h3>
            )}

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">
              {descEn}
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
            <BookOpen className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-500 block">
              {t("totalSections")}
            </span>
            <span className="text-base font-black text-slate-900">
              {sections.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
            <Film className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-500 block">
              {t("totalLessons")}
            </span>
            <span className="text-base font-black text-slate-900">
              {totalLessonsCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
            <Clock className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-500 block">
              {t("totalDuration")}
            </span>
            <span className="text-base font-black text-slate-900">
              {totalDurationMins} {t("minutes")}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
            <DollarSign className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-500 block">
              {t("priceLabel")}
            </span>
            <span className="text-base font-black text-slate-900">
              ${price}
            </span>
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F5244]" />
            <span>{t("curriculumSummary")}</span>
          </h3>

          <button
            type="button"
            onClick={() => setActiveStep("curriculum")}
            className="text-xs font-extrabold text-[#0F5244] hover:underline"
          >
            {t("goToStep2")}
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((sec, sIdx) => (
            <div
              key={sec.id}
              className="rounded-2xl border border-slate-200/80 p-4 space-y-3 bg-slate-50/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">
                  {sIdx + 1}. {sec.title}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {t("lessonsCount", { count: sec.lessons.length })}
                </span>
              </div>

              <div className="space-y-2 pl-4 rtl:pl-0 rtl:pr-4 border-l-2 rtl:border-l-0 rtl:border-r-2 border-slate-200">
                {sec.lessons.map((les, lIdx) => {
                  const hasVideo = Boolean(
                    les.video_url || les.video_public_id,
                  );
                  return (
                    <div
                      key={les.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <PlayCircle
                          size={15}
                          className="text-[#0F5244] shrink-0"
                        />
                        <span className="font-bold text-slate-800 truncate">
                          {lIdx + 1}.{" "}
                          {isAr
                            ? les.title_ar || les.title
                            : les.title_en || les.title}
                        </span>
                        {les.is_preview && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                            {t("preview")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasVideo ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {t("videoAttached")}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {t("noVideoWarning")}
                          </span>
                        )}
                        <span className="text-slate-400 font-mono text-[11px]">
                          {les.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions for Step 3 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/70">
        <button
          type="button"
          onClick={() => {
            setActiveStep("curriculum");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t("backToCurriculum")}</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {isLockedForReview ? (
            <div className="px-6 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-black flex items-center gap-2 select-none shadow-2xs">
              <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>{t("statusUnderReviewLockedNotice")}</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-5 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{t("saveDraft")}</span>
              </button>

              <button
                type="button"
                onClick={handlePublishCourse}
                disabled={isPublishing || !isStep1Valid || !isStep2Valid}
                className={`px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2.5 transition-all shadow-md ${
                  isStep1Valid && isStep2Valid
                    ? "bg-[#0F5244] hover:bg-[#07382E] text-white cursor-pointer hover:shadow-xl hover:scale-[1.02]"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t("publishing")}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>
                      {courseStatus === "published"
                        ? t("saveChanges")
                        : isUnderReview
                        ? t("updateAndResubmitReview")
                        : t("publishCourse")}
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
