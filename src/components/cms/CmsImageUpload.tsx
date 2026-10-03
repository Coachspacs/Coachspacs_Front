"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface CmsImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  aspectRatio?: "square" | "wide" | "favicon" | "hero" | "auto";
  description?: string;
  isAr?: boolean;
}

export function CmsImageUpload({
  label,
  value,
  onChange,
  folder = "coachspace/cms",
  aspectRatio = "auto",
  description,
  isAr = true,
}: CmsImageUploadProps) {
  const t = useTranslations("cms.branding.imageUpload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t("fileTooLarge"));
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || t("uploadFailed"));
      }

      onChange(json.url);
    } catch (err: unknown) {
      const e = err as Error;
      setUploadError(e.message || t("uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "favicon":
        return "w-10 h-10";
      case "square":
        return "w-14 h-14";
      case "wide":
        return "w-20 h-14";
      case "hero":
        return "w-24 h-16";
      default:
        return "w-16 h-14";
    }
  };

  return (
    <div className="space-y-2 font-sans w-full min-w-0">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 min-w-0">
          <span className="truncate">{label}</span>
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="text-xs font-semibold text-slate-500 hover:text-[#0F5244] inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlInput ? t("hideUrl") : t("editUrl")}</span>
        </button>
      </div>

      {description && (
        <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed">{description}</p>
      )}

      {/* Main Upload Dropzone / Preview Area */}
      <div className="space-y-2 w-full min-w-0">
        {value ? (
          /* Preview Mode with Action Overlays */
          <div className="p-3.5 bg-slate-50/60 hover:bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl flex flex-col gap-3 transition-all duration-200 shadow-2xs hover:shadow-xs w-full min-w-0 overflow-hidden">
            {/* Top Row: Thumbnail + Truncated URL + External Link */}
            <div className="flex items-center gap-3 w-full min-w-0">
              {/* Image Thumbnail */}
              <div className={`relative ${getAspectClass()} rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center shadow-xs p-1`}>
                {aspectRatio === "favicon" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value}
                    alt={label}
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value}
                    alt={label}
                    className="w-full h-full object-contain p-1"
                  />
                )}
              </div>

              {/* URL & View Link */}
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-700 truncate font-mono block min-w-0 flex-1" dir="ltr">
                  {value}
                </span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#0F5244] shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title={t("openNewTab")}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Bottom Row: Actions (Full Width / Contained) */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 w-full min-w-0">
              {/* Replace File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#0F5244] hover:text-[#07382E] border border-slate-200 hover:border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 min-w-0"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F5244] shrink-0" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-[#0F5244] shrink-0" />
                )}
                <span className="truncate">{t("replaceImage")}</span>
              </button>

              {/* Remove Image Button */}
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 shrink-0"
                title={t("clear")}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t("clear")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Dropzone State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-[#0F5244] bg-emerald-50/50 scale-[1.01]"
                : "border-slate-300/80 hover:border-[#0F5244] bg-slate-50/60 hover:bg-slate-50"
            }`}
          >
            {isUploading ? (
              <div className="py-4 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-[#0F5244] animate-spin" />
                <span className="text-xs font-bold text-slate-700">
                  {t("uploading")}
                </span>
              </div>
            ) : (
              <div className="py-3 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0F5244] flex items-center justify-center shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    {t("clickOrDrag")}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t("uploadHint")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {/* Manual URL Input Fallback if toggled */}
        {showUrlInput && (
          <div className="pt-1.5 flex items-center gap-2 animate-in fade-in">
            <input
              type="text"
              dir="ltr"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://res.cloudinary.com/... or /images/..."
              className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F5244] focus:ring-1 focus:ring-[#0F5244]/20"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Error Alert */}
        {uploadError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CmsImageUpload;
