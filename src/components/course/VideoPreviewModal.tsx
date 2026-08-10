"use client";

import React, { useState } from "react";
import { X, PlayCircle, AlertCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl?: string;
}

export function VideoPreviewModal({
  isOpen,
  onClose,
  title,
}: VideoPreviewModalProps) {
  const t = useTranslations("course");
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isOpen) return null;

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[#272B2E] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-[#212427] text-white">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-[#45D1B4]" />
            <h3 className="text-sm sm:text-base font-extrabold truncate max-w-md">
              {title}
            </h3>
            <span className="bg-[#45D1B4] text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
              {t("previewBadge")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Error Placeholder Container (Exact match to screenshot) */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/9.5] bg-[#272B2E] flex flex-col items-center justify-center p-6 text-center text-white">
          
          {/* Red Warning Exclamation Circle Icon */}
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-5 shadow-2xs">
            <AlertCircle className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Headline */}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
            {t("videoErrorTitle")}
          </h2>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed mb-6">
            {t("videoErrorDesc")}
          </p>

          {/* Action Retry Button */}
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#005740] hover:bg-[#004432] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{t("retry")}</span>
          </button>

        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-[#212427] text-xs font-semibold text-slate-400 flex items-center justify-between border-t border-slate-700/60">
          <span>Coach Space Video Streamer</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            {t("close")}
          </button>
        </div>

      </div>
    </div>
  );
}
