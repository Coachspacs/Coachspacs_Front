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
  Sparkles,
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

interface CourseMaterialsManagerProps {
  courseId: string | number;
  initialAttachments?: AttachmentItem[];
  onCountChange?: (count: number) => void;
  readOnly?: boolean;
}

export function CourseMaterialsManager({
  courseId,
  initialAttachments = [],
  onCountChange,
  readOnly = false,
}: CourseMaterialsManagerProps) {
  const t = useTranslations("courseStudio");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [replacingAttachment, setReplacingAttachment] = useState<AttachmentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  const { isUploading, progress, uploadStatus, error: uploadError, upload, reset, cancel } = useAttachmentUpload();

  // Load attachments on mount or courseId change
  useEffect(() => {
    let isMounted = true;
    if (!courseId) return;

    setIsLoading(true);
    courseAttachmentService
      .listCourseAttachments(courseId)
      .then((data) => {
        if (isMounted) {
          setAttachments(data);
          onCountChange?.(data.length);
        }
      })
      .catch((err) => {
        console.warn("[CourseMaterialsManager] Error loading attachments:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, onCountChange]);

  // Handle uploading a brand new course-level attachment
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedbackMsg(null);
    try {
      const created = await upload(file, {
        courseId,
        isCourseMaterial: true,
      });

      setAttachments((prev) => {
        const next = [created, ...prev];
        onCountChange?.(next.length);
        return next;
      });

      setFeedbackMsg({
        type: "success",
        text: isAr ? "تم رفع المرفق وحفظه بنجاح!" : "Attachment uploaded successfully!",
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
        text: isAr ? "تم تحديث اسم الملف" : "Attachment renamed successfully",
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

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0">
              <Paperclip size={18} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {isAr ? "مواد وملفات الدورة التدريبية" : "Course Materials & Resources"}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {attachments.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            {isAr
              ? "أرفق ملفات داعمة ومواد إضافية يستفيد منها الطالب طوال فترة دراسته للدورة (ملفات PDF، أكواد برمجية ZIP، أوراق عمل، مراجع)."
              : "Upload supporting resources, syllabi, cheat sheets, or exercise files for enrolled students."}
          </p>
        </div>

        {/* Upload Trigger Button */}
        {!readOnly && (
          <div className="shrink-0">
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
              disabled={isUploading || !courseId}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isUploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{isAr ? "جار الرفع..." : "Uploading..."}</span>
                </>
              ) : (
                <>
                  <FileUp size={16} />
                  <span>{isAr ? "إضافة ملف جديد" : "Upload New File"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hidden input for replacing existing files */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.txt,.csv"
        disabled={isUploading}
      />

      {/* Upload Progress Bar Banner */}
      {isUploading && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-[#0F5244] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 size={14} className="animate-spin shrink-0 text-[#0F5244]" />
              <span className="truncate">
                {uploadStatus === "signing" && (isAr ? "جلب توقيع الأمان..." : "Authenticating with Cloudinary...")}
                {uploadStatus === "uploading" && (isAr ? `جار الرفع إلى Cloudinary... (${progress}%)` : `Uploading directly to Cloudinary... (${progress}%)`)}
                {uploadStatus === "saving" && (isAr ? "حفظ المرفق في الدورة..." : "Saving attachment...")}
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

          <div className="w-full h-2 rounded-full bg-emerald-200/60 overflow-hidden">
            <div
              className="h-full bg-[#0F5244] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attachments List */}
      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={24} className="animate-spin text-[#0F5244]" />
          <span className="text-xs font-medium">{isAr ? "جار تحميل الملفات..." : "Loading materials..."}</span>
        </div>
      ) : attachments.length === 0 ? (
        <div
          onClick={() => !readOnly && fileInputRef.current?.click()}
          className={`py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#0F5244] bg-slate-50/50 hover:bg-emerald-50/20 text-center flex flex-col items-center justify-center gap-2 transition-all ${
            !readOnly ? "cursor-pointer" : ""
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-slate-400">
            <Upload size={20} />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            {isAr ? "لا توجد ملفات مرفقة بهذه الدورة بعد" : "No course materials attached yet"}
          </p>
          <p className="text-[11px] text-slate-400">
            {isAr
              ? "انقر لرفع ملفات PDF، عروض تقديمية، أو ملفات ZIP بحجم أقصى 50 ميغابايت"
              : "Click to upload PDF, Office documents, or ZIP archives under 50 MB"}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {attachments.map((item) => {
            const isEditingThis = editingId === item.id;
            const isDeletingThis = deletingId === item.id;
            const { badgeBg } = getFileCategory(item.file_name);
            const sizeStr = formatFileSize(item.file_size || item.file_bytes);

            return (
              <div
                key={item.id}
                className="group p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* File info / Rename form */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0">
                    <AttachmentIcon fileName={item.file_name} size={20} />
                  </div>

                  {isEditingThis ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
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
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#0F5244] bg-white text-xs font-bold text-slate-800 focus:outline-none shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(item.id)}
                        disabled={isSavingName}
                        className="p-1.5 rounded-lg bg-[#0F5244] text-white hover:bg-[#07382E] cursor-pointer"
                        title={isAr ? "حفظ" : "Save"}
                      >
                        {isSavingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={isSavingName}
                        className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                        title={isAr ? "إلغاء" : "Cancel"}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          {item.file_name}
                        </span>
                        {sizeStr && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                            {sizeStr}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        ID: {item.file_public_id || item.id}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!readOnly && !isEditingThis && (
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Download test */}
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      title={isAr ? "تحميل الملف" : "Download file"}
                      className="p-2 rounded-xl text-slate-600 hover:text-[#0F5244] hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    >
                      <Download size={15} />
                    </button>

                    {/* Rename */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(item.file_name);
                      }}
                      title={isAr ? "تعديل الاسم" : "Rename"}
                      className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* Replace File */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingAttachment(item);
                        replaceFileInputRef.current?.click();
                      }}
                      title={isAr ? "استبدال الملف بملف آخر" : "Replace file"}
                      className="p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    >
                      <RefreshCw size={15} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeletingThis}
                      title={isAr ? "حذف المرفق" : "Delete attachment"}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isDeletingThis ? <Loader2 size={15} className="animate-spin text-rose-600" /> : <Trash2 size={15} />}
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

export default CourseMaterialsManager;
