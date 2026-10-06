"use client";

import React from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  PlayCircle,
  AlertTriangle,
  AlertCircle,
  Eye,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Check,
} from "lucide-react";
import { Section, Lesson } from "./types";
import { CourseMaterialsManager } from "@/components/instructor/attachments/CourseMaterialsManager";

interface StudioStepCurriculumProps {
  t: any;
  isAr: boolean;
  courseId: string;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  isSaving: boolean;
  isLockedForReview: boolean;
  step2Submitted: boolean;
  isStep2Valid: boolean;
  step2ErrorsList: string[];
  totalLessonsCount: number;
  totalDurationMins: number;
  totalVideosAttachedCount: number;
  coverPreview: string | null;
  addSection: () => void;
  openAddLessonModal: (secId: string) => void;
  openEditLessonModal: (secId: string, lesson: Lesson) => void;
  moveSection: (index: number, direction: "up" | "down") => void;
  moveLesson: (secId: string, lessonIndex: number, direction: "up" | "down") => void;
  toggleLessonPreview: (secId: string, lesId: string, currentPreview: boolean) => void;
  deleteSection: (secId: string) => void;
  deleteLesson: (secId: string, lesId: string) => void;
  handleSaveDraft: () => void;
  handleContinueToReview: () => void;
  setActiveStep: (step: "info" | "curriculum" | "review") => void;
  setShowPreviewModal: (val: boolean) => void;
}

