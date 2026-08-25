"use client";

import React, { useState } from "react";
import { X, PlayCircle, AlertCircle, RotateCcw, Film } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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
  videoUrl,
}: VideoPreviewModalProps) {
  const t = useTranslations("course");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isOpen) return null;

  const handleRetry = () => {
    setIsRetrying(true);
    setHasError(false);
    setTimeout(() => {
      setIsRetrying(false);
    }, 600);
  };

  const isYouTube = videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));
  const isVimeo = videoUrl && videoUrl.includes("vimeo.com");

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("watch?v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" dir={isAr ? "rtl" : "ltr"}>
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[#272B2E] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-[#212427] text-white">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-[#45D1B4] shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold truncate max-w-md">
              {title}
            </h3>
            <span className="bg-[#45D1B4] text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
              {t("previewBadge")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player / Screen Container */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/9.5] bg-black flex flex-col items-center justify-center overflow-hidden">
          {hasError ? (
            /* Video Error Screen */
            <div className="flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4 shadow-2xs">
                <AlertCircle className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2">
                {t("videoErrorTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed mb-5">
                {t("videoErrorDesc")}
              </p>
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#005740] hover:bg-[#004432] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
                <span>{t("retry")}</span>
              </button>
            </div>
          ) : !videoUrl ? (
            /* No Video Uploaded Screen */
            <div className="flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-[#45D1B4] flex items-center justify-center shadow-md">
                <Film className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isAr ? "لم يتم رفع فيديو لهذا الدرس بعد" : "No Video Uploaded Yet"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {isAr
                  ? "المدرب لم يقم برفع ملف الفيديو الخاص بهذا الدرس بعد."
                  : "The instructor has not uploaded a video file for this preview lesson yet."}
              </p>
            </div>
          ) : isYouTube || isVimeo ? (
            /* Embed IFrame (YouTube / Vimeo) */
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* HTML5 Video Player (Cloudinary / MP4) */
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              onError={() => setHasError(true)}
            >
              <source src={videoUrl} type="video/mp4" />
              {isAr ? "متصفحك لا يدعم تشغيل هذا الفيديو." : "Your browser does not support the video tag."}
            </video>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-[#212427] text-xs font-semibold text-slate-400 flex items-center justify-between border-t border-slate-700/60">
          <span>Coach Space Video Streamer</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
