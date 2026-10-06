"use client";

import React, { useState } from 'react';
import { Eye, X, Loader2 } from 'lucide-react';

interface PreviewModeBannerProps {
  locale: string;
}

export function PreviewModeBanner({ locale }: PreviewModeBannerProps) {
  const [isExiting, setIsExiting] = useState(false);
  const isAr = locale === 'ar';

  const handleExitPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    // Hard navigate to trigger route handler and clear cookies cleanly
    window.location.href = `/api/cms/preview/exit?locale=${locale}`;
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-brand-dark text-white px-5 py-2.5 rounded-full shadow-2xl font-sans text-xs font-bold border border-brand-light/40 backdrop-blur-md"
    >
      <Eye className="w-4 h-4 text-slate-300 shrink-0" />
      <span className="truncate">
        {isAr
          ? 'أنت في وضع المعاينة المباشرة (Preview Mode) — هذه مسودة غير منشورة للعامة'
          : 'You are in Live Preview Mode — Viewing unpublished draft content'}
      </span>
      <button
        type="button"
        onClick={handleExitPreview}
        disabled={isExiting}
        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-brand-dark px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer shadow-sm shrink-0 disabled:opacity-70"
      >
        {isExiting ? (
          <Loader2 className="w-3 h-3 animate-spin text-brand-dark" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
        <span>{isAr ? 'إنهاء المعاينة' : 'Exit Preview'}</span>
      </button>
    </div>
  );
}

export default PreviewModeBanner;
