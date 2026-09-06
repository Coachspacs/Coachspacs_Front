"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  UploadCloud,
  FileVideo,
  Play,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Film,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import {
  useLessonVideoUpload,
  UploadResult,
  MAX_VIDEO_SIZE_BYTES,
} from "@/hooks/useLessonVideoUpload";

export interface LessonVideoUploaderProps {
  courseId: string | number;
  sectionId?: string | number;
  lessonId?: string | number;
  initialVideoUrl?: string;
  initialVideoPublicId?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onVideoRemove?: () => void;
  onExternalUrlChange?: (url: string) => void;
  disabled?: boolean;
  isAr?: boolean;
  lessonData?: {
    title_ar?: string;
    title_en?: string;
    duration_minutes?: number;
    is_preview?: boolean;
  };
}

export function LessonVideoUploader({
  courseId,
  sectionId,
  lessonId,
  initialVideoUrl,
  onUploadComplete,
  onVideoRemove,
  onExternalUrlChange,
  disabled = false,
  isAr = false,
  lessonData,
}: LessonVideoUploaderProps) {
  const t = useTranslations("courseStudio");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [useExternalLink, setUseExternalLink] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const {
    upload,
    isUploading,
    progress,
    error,
    videoUrl,
    uploadStatus,
    reset,
  } = useLessonVideoUpload(courseId);

  const currentVideoUrl = videoUrl || initialVideoUrl;

  const handleFile = async (file: File) => {
    if (disabled || isUploading) return;
    setSelectedFileName(file.name);

    try {
      const result = await upload(file, {
        sectionId,
        lessonId,
        lessonData,
      });
      onUploadComplete?.(result);
    } catch (e) {
      // Error is already captured in the hook's `error` state
      console.warn("[LessonVideoUploader] Upload error:", e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    reset();
    setSelectedFileName(null);
    setExternalUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onVideoRemove?.();
  };

  const handleExternalUrlSubmit = (val: string) => {
    setExternalUrl(val);
    onExternalUrlChange?.(val);
  };

  return (
    <div className="w-full space-y-3 font-sans text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Upload Mode Switcher */}
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Film className="h-4 w-4 text-[#0F5244]" />
          <span>{t("lessonVideo")}</span>
          <span className="text-[11px] text-slate-600 font-medium">
            ({t("mp4Notice")})
          </span>
        </label>

        {!isUploading && !currentVideoUrl && (
          <button
            type="button"
            onClick={() => setUseExternalLink(!useExternalLink)}
            className="text-xs font-semibold text-[#0F5244] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="h-3 w-3" />
            <span>
              {useExternalLink
                ? t("uploadMp4File")
                : t("useExternalLink")}
            </span>
          </button>
        )}
      </div>

      {/* External Link Input Mode */}
      {useExternalLink && !currentVideoUrl && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {t("videoUrlLabel")}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => handleExternalUrlSubmit(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]"
            />
          </div>
          <p className="text-[11px] text-slate-600">
            {t("externalLinkNotice")}
          </p>
        </div>
      )}

      {/* Direct Cloudinary Upload Dropzone & Video State */}
      {!useExternalLink && (
        <>
          {/* Active Uploading Progress Bar */}
          {isUploading && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-[#0F5244]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0F5244]" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">
                    {selectedFileName || t("uploadingVideo")}
                  </span>
                </div>
                <span className="text-sm font-black text-[#0F5244] font-mono">{progress}%</span>
              </div>

              {/* Determinate Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-emerald-200/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0F5244] to-[#45D1B4] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                <span>
                  {uploadStatus === "validating"
                    ? t("checkingFormat")
                    : uploadStatus === "signing"
                    ? t("requestingTicket")
                    : uploadStatus === "uploading"
                    ? t("uploadingDirect")
                    : uploadStatus === "saving"
                    ? t("savingLesson")
                    : t("uploadComplete")}
                </span>
                <span className="text-slate-600">
                  {t("keepTabOpen")}
                </span>
              </div>
            </div>
          )}

          {/* Attached / Uploaded Video Preview */}
          {!isUploading && currentVideoUrl && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 relative overflow-hidden group shadow-sm">
              <div className="flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-[#6CF8BB] flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {t("videoAttachedSuccess")}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                      {selectedFileName || currentVideoUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    {t("replace")}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-all cursor-pointer"
                    title={t("removeVideo")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="rounded-xl overflow-hidden bg-black/60 aspect-video max-h-56 w-full flex items-center justify-center">
                <video
                  src={currentVideoUrl}
                  controls
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  <track kind="captions" />
                  {t("videoNotSupported")}
                </video>
              </div>
            </div>
          )}

          {/* Empty Upload Dropzone */}
          {!isUploading && !currentVideoUrl && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                dragOver
                  ? "border-[#0F5244] bg-emerald-50/60 scale-[0.99]"
                  : error
                  ? "border-rose-300 bg-rose-50/40 hover:bg-rose-50/60"
                  : "border-slate-300 bg-slate-50/60 hover:bg-emerald-50/30 hover:border-[#0F5244]"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  error
                    ? "bg-rose-100 text-rose-600"
                    : "bg-[#0F5244]/10 text-[#0F5244] group-hover:scale-105"
                }`}
              >
                <UploadCloud className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  {t("clickToUploadDrop")}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  {t("videoFormatNotice")}
                </p>
              </div>

              <button
                type="button"
                disabled={disabled}
                className="mt-1 px-4 py-1.5 rounded-xl bg-white text-[#0F5244] border border-[#0F5244]/30 text-xs font-bold shadow-2xs hover:bg-emerald-50/80 transition-all cursor-pointer"
              >
                {t("selectVideoFile")}
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,.mp4"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </>
      )}

      {/* Inline Error Message & Retry Control */}
      {error && !isUploading && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-rose-900">
                {t("uploadError")}
              </span>
              <p className="text-rose-700 leading-relaxed">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100/60 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("tryAgain")}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LessonVideoUploader;
