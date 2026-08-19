'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { mockCertificate } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Award, Download, ShieldCheck, Sparkles } from 'lucide-react';

export default function CertificatePage() {
  const t = useTranslations('certificate');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <span>{t('title')}</span>
        </h1>
        <Button variant="primary" onClick={() => window.print()} className="gap-2">
          <Download className="w-4 h-4" />
          <span>{t('download')}</span>
        </Button>
      </div>

      {/* Printable Certificate Template */}
      <Card className="p-8 sm:p-14 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 text-center space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-4 right-4 text-amber-500/10 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>

        {/* Certificate Emblem */}
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400">
            CoachSpace Academy Certificate of Excellence
          </h2>
          <p className="text-xs text-slate-400">{t('certifyThat')}</p>
        </div>

        <div className="py-2">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight underline decoration-amber-500/50 underline-offset-8">
            {mockCertificate.studentName}
          </h3>
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <p className="text-xs text-slate-400">{t('hasCompleted')}</p>
          <h4 className="text-lg font-bold text-slate-100">{mockCertificate.courseTitle}</h4>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            <span className="block font-semibold text-slate-300">Issued On</span>
            <span>{mockCertificate.issueDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified: {mockCertificate.certificateCode}</span>
          </div>

          <div>
            <span className="block font-semibold text-slate-300">Instructor Signature</span>
            <span className="font-serif italic text-amber-300 text-sm">{mockCertificate.instructorName}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
