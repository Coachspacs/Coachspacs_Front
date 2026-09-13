'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { enrollmentService } from '@/services/enrollmentService';
import { certificateService } from '@/services/certificateService';
import { courseService } from '@/services/courseService';
import { exportElementToPdf } from '@/utils/certificatePdfGenerator';

import {
  Award,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Printer,
  Calendar,
} from 'lucide-react';


export default function CertificatePage() {
  const t = useTranslations('certificate');
  const locale = useLocale() || 'en';
  const isAr = locale === 'ar';
  const params = useParams();
  const certificateIdParam = (params?.id as string) || '';

  const { user } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<{
    id: number | string;
    studentName: string;
    courseTitle: string;
    instructorName: string;
    issueDate: string;
    certificateCode: string;
    pdfUrl?: string;
  } | null>(null);

  const certificateCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function loadCertificate() {
      setIsLoading(true);
      try {
        const rawParam = String(certificateIdParam || '').trim();
        const targetLower = rawParam.toLowerCase();
        // Extract numeric ID if prefixed with CERT- or CS-
        const normalizedNumId = targetLower.replace(/^(cert|cs)[-_]/i, '');

        // Fetch in parallel from certificates endpoint and enrollments
        const [certsRes, enrollmentsRes] = await Promise.allSettled([
          certificateService.getMyCertificates(),
          enrollmentService.getMyEnrollments(),
        ]);

        if (!isSubscribed) return;

        const certs = certsRes.status === 'fulfilled' && Array.isArray(certsRes.value) ? certsRes.value : [];
        const enrollments = enrollmentsRes.status === 'fulfilled' && Array.isArray(enrollmentsRes.value) ? enrollmentsRes.value : [];

        // Helper to resolve student name
        const resolveStudentName = () => {
          let name = user?.fullName || user?.name;
          if (!name && typeof window !== 'undefined') {
            try {
              const u = JSON.parse(localStorage.getItem('user') || '{}');
              name = u.fullName || u.name || u.email?.split('@')[0];
            } catch (_) {}
          }
          return name || (isAr ? 'الطالب المتميز' : 'Distinguished Student');
        };

        // 1. First priority: match in live certificates list
        const matchedCert = certs.find((c) => {
          const code = String(c.certificate_code || '').toLowerCase();
          const idStr = String(c.id || '').toLowerCase();
          const courseIdStr = String(c.course?.id || c.course_id || '').toLowerCase();
          return (
            code === targetLower ||
            idStr === targetLower ||
            idStr === normalizedNumId ||
            courseIdStr === targetLower ||
            courseIdStr === normalizedNumId ||
            code === `cert-${normalizedNumId}` ||
            code === `cs-${normalizedNumId}`
          );
        });

        if (matchedCert) {
          const studentName = matchedCert.student_name || resolveStudentName();
          const courseTitle =
            (isAr ? matchedCert.course?.title_ar : matchedCert.course?.title_en) ||
            matchedCert.course?.title ||
            matchedCert.course_title ||
            'Coach Space Course';
          const instructorName =
            matchedCert.course?.instructor?.name ||
            matchedCert.course?.instructor?.full_name ||
            'Coach Space Instructor';

          const issueDate = matchedCert.issued_at
            ? new Date(matchedCert.issued_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
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
            id: matchedCert.id,
            studentName,
            courseTitle,
            instructorName,
            issueDate,
            certificateCode: matchedCert.certificate_code || rawParam.toUpperCase(),
            pdfUrl: matchedCert.pdf_url,
          });
          return;
        }

        // 2. Second priority: match in student enrollments from API
        const matchedEnr = enrollments.find((e: any) => {
          const certCode = String(e.certificate?.certificate_code || e.certificate_code || '').toLowerCase();
          const certId = String(e.certificate?.id || '').toLowerCase();
          const courseId = String(e.course?.id || e.course_id || '').toLowerCase();
          const enrollmentId = String(e.id || '').toLowerCase();

          return (
            certCode === targetLower ||
            certId === targetLower ||
            certId === normalizedNumId ||
            courseId === targetLower ||
            courseId === normalizedNumId ||
            enrollmentId === targetLower ||
            enrollmentId === normalizedNumId ||
            targetLower === `cert-${enrollmentId}` ||
            targetLower === `cert-${courseId}` ||
            targetLower === `cs-${enrollmentId}` ||
            targetLower === `cs-${courseId}`
          );
        });

        if (matchedEnr) {
          const studentName = resolveStudentName();
          const courseTitle = isAr
            ? matchedEnr.course?.title_ar || matchedEnr.course?.title || matchedEnr.course?.title_en || ''
            : matchedEnr.course?.title_en || matchedEnr.course?.title || matchedEnr.course?.title_ar || '';

          const instObj = typeof matchedEnr.course?.instructor === 'object' ? matchedEnr.course?.instructor : null;
          const instructorName =
            instObj?.full_name ||
            instObj?.name ||
            (typeof matchedEnr.course?.instructor === 'string' ? matchedEnr.course?.instructor : '') ||
            matchedEnr.course?.instructor_name ||
            'Coach Space Instructor';

          const rawDate = matchedEnr.certificate?.issued_at || matchedEnr.completed_at || matchedEnr.enrolled_at;
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
            matchedEnr.certificate?.certificate_code ||
            matchedEnr.certificate_code ||
            matchedEnr.certificate?.code ||
            (matchedEnr.certificate?.id ? `CS-${matchedEnr.certificate.id}` : null);

          if (!certificateCode) {
            setCertificateData(null);
            return;
          }

          setCertificateData({
            id: matchedEnr.certificate?.id || matchedEnr.id,
            studentName,
            courseTitle: courseTitle || 'Coach Space Course',
            instructorName,
            issueDate,
            certificateCode,
          });
          return;
        }

        // No authentic certificate found for this ID
        setCertificateData(null);
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

  const handleDownloadPdf = async () => {
    if (!certificateData) return;
    const targetId = certificateData.id || certificateData.certificateCode;
    const cleanCode = String(certificateData.certificateCode || targetId || 'CERT').trim();
    const fileName = `CoachSpace-Certificate-${cleanCode}.pdf`;

    setIsDownloading(true);
    setDownloadStatus(isAr ? 'جاري تجهيز وتنزيل ملف PDF...' : 'Generating and downloading PDF...');

    try {
      if (certificateCardRef.current) {
        await exportElementToPdf(certificateCardRef.current, fileName);
        setDownloadStatus(isAr ? 'تم التنزيل بنجاح!' : 'Downloaded successfully!');
      } else {
        throw new Error('Certificate card DOM element not found');
      }
    } catch (clientErr: any) {
      console.warn('DOM canvas export failed, activating guaranteed vector PDF fallback:', clientErr);
      try {
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        // Background & Borders
        pdf.setFillColor(253, 254, 253);
        pdf.rect(8, 8, 281, 194, 'F');
        pdf.setDrawColor(15, 82, 68);
        pdf.setLineWidth(1.2);
        pdf.rect(14, 14, 269, 182, 'D');
        pdf.setDrawColor(217, 119, 6);
        pdf.setLineWidth(0.4);
        pdf.rect(17, 17, 263, 176, 'D');

        // Header
        pdf.setFontSize(18);
        pdf.setTextColor(15, 82, 68);
        pdf.text('COACH SPACE ACADEMY', 148.5, 36, { align: 'center' });
        
        pdf.setFontSize(24);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Certificate of Completion & Excellence', 148.5, 52, { align: 'center' });
        
        pdf.setFontSize(13);
        pdf.setTextColor(100, 116, 139);
        pdf.text('This is to officially certify that', 148.5, 68, { align: 'center' });

        // Student Name
        pdf.setFontSize(28);
        pdf.setTextColor(15, 82, 68);
        pdf.text(String(certificateData.studentName || 'Student'), 148.5, 88, { align: 'center' });

        // Course Section
        pdf.setFontSize(13);
        pdf.setTextColor(100, 116, 139);
        pdf.text('has successfully fulfilled all requirements and assessments for:', 148.5, 106, { align: 'center' });

        pdf.setFontSize(22);
        pdf.setTextColor(30, 41, 59);
        pdf.text(String(certificateData.courseTitle || 'Course Title'), 148.5, 122, { align: 'center' });

        // Authority / Footer
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(25, 145, 272, 145);

        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Issue Date: ${certificateData.issueDate || 'Recent'}`, 30, 160);
        pdf.text(`Credential ID: ${certificateData.certificateCode || cleanCode}`, 30, 168);

        pdf.text('Coach Space Verified Credential', 148.5, 164, { align: 'center' });

        pdf.text(`Instructor: ${certificateData.instructorName || 'Academy Instructor'}`, 265, 160, { align: 'right' });
        pdf.text('Authorized Signature', 265, 168, { align: 'right' });

        pdf.save(fileName);
        setDownloadStatus(isAr ? 'تم التنزيل بنجاح!' : 'Downloaded successfully!');
      } catch (vectorErr) {
        console.error('Vector fallback failed:', vectorErr);
      }
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadStatus(null);
      }, 1500);
    }
  };

  // Auto-download if ?download=1 is in query parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && certificateData && certificateCardRef.current) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('download') === '1' || urlParams.get('download') === 'true') {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        const timer = setTimeout(() => {
          handleDownloadPdf();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [certificateData]);

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
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">{t('notFound')}</h2>
          <p className="text-sm text-slate-500">
            {t('notFoundDesc')}
          </p>
        </div>
        <Link
          href={`/${locale}/student/certificates`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-xs"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('backToCertificates')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print-certificate-container" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/student/certificates`}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title={t('backToCertificates')}
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#0F5244]" />
            <span>{t('title')}</span>
          </h1>
        </div>

        {/* Action: Dedicated Download PDF Button Only */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#093C31] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-98 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{downloadStatus || (isAr ? 'جاري التنزيل...' : 'Downloading...')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-100" />
                <span>{isAr ? 'تنزيل الشهادة (PDF)' : 'Download PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Soft & Elegant Luxury Certificate of Excellence */}
      <div ref={certificateCardRef} className="relative print-certificate-card rounded-3xl bg-white border border-slate-200/80 shadow-md p-3 sm:p-6 md:p-8">
        {/* Delicate Inner Hairline Frame */}
        <div className="relative rounded-2xl border border-emerald-900/[0.08] bg-gradient-to-b from-[#FCFDFD] via-white to-[#F9FCFA] p-6 sm:p-12 md:p-14 text-center space-y-6 sm:space-y-8 overflow-hidden">
          
          {/* 4 Soft Minimalist Corner Accents */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t border-l border-amber-400/50 rounded-tl-xs pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t border-r border-amber-400/50 rounded-tr-xs pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b border-l border-amber-400/50 rounded-bl-xs pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b border-r border-amber-400/50 rounded-br-xs pointer-events-none" />

          {/* Ultra-Soft Subtle Botanical Leaf Watermark */}
          <svg
            className="absolute inset-0 m-auto w-64 h-64 sm:w-80 sm:h-80 text-[#0F5244]/[0.02] pointer-events-none select-none"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <path d="M100 20 C110 50, 150 70, 160 110 C170 150, 130 180, 100 180 C70 180, 30 150, 40 110 C50 70, 90 50, 100 20 Z" />
            <path d="M100 25 L100 175" strokeWidth="1" />
            <path d="M100 60 C120 70, 135 90, 140 110" />
            <path d="M100 80 C80 90, 65 110, 60 130" />
            <path d="M100 110 C120 120, 130 135, 135 150" />
            <path d="M100 130 C80 140, 70 155, 65 170" />
          </svg>

          {/* Top Header: Academy Recognition */}
          <div className="space-y-3 relative z-10">
            {/* Minimal refined emblem & badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50/70 border border-emerald-100 text-[#0F5244] text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-500/80" />
              <span>Coach Space Academy</span>
              <span className="w-1 h-1 rounded-full bg-[#0F5244]/25" />
              <span className="text-[10px] font-medium text-slate-500">
                {isAr ? 'اعتماد رسمي' : 'Official Credential'}
              </span>
            </div>

            {/* Certificate Title */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-800 tracking-normal">
                {isAr ? 'شهادة إتمام وتفوق معتمدة' : 'Certificate of Completion & Excellence'}
              </h2>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto" />
              <p className="text-xs sm:text-sm text-slate-400 font-normal pt-0.5">
                {t('certifyThat')}
              </p>
            </div>
          </div>

          {/* Recipient Student Name */}
          <div className="py-1 relative z-10">
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-normal">
              {certificateData.studentName}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-2 text-amber-400/70">
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-300/70" />
              <span className="text-[10px]">✦</span>
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-300/70" />
            </div>
          </div>

          {/* Course Completion Section (Soft & Clean - No Clunky Box!) */}
          <div className="max-w-xl mx-auto space-y-2 relative z-10">
            <p className="text-xs text-slate-400 font-normal">
              {t('hasCompleted')}
            </p>
            <h4 className="text-lg sm:text-2xl font-bold text-[#0F5244] leading-relaxed">
              {certificateData.courseTitle}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 font-normal max-w-md mx-auto pt-0.5 leading-relaxed">
              {isAr
                ? 'تقديراً لاجتياز كافة متطلبات الدورة التدريبية والاختبارات العملية المعتمدة بنجاح وتفوق.'
                : 'In recognition of successfully fulfilling all certified curriculum requirements and practical assessments with distinction.'}
            </p>
          </div>

          {/* Bottom Authority Row: Date, Soft Seal, Signature */}
          <div className="pt-7 sm:pt-9 border-t border-slate-100/90 grid grid-cols-1 sm:grid-cols-3 items-center gap-6 relative z-10">
            {/* Issue Date & ID */}
            <div className="space-y-1 sm:text-start order-2 sm:order-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {t('issueDate')}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 block">
                {certificateData.issueDate}
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-[10px] font-mono text-slate-600">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>ID: {certificateData.certificateCode}</span>
              </div>
            </div>

            {/* Soft, Refined Center Academy Seal */}
            <div className="flex flex-col items-center justify-center order-1 sm:order-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400/70 via-amber-200/90 to-amber-300/70 shadow-xs">
                <div className="w-full h-full rounded-full bg-white p-1 flex flex-col items-center justify-center text-center relative border border-amber-100">
                  <div className="w-full h-full rounded-full border border-dashed border-amber-300/60 flex flex-col items-center justify-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F5244] stroke-[1.8]" />
                    <span className="text-[7px] font-bold tracking-widest text-[#0F5244] uppercase mt-0.5">
                      COACH SPACE
                    </span>
                    <span className="text-[5px] font-semibold tracking-wider text-amber-600 uppercase">
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Signature */}
            <div className="space-y-1.5 sm:text-end order-3">
              <div className="flex items-end justify-center sm:justify-end pb-0.5">
                <span className="font-serif text-lg sm:text-xl font-bold text-slate-800 tracking-wide block">
                  {certificateData.instructorName}
                </span>
              </div>
              <div className="w-32 sm:w-40 h-[1px] bg-slate-300 mx-auto sm:ms-auto sm:me-0" />
              <span className="block text-xs font-semibold text-slate-500 pt-0.5">
                {t('instructorSignature')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific Global CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm;
          }

          *,
          *::before,
          *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          /* Hide everything except certificate */
          header,
          footer,
          aside,
          nav,
          .print\\:hidden,
          [class*="Header"],
          [class*="Sidebar"],
          [class*="Footer"] {
            display: none !important;
          }

          .print-certificate-container {
            padding: 0 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          .print-certificate-card {
            box-shadow: none !important;
            border: 1.5px solid rgba(15, 82, 68, 0.35) !important;
            padding: 16px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            background-color: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}