export function StudioStepCurriculum({
  t,
  isAr,
  courseId,
  sections,
  setSections,
  isSaving,
  isLockedForReview,
  step2Submitted,
  isStep2Valid,
  step2ErrorsList,
  totalLessonsCount,
  totalDurationMins,
  totalVideosAttachedCount,
  coverPreview,
  addSection,
  openAddLessonModal,
  openEditLessonModal,
  moveSection,
  moveLesson,
  toggleLessonPreview,
  deleteSection,
  deleteLesson,
  handleSaveDraft,
  handleContinueToReview,
  setActiveStep,
  setShowPreviewModal,
}: StudioStepCurriculumProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("curriculumBuilderTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t("curriculumBuilderSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
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
            disabled={isSaving || isLockedForReview}
            className={`px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              isLockedForReview
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-slate-50 cursor-pointer"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[var(--color-primary-main)]" />
            )}
            <span>{t("saveDraft")}</span>
          </button>

          {!isLockedForReview && (
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark hover:bg-[#07382E] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer w-fit"
            >
              <Plus size={16} />
              <span>{t("addSectionBtn")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation Banner if submitted with missing sections or videos */}
      {step2Submitted && !isStep2Valid && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-extrabold">
              {t("validationFixErrorsPrompt")}
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 font-medium">
              {step2ErrorsList.map((errText, idx) => (
                <li key={idx}>{errText}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grid Layout: Left Sections List + Right Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Sections & Lessons List */}
        <div className="lg:col-span-2 space-y-4">
          {sections.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                {t("noSectionsAdded")}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {t("noSectionsAddedDesc")}
              </p>
              {!isLockedForReview && (
                <button
                  type="button"
                  onClick={addSection}
                  className="mt-2 px-5 py-2.5 rounded-2xl bg-brand-dark text-white text-xs font-extrabold flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} />
                  <span>{t("addSectionBtn")}</span>
                </button>
              )}
            </div>
          ) : (
            sections.map((section, sIdx) => {
              const hasLessons =
                section.lessons && section.lessons.length > 0;
              return (
                <div
                  key={section.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-2xs space-y-3.5 transition-all ${
                    !hasLessons && step2Submitted
                      ? "border-amber-300 bg-amber-50/10"
                      : "border-slate-200/90"
                  }`}
                >
                  {/* Section Header Row */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GripVertical
                        size={18}
                        className="text-slate-400 cursor-grab shrink-0"
                      />
                      <span className="font-black text-slate-900 text-sm sm:text-base truncate">
                        {section.title}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        {t("lessonsCount", {
                          count: section.lessons.length,
                        })}
                      </span>
                    </div>

                    {!isLockedForReview && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Move Section Up / Down */}
                        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl">
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => moveSection(sIdx, "up")}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              sIdx === 0
                                ? "opacity-30 cursor-not-allowed text-slate-400"
                                : "text-slate-600 hover:text-[var(--color-primary-main)] hover:bg-white"
                            }`}
                            title={
                              isAr
                                ? "نقل القسم للأعلى"
                                : "Move section up"
                            }
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={sIdx === sections.length - 1}
                            onClick={() => moveSection(sIdx, "down")}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              sIdx === sections.length - 1
                                ? "opacity-30 cursor-not-allowed text-slate-400"
                                : "text-slate-600 hover:text-[var(--color-primary-main)] hover:bg-white"
                            }`}
                            title={
                              isAr
                                ? "نقل القسم للأسفل"
                                : "Move section down"
                            }
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newTitle = prompt(
                              t("editSectionTitlePrompt"),
                              section.title,
                            );
                            if (newTitle) {
                              setSections(
                                sections.map((s) =>
                                  s.id === section.id
                                    ? {
                                        ...s,
                                        title: newTitle,
                                        title_en: newTitle,
                                        title_ar: newTitle,
                                      }
                                    : s,
                                ),
                              );
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-[var(--color-primary-main)] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          title={t("editSectionTitlePrompt")}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSection(section.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Section"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section Empty Warning Badge */}
                  {!hasLessons && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle
                        size={15}
                        className="text-amber-600 shrink-0"
                      />
                      <span>{t("emptySectionWarning")}</span>
                    </div>
                  )}

                  {/* Sub-Lessons List */}
                  <div className="space-y-2">
                    {section.lessons.map((lesson, lIdx) => {
                      const hasVideo = Boolean(
                        lesson.video_url || lesson.video_public_id,
                      );
                      return (
                        <div
                          key={lesson.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border text-xs font-medium gap-3 transition-all ${
                            !hasVideo
                              ? "bg-rose-50/40 border-rose-200"
                              : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <GripVertical
                              size={16}
                              className="text-slate-400 cursor-grab shrink-0"
                            />
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                                hasVideo
                                  ? "bg-slate-200 text-[var(--color-primary-main)]"
                                  : "bg-rose-100 text-rose-600"
                              }`}
                            >
                              <PlayCircle size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-slate-900 font-bold block truncate">
                                {isAr
                                  ? lesson.title_ar || lesson.title
                                  : lesson.title_en || lesson.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {hasVideo ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[var(--color-primary-main)] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                    <Check size={10} />
                                    {lesson.video_public_id
                                      ? t("uploadedCloudinaryVideo")
                                      : t("externalVideoLink")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-300">
                                    <AlertCircle size={10} />
                                    {t("noVideoWarning")}
                                  </span>
                                )}


                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                            <span className="text-slate-500 text-xs font-mono">
                              {lesson.duration ||
                                `${lesson.duration_minutes || 5}:00`}
                            </span>

                            {!isLockedForReview ? (
                              <>
                                {/* Quick Toggle Free Preview */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleLessonPreview(
                                      section.id,
                                      lesson.id,
                                      Boolean(lesson.is_preview),
                                    )
                                  }
                                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                                    lesson.is_preview
                                      ? "bg-slate-100 text-[var(--color-primary-main)] border-slate-300 hover:bg-slate-200"
                                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                  }`}
                                  title={
                                    isAr
                                      ? "تبديل المعاينة المجانية للدرس"
                                      : "Toggle Free Preview"
                                  }
                                >
                                  <Eye
                                    size={11}
                                    className="inline mr-1 rtl:ml-1"
                                  />
                                  <span>{t("freePreview")}</span>
                                </button>

                                {/* Move Lesson Up / Down */}
                                <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                                  <button
                                    type="button"
                                    disabled={lIdx === 0}
                                    onClick={() =>
                                      moveLesson(section.id, lIdx, "up")
                                    }
                                    className={`p-1 rounded transition-colors cursor-pointer ${
                                      lIdx === 0
                                        ? "opacity-30 cursor-not-allowed text-slate-400"
                                        : "text-slate-600 hover:text-[var(--color-primary-main)] hover:bg-white"
                                    }`}
                                    title={
                                      isAr
                                        ? "نقل الدرس للأعلى"
                                        : "Move lesson up"
                                    }
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      lIdx === section.lessons.length - 1
                                    }
                                    onClick={() =>
                                      moveLesson(section.id, lIdx, "down")
                                    }
                                    className={`p-1 rounded transition-colors cursor-pointer ${
                                      lIdx === section.lessons.length - 1
                                        ? "opacity-30 cursor-not-allowed text-slate-400"
                                        : "text-slate-600 hover:text-[var(--color-primary-main)] hover:bg-white"
                                    }`}
                                    title={
                                      isAr
                                        ? "نقل الدرس للأسفل"
                                        : "Move lesson down"
                                    }
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditLessonModal(
                                      section.id,
                                      lesson,
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                    hasVideo
                                      ? "bg-slate-100 hover:bg-brand-dark hover:text-white text-slate-700"
                                      : "bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                                  }`}
                                >
                                  <Edit2 size={12} />
                                  <span>
                                    {hasVideo
                                      ? t("editLesson")
                                      : t("fixLesson")}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteLesson(section.id, lesson.id)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowPreviewModal(true)}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-slate-100 text-[var(--color-primary-main)] border border-slate-200 transition-all cursor-pointer"
                              >
                                <PlayCircle size={13} />
                                <span>{t("previewBtn")}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Lesson Button inside section */}
                    {!isLockedForReview && (
                      <button
                        type="button"
                        onClick={() => openAddLessonModal(section.id)}
                        className="w-full mt-2 py-2.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-600 hover:border-brand-dark hover:text-[var(--color-primary-main)] hover:bg-slate-100/40 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>{t("addVideoLesson")}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Add Another Section Button */}
          <div
            role="button"
            tabIndex={0}
            onClick={addSection}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") addSection();
            }}
            className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-100/40 p-6 text-center hover:border-brand-dark hover:bg-slate-100/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
          >
            <Plus
              size={22}
              className="text-slate-500 group-hover:text-[var(--color-primary-main)] transition-colors"
            />
            <span className="text-xs sm:text-sm font-extrabold text-slate-700 group-hover:text-[var(--color-primary-main)]">
              {t("clickToAddSection")}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Curriculum Checklist & Stats Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            {t("checklistTitle")}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
              <span className="font-bold text-slate-600">
                {t("totalSections")}
              </span>
              <span className="font-black text-[var(--color-primary-main)] text-sm">
                {sections.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
              <span className="font-bold text-slate-600">
                {t("totalLessons")}
              </span>
              <span className="font-black text-[var(--color-primary-main)] text-sm">
                {totalLessonsCount}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
              <span className="font-bold text-slate-600">
                {t("totalDuration")}
              </span>
              <span className="font-black text-slate-800 text-sm">
                {totalDurationMins} {t("minutes")}
              </span>
            </div>
          </div>

          {/* Validation Status Box */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div
              className={`flex items-center gap-2 text-xs font-extrabold ${sections.length > 0 ? "text-[var(--color-primary-main)]" : "text-rose-600"}`}
            >
              {sections.length > 0 ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{t("checklistSectionsPassed")}</span>
            </div>

            <div
              className={`flex items-center gap-2 text-xs font-extrabold ${totalLessonsCount > 0 && totalVideosAttachedCount === totalLessonsCount ? "text-[var(--color-primary-main)]" : "text-rose-600"}`}
            >
              {totalLessonsCount > 0 &&
              totalVideosAttachedCount === totalLessonsCount ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {t("checklistVideosPassed")} ({totalVideosAttachedCount}/
                {totalLessonsCount})
              </span>
            </div>
          </div>

          {/* Cover Thumbnail Preview */}
          {coverPreview && (
            <div className="pt-2">
              <span className="block text-[11px] font-extrabold text-slate-500 mb-1.5">
                {t("courseCoverTitle")}
              </span>
              <div className="h-28 w-full rounded-2xl overflow-hidden border border-slate-200">
                <Image
                  src={coverPreview}
                  alt="Cover"
                  width={300}
                  height={120}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course-level Materials & Resources Manager */}
      {courseId ? (
        <div className="pt-2">
          <CourseMaterialsManager courseId={courseId} readOnly={isLockedForReview} />
        </div>
      ) : null}

      {/* Bottom Navigation for Step 2 */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/70">
        <button
          type="button"
          onClick={() => {
            setActiveStep("info");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t("backToInfo")}</span>
        </button>

        <button
          type="button"
          onClick={handleContinueToReview}
          className="px-6 py-3 rounded-2xl bg-brand-dark hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <span>{t("continueToReview")}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
