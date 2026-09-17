import React from 'react';
import Link from 'next/link';
import { Eye, X } from 'lucide-react';

interface PreviewModeBannerProps {
  locale: string;
}

export function PreviewModeBanner({ locale }: PreviewModeBannerProps) {
  const isAr = locale === 'ar';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-full shadow-2xl font-sans text-xs font-bold border border-amber-400/50 backdrop-blur-md animate-bounce"
    >
      <Eye className="w-4 h-4 text-slate-950" />
      <span>
        {isAr
          ? 'أنت في وضع المعاينة المباشرة (Preview Mode) — هذه مسودة غير منشورة للعامة'
          : 'You are in Live Preview Mode — Viewing unpublished draft content'}
      </span>
      <Link
        href={`/api/cms/preview/exit?locale=${locale}`}
        className="inline-flex items-center gap-1 bg-slate-950 hover:bg-slate-900 text-white px-2.5 py-1 rounded-full text-[11px] transition-colors cursor-pointer"
      >
        <X className="w-3 h-3" />
        <span>{isAr ? 'إنهاء المعاينة' : 'Exit Preview'}</span>
      </Link>
    </div>
  );
}
