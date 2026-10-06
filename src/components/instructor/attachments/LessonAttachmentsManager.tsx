"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Upload,
  Trash2,
  Edit2,
  RefreshCw,
  Check,
  X,
  FileUp,
  Download,
  Loader2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { AttachmentItem } from "@/types/course";
import { courseAttachmentService } from "@/services/courseAttachmentService";
import { useAttachmentUpload } from "@/hooks/useAttachmentUpload";
import {
  AttachmentIcon,
  getFileCategory,
  formatFileSize,
} from "@/components/shared/AttachmentIcon";

interface LessonAttachmentsManagerProps {
  courseId: string | number;
  lessonId?: string | number;
  isNewLesson?: boolean;
  onCountChange?: (count: number) => void;
}

export function LessonAttachmentsManager({
  courseId,
  lessonId,
  isNewLesson = false,
  onCountChange,
}: LessonAttachmentsManagerProps) {
  const t = useTranslations("courseStudio");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [replacingAttachment, setReplacingAttachment] = useState<AttachmentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  const { isUploading, progress, uploadStatus, upload, cancel } = useAttachmentUpload();

  // Load lesson attachments when lessonId is available
  useEffect(() => {
    let isMounted = true;
    if (!lessonId || isNewLesson) {
      setAttachments([]);
      onCountChange?.(0);
      return;
    }

    setIsLoading(true);
    courseAttachmentService
      .listLessonAttachments(lessonId)
      .then((data) => {
        if (isMounted) {
          setAttachments(data);
          onCountChange?.(data.length);
        }
      })
      .catch((err) => {
        console.warn("[LessonAttachmentsManager] Error loading lesson attachments:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lessonId, isNewLesson, onCountChange]);

  // Handle uploading a new attachment for this lesson
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lessonId) return;

    setFeedbackMsg(null);
    try {
      const created = await upload(file, {
        courseId,
        lessonId,
      });

      setAttachments((prev) => {
        const next = [created, ...prev];
        onCountChange?.(next.length);
        return next;
      });

      setFeedbackMsg({
        type: "success",
        text: isAr ? "تم رفع مرفق الدرس بنجاح!" : "Lesson attachment uploaded successfully!",
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || (isAr ? "فشل رفع الملف" : "Failed to upload file"),
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle replacing an existing attachment file (PATCH)
  const handleReplaceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingAttachment) return;

    setFeedbackMsg(null);
    try {
      const updated = await upload(file, {
        courseId,
        lessonId,
        replaceAttachmentId: replacingAttachment.id,
        customFileName: file.name,
      });

      setAttachments((prev) =>
        prev.map((item) => (item.id === replacingAttachment.id ? updated : item))
      );

      setFeedbackMsg({
        type: "success",
        text: isAr ? "تم استبدال الملف بنجاح!" : "Attachment file replaced successfully!",
      });
      setReplacingAttachment(null);
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || (isAr ? "فشل استبدال الملف" : "Failed to replace file"),
      });
    } finally {
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
    }
  };

  // Handle renaming an attachment (PATCH)
  const handleSaveRename = async (attachmentId: string | number) => {
    if (!editingName.trim()) return;

    setIsSavingName(true);
    setFeedbackMsg(null);
    try {
      const updated = await courseAttachmentService.updateAttachment(attachmentId, {
        file_name: editingName.trim(),
      });

      setAttachments((prev) =>
        prev.map((item) => (item.id === attachmentId ? updated : item))
      );
      setEditingId(null);
      setFeedbackMsg({
        type: "success",
        text: isAr ? "تم تحديث اسم المرفق" : "Attachment renamed successfully",
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || (isAr ? "فشل تعديل الاسم" : "Failed to rename attachment"),
      });
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle deleting an attachment (DELETE)
  const handleDelete = async (attachmentId: string | number) => {
    setDeletingId(attachmentId);
    setFeedbackMsg(null);
    try {
      await courseAttachmentService.deleteAttachment(attachmentId);
      setAttachments((prev) => {
        const next = prev.filter((item) => item.id !== attachmentId);
        onCountChange?.(next.length);
        return next;
      });
      setFeedbackMsg({
        type: "success",
        text: isAr ? "تم حذف المرفق" : "Attachment deleted",
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || (isAr ? "فشل حذف المرفق" : "Failed to delete attachment"),
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Handle downloading attachment
  const handleDownload = async (attachment: AttachmentItem) => {
    try {
      await courseAttachmentService.downloadAttachment(attachment.id, attachment.file_name);
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: isAr ? "فشل تحميل الملف، يرجى المحاولة لاحقاً" : "Failed to download file.",
      });
    }
  };

  if (isNewLesson) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-center">
        <p className="text-xs text-slate-500 font-medium">
          {isAr
            ? "احفظ الدرس أولاً لتتمكن من إرفاق ملفات خاصة به (سلايدات، كود تدريبي، أوراق عمل)."
            : "Save this lesson first to attach specific files to it (slides, code, exercises)."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-[var(--color-primary-main)] flex items-center justify-center shrink-0">
            <Paperclip size={15} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              {isAr ? "مرفقات هذا الدرس (سلايدات / تمارين)" : "Lesson Attachments & Slides"}
            </h4>
            <span className="text-[10px] text-slate-400">
              {isAr ? "تظهر للطلاب عند فتح هذا الدرس" : "Visible to students watching this lesson"}
            </span>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.txt,.csv"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-dark hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-2xs"
          >
            {isUploading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>{isAr ? "جار الرفع..." : "Uploading..."}</span>
              </>
            ) : (
              <>
                <FileUp size={14} />
                <span>{isAr ? "إرفاق ملف" : "Add File"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden input for replace file */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.txt,.csv"
        disabled={isUploading}
      />

      {/* Upload progress */}
      {isUploading && (
        <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-primary-main)] gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Loader2 size={13} className="animate-spin shrink-0 text-[var(--color-primary-main)]" />
              <span className="truncate">
                {uploadStatus === "uploading"
                  ? isAr
                    ? `جار الرفع إلى Cloudinary... (${progress}%)`
                    : `Uploading directly to Cloudinary... (${progress}%)`
                  : isAr
                  ? "معالجة الملف..."
                  : "Processing..."}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-xs font-black">{progress}%</span>
              <button
                type="button"
                onClick={() => {
                  cancel();
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
                  setFeedbackMsg({
                    type: "error",
                    text: isAr ? "تم إلغاء عملية الرفع." : "Upload canceled.",
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                title={isAr ? "إلغاء عملية الرفع" : "Cancel upload"}
              >
                <X size={13} />
                <span>{isAr ? "إلغاء التحميل" : "Cancel"}</span>
              </button>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
            <div
              className="h-full bg-brand-dark transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Feedback message */}
      {feedbackMsg && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in ${
            feedbackMsg.type === "success"
              ? "bg-slate-100 text-[var(--color-primary-main)] border border-slate-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {feedbackMsg.type === "success" ? <Check size={13} /> : <AlertCircle size={13} />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Attachments List */}
      {isLoading ? (
        <div className="py-4 flex items-center justify-center gap-2 text-slate-400">
          <Loader2 size={16} className="animate-spin text-[var(--color-primary-main)]" />
          <span className="text-xs">{isAr ? "تحميل المرفقات..." : "Loading..."}</span>
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">
          {isAr ? "لا توجد مرفقات لهذا الدرس بعد" : "No attachments added to this lesson yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((item) => {
            const isEditingThis = editingId === item.id;
            const isDeletingThis = deletingId === item.id;
            const { badgeBg } = getFileCategory(item.file_name);
            const sizeStr = formatFileSize(item.file_size || item.file_bytes);

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2.5 group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                    <AttachmentIcon fileName={item.file_name} size={16} />
                  </div>

                  {isEditingThis ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(item.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        disabled={isSavingName}
                        className="flex-1 px-2.5 py-1 rounded border border-brand-dark bg-white text-xs font-bold text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(item.id)}
                        disabled={isSavingName}
                        className="p-1 rounded bg-brand-dark text-white hover:bg-[#07382E] cursor-pointer"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={isSavingName}
                        className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.file_name}
                        </span>
                        {sizeStr && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${badgeBg}`}>
                            {sizeStr}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {!isEditingThis && (
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Download */}
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      title={isAr ? "تحميل" : "Download"}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[var(--color-primary-main)] hover:bg-white transition-colors cursor-pointer"
                    >
                      <Download size={13} />
                    </button>

                    {/* Rename */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(item.file_name);
                      }}
                      title={isAr ? "تعديل الاسم" : "Rename"}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Replace */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingAttachment(item);
                        replaceFileInputRef.current?.click();
                      }}
                      title={isAr ? "استبدال الملف" : "Replace file"}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeletingThis}
                      title={isAr ? "حذف" : "Delete"}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isDeletingThis ? <Loader2 size={13} className="animate-spin text-rose-600" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LessonAttachmentsManager;
