"use client";

import React from "react";
import { PlayCircle, X } from "lucide-react";
import { LessonVideoUploader } from "@/components/instructor/LessonVideoUploader";
import { LessonAttachmentsManager } from "@/components/instructor/attachments/LessonAttachmentsManager";
import { EditingLessonInfo, Lesson } from "./types";

interface LessonEditModalProps {
  t: any;
  isAr: boolean;
  courseId: string;
  editingLessonInfo: EditingLessonInfo | null;
  setEditingLessonInfo: React.Dispatch<React.SetStateAction<EditingLessonInfo | null>>;
  saveEditedLesson: (lesson: Lesson) => void;
}

export function LessonEditModal({
  t,
  isAr,
  courseId,
  editingLessonInfo,
  setEditingLessonInfo,
  saveEditedLesson,
}: LessonEditModalProps) {
  if (!editingLessonInfo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#0F5244] flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-[#0F5244]" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {editingLessonInfo.isNew
                ? t("addNewLesson")
                : t("editLesson")}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setEditingLessonInfo(null)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
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
                {t("lessonTitleEn")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={
                  editingLessonInfo.lesson.title_en ??
                  editingLessonInfo.lesson.title ??
                  ""
                }
                onChange={(e) =>
                  setEditingLessonInfo({
                    ...editingLessonInfo,
                    lesson: {
                      ...editingLessonInfo.lesson,
                      title_en: e.target.value,
                      title: isAr
                        ? editingLessonInfo.lesson.title
                        : e.target.value,
                    },
                  })
                }
                placeholder={t("lessonTitleEnPlaceholder")}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                {t("lessonTitleAr")}
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
                      title: isAr
                        ? e.target.value
                        : editingLessonInfo.lesson.title,
                    },
                  })
                }
                placeholder={t("lessonTitleArPlaceholder")}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244] text-right"
              />
            </div>
          </div>

          {/* Duration & Free Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                {t("lessonDuration")}
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
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244]"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(
                    editingLessonInfo.lesson.is_preview ||
                    editingLessonInfo.lesson.isFreePreview,
                  )}
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
                  {t("freePreview")}
                </span>
              </label>
            </div>
          </div>

          {/* Video Uploader Component */}
          <div className="pt-2">
            <LessonVideoUploader
              courseId={courseId}
              sectionId={editingLessonInfo.sectionId}
              lessonId={
                editingLessonInfo.isNew
                  ? undefined
                  : editingLessonInfo.lesson.id
              }
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

          {/* Lesson-level Attachments Manager */}
          <div className="pt-2">
            <LessonAttachmentsManager
              courseId={courseId}
              lessonId={editingLessonInfo.lesson.id}
              isNewLesson={editingLessonInfo.isNew}
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
            {t("cancel")}
          </button>

          <button
            type="button"
            onClick={() => saveEditedLesson(editingLessonInfo.lesson)}
            className="px-5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
          >
            {t("saveLesson")}
          </button>
        </div>
      </div>
    </div>
  );
}
