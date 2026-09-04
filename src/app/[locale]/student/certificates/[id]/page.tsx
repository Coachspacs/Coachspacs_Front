'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { enrollmentService } from '@/services/enrollmentService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Award, Download, ShieldCheck, Sparkles, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function CertificatePage() {
  const t = useTranslations('certificate');
  const locale = useLocale() || 'en';
  const isAr = locale === 'ar';
  const params = useParams();
  const certificateIdParam = (params?.id as string) || '';

  const { user } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [certificateData, setCertificateData] = useState<{
    studentName: string;
    courseTitle: string;
    instructorName: string;
    issueDate: string;
    certificateCode: string;
  } | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function loadCertificate() {
      setIsLoading(true);
      try {
        const enrollments = await enrollmentService.getMyEnrollments();
        if (!isSubscribed) return;

        // Try to find matching enrollment by certificate code, cert id, course id, or enrollment id
        const matched = enrollments.find((e: any) => {
          const certCode = e.certificate?.certificate_code || e.certificate_code || '';
          const certId = String(e.certificate?.id || '');
          const courseId = String(e.course?.id || e.course_id || '');
          const enrollmentId = String(e.id || '');
          return (
            certCode.toLowerCase() === certificateIdParam.toLowerCase() ||
            certId === certificateIdParam ||
            courseId === certificateIdParam ||
            enrollmentId === certificateIdParam
          );
        });

        if (matched) {
          const studentName = user?.fullName || user?.name || (isAr ? 'الطالب' : 'Student');
          const courseTitle = isAr
            ? (matched.course?.title_ar || matched.course?.title || matched.course?.title_en || '')
            : (matched.course?.title_en || matched.course?.title || matched.course?.title_ar || '');
          
          const instObj = typeof matched.course?.instructor === 'object' ? matched.course?.instructor : null;
          const instructorName =
            instObj?.full_name ||
            instObj?.name ||
            (typeof matched.course?.instructor === 'string' ? matched.course?.instructor : '') ||
            matched.course?.instructor_name ||
            'CoachSpace Instructor';

          const rawDate = matched.certificate?.issued_at || matched.completed_at || matched.enrolled_at;
          const issueDate = rawDate
            ? new Date(rawDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

          const certificateCode =
            matched.certificate?.certificate_code ||
            matched.certificate_code ||
            certificateIdParam ||
            `CERT-${matched.id}`;

          setCertificateData({
            studentName,
            courseTitle,
            instructorName,
            issueDate,
            certificateCode,
          });
        } else if (enrollments.length > 0) {
          // If param is a generic CERT id or user has completed courses, pick the first completed course
          const completedEnrollment = enrollments.find((e: any) => e.is_completed || e.progress_percent === 100);
          if (completedEnrollment) {
            const studentName = user?.fullName || user?.name || (isAr ? 'الطالب' : 'Student');
            const courseTitle = isAr
              ? (completedEnrollment.course?.title_ar || completedEnrollment.course?.title || '')
              : (completedEnrollment.course?.title_en || completedEnrollment.course?.title || '');
            const instObj = typeof completedEnrollment.course?.instructor === 'object' ? completedEnrollment.course?.instructor : null;
            const instructorName =
              instObj?.full_name ||
              instObj?.name ||
              (typeof completedEnrollment.course?.instructor === 'string' ? completedEnrollment.course?.instructor : '') ||
              completedEnrollment.course?.instructor_name ||
              'CoachSpace Instructor';

            const rawDate = completedEnrollment.certificate?.issued_at || completedEnrollment.completed_at;
            const issueDate = rawDate
              ? new Date(rawDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

            setCertificateData({
              studentName,
              courseTitle,
              instructorName,
              issueDate,
              certificateCode: certificateIdParam || `CERT-${completedEnrollment.id}`,
            });
          } else {
            setCertificateData(null);
          }
        } else {
          setCertificateData(null);
        }
      } catch (err) {
        console.warn('Failed to load dynamic certificate:', err);
        setCertificateData(null);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadCertificate();

    return () => {
      isSubscribed = false;
    };
  }, [certificateIdParam, user, isAr]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0F5244] animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          {isAr ? 'جاري تحميل الشهادة...' : 'Loading certificate...'}
        </span>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'لم يتم العثور على الشهادة' : 'Certificate Not Found'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAr
              ? 'لم يتم العثور على شهادة معتمدة تطابق هذا الرمز، أو أن الدورة التدريبية لم تكتمل بعد بنسبة 100%.'
              : 'No verified certificate was found matching this identifier, or the course has not been 100% completed yet.'}
          </p>
        </div>
        <Link
          href={`/${locale}/student/certificates`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-xs"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة إلى شهاداتي' : 'Back to My Certificates'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/student/certificates`}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title={isAr ? 'العودة إلى شهاداتي' : 'Back to My Certificates'}
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>{t('title')}</span>
          </h1>
        </div>
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
            {certificateData.studentName}
          </h3>
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <p className="text-xs text-slate-400">{t('hasCompleted')}</p>
          <h4 className="text-lg font-bold text-slate-100">{certificateData.courseTitle}</h4>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            <span className="block font-semibold text-slate-300">{t('issueDate')}</span>
            <span>{certificateData.issueDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified: {certificateData.certificateCode}</span>
          </div>

          <div>
            <span className="block font-semibold text-slate-300">Instructor Signature</span>
            <span className="font-serif italic text-amber-300 text-sm">{certificateData.instructorName}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
