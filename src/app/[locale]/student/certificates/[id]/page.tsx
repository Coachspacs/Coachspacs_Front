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
import { CertificateTemplate } from '@/components/certificate/CertificateTemplate';

import {
  Award,
  Download,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Printer,
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
        const resolveStudentName = (overrideName?: string) => {
          if (overrideName && overrideName.trim() && overrideName !== 'Distinguished Student' && overrideName !== 'الطالب المتميز') {
            return overrideName.trim();
          }
          let name = user?.fullName || user?.name;
          if (!name && typeof window !== 'undefined') {
            try {
              const u = JSON.parse(localStorage.getItem('user') || '{}');
              name = u.fullName || u.name || u.email?.split('@')[0];
            } catch (_) {}
          }
          return name || t('defaultStudentName');
        };

        // Helper to resolve real course title with deep fallback chain
        const resolveCourseTitle = async (candidateObj: any, courseIdCandidate?: any) => {
          let title =
            (isAr
              ? candidateObj?.course?.title_ar || candidateObj?.course?.title || candidateObj?.title_ar
              : candidateObj?.course?.title_en || candidateObj?.course?.title || candidateObj?.title_en) ||
            candidateObj?.course?.title ||
            candidateObj?.course?.name ||
            candidateObj?.course_title ||
            candidateObj?.course_name ||
            candidateObj?.title;

          if (title && typeof title === 'string' && title.trim() && !title.toLowerCase().includes('coach space course')) {
            return title.trim();
          }

          const targetCourseId =
            courseIdCandidate ||
            candidateObj?.course?.id ||
            candidateObj?.course_id ||
            (typeof candidateObj?.course === 'number' || typeof candidateObj?.course === 'string' ? candidateObj?.course : null);

          // Check enrollments list
          if (targetCourseId) {
            const matchedEnrCourse = enrollments.find(
              (e: any) => String(e.course?.id || e.course_id || e.id) === String(targetCourseId)
            );
            if (matchedEnrCourse) {
              const enrTitle =
                (isAr
                  ? matchedEnrCourse.course?.title_ar || matchedEnrCourse.course?.title || matchedEnrCourse.title_ar
                  : matchedEnrCourse.course?.title_en || matchedEnrCourse.course?.title || matchedEnrCourse.title_en) ||
                matchedEnrCourse.course?.title ||
                matchedEnrCourse.course?.name ||
                matchedEnrCourse.course_title;
              if (enrTitle && !enrTitle.toLowerCase().includes('coach space course')) return enrTitle.trim();
            }
          }

          // Check localStorage cached enrolled courses
          if (typeof window !== 'undefined') {
            try {
              const savedStr = localStorage.getItem('coachspace_enrolled_courses');
              if (savedStr) {
                const list: any[] = JSON.parse(savedStr);
                const localMatch = list.find(
                  (c: any) =>
                    String(c.id) === String(targetCourseId) ||
                    String(c.certificate_code || '').toLowerCase() === targetLower ||
                    String(c.id) === normalizedNumId
                );
                if (localMatch) {
                  const lTitle =
                    (isAr ? localMatch.title_ar || localMatch.title : localMatch.title_en || localMatch.title) ||
                    localMatch.title;
                  if (lTitle) return lTitle.trim();
                }
              }
            } catch (_) {}
          }

          // Try verification endpoint
          try {
            const verifyRes = await certificateService.verifyCertificate(rawParam);
            if (verifyRes?.course_title) {
              return verifyRes.course_title.trim();
            }
          } catch (_) {}

          // Try fetching course details by ID directly
          if (targetCourseId) {
            try {
              const fetchedCourse = await courseService.getCourseById(targetCourseId, locale);
              if (fetchedCourse) {
                const fTitle =
                  (isAr
                    ? fetchedCourse.title_ar || fetchedCourse.title
                    : fetchedCourse.title_en || fetchedCourse.title) || fetchedCourse.title;
                if (fTitle) return fTitle.trim();
              }
            } catch (_) {}
          }

          return t('defaultCourseTitle');
        };

        // Helper to resolve instructor name
        const resolveInstructorName = (candidateObj: any) => {
          const instObj = typeof candidateObj?.course?.instructor === 'object' ? candidateObj?.course?.instructor : null;
          const inst =
            instObj?.full_name ||
            instObj?.name ||
            (typeof candidateObj?.course?.instructor === 'string' ? candidateObj?.course?.instructor : '') ||
            candidateObj?.instructor_name ||
            candidateObj?.course?.instructor_name ||
            candidateObj?.instructor;

          if (inst && typeof inst === 'string' && inst.trim() && !inst.toLowerCase().includes('coach space instructor')) {
            return inst.trim();
          }
          return t('defaultInstructor');
        };

        // 1. First priority: match in live certificates list
        const matchedCert = certs.find((c) => {
          const code = String(c.certificate_code || '').toLowerCase();
          const idStr = String(c.id || '').toLowerCase();
          const courseIdStr = String(c.course?.id || c.course_id || (typeof c.course === 'number' || typeof c.course === 'string' ? c.course : '') || '').toLowerCase();
          return (
            code === targetLower ||
            idStr === targetLower ||
            idStr === normalizedNumId ||
            (courseIdStr && courseIdStr === normalizedNumId)
          );
        });

        if (matchedCert) {
          const resolvedTitle = await resolveCourseTitle(matchedCert, matchedCert.course?.id || matchedCert.course_id);
          const studentName = resolveStudentName(matchedCert.student_name || matchedCert.student_full_name);
          const instName = resolveInstructorName(matchedCert);
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
            courseTitle: resolvedTitle,
            instructorName: instName,
            issueDate,
            certificateCode: matchedCert.certificate_code || `CS-${matchedCert.id}`,
            pdfUrl: matchedCert.pdf_url,
          });
          return;
        }

        // 2. Second priority: match in enrollments
        const matchedEnrollment = enrollments.find((e: any) => {
          const courseId = String(e.course?.id || e.course_id || e.id || '').toLowerCase();
          const certCode = String(e.certificate?.certificate_code || e.certificate_code || '').toLowerCase();
          return (
            courseId === targetLower ||
            courseId === normalizedNumId ||
            (certCode && (certCode === targetLower || certCode === normalizedNumId))
          );
        });

        if (matchedEnrollment) {
          const courseId = matchedEnrollment.course?.id || matchedEnrollment.course_id || matchedEnrollment.id;
          const resolvedTitle = await resolveCourseTitle(matchedEnrollment, courseId);
          const studentName = resolveStudentName();
          const instName = resolveInstructorName(matchedEnrollment);
          const code =
            matchedEnrollment.certificate?.certificate_code ||
            matchedEnrollment.certificate_code ||
            `CS-${courseId}`;

          const issueDate = matchedEnrollment.completed_at || matchedEnrollment.certificate?.issued_at
            ? new Date(matchedEnrollment.completed_at || matchedEnrollment.certificate?.issued_at).toLocaleDateString(
                isAr ? 'ar-EG' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )
            : new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

          setCertificateData({
            id: courseId,
            studentName,
            courseTitle: resolvedTitle,
            instructorName: instName,
            issueDate,
            certificateCode: code,
          });
          return;
        }

        // 3. Fallback: verification endpoint check
        try {
          const verifyData = await certificateService.verifyCertificate(rawParam);
          if (verifyData && (verifyData.course_title || verifyData.student_full_name)) {
            const studentName = resolveStudentName(verifyData.student_full_name);
            const issueDate = verifyData.issued_at
              ? new Date(verifyData.issued_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
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
              id: rawParam,
              studentName,
              courseTitle: verifyData.course_title || t('defaultCourseTitle'),
              instructorName: t('defaultInstructor'),
              issueDate,
              certificateCode: verifyData.certificate_code || rawParam,
            });
            return;
          }
        } catch (_) {}

        // 4. Fallback: Local storage active course
        if (typeof window !== 'undefined') {
          try {
            const savedCoursesStr = localStorage.getItem('coachspace_enrolled_courses');
            if (savedCoursesStr) {
              const list: any[] = JSON.parse(savedCoursesStr);
              const found = list.find(
                (c) =>
                  String(c.id).toLowerCase() === targetLower ||
                  String(c.id).toLowerCase() === normalizedNumId ||
                  String(c.certificate_code || '').toLowerCase() === targetLower
              );
              if (found) {
                const title =
                  (isAr ? found.title_ar || found.title : found.title_en || found.title) || found.title;
                setCertificateData({
                  id: found.id,
                  studentName: resolveStudentName(),
                  courseTitle: title || t('defaultCourseTitle'),
                  instructorName: resolveInstructorName(found),
                  issueDate: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  certificateCode: found.certificate_code || `CS-${found.id}`,
                });
                return;
              }
            }
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Error loading certificate details:', err);
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
  }, [certificateIdParam, user, locale, isAr]);

  const handleDownloadPdf = async () => {
    if (!certificateData || isDownloading) return;

    const cleanCode = (certificateData.certificateCode || `CS-${certificateData.id}`)
      .replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `Certificate_${cleanCode}.pdf`;

    setIsDownloading(true);
    setDownloadStatus(t('downloadPreparing'));

    try {
      if (certificateCardRef.current) {
        await exportElementToPdf(certificateCardRef.current, fileName);
        setDownloadStatus(t('downloadSuccess'));
      } else {
        throw new Error('Certificate card DOM element not found');
      }
    } catch (clientErr: any) {
      console.warn('DOM canvas export failed, activating guaranteed vector PDF fallback:', clientErr);
      try {
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        const pageWidth = 297;
        const pageHeight = 210;

        // Background: Warm Ivory Linen
        pdf.setFillColor(250, 248, 245);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Outer Emerald Frame (Soft & Thin)
        pdf.setDrawColor(15, 82, 68);
        pdf.setLineWidth(1.5);
        pdf.rect(8, 8, pageWidth - 16, pageHeight - 16, 'D');

        // Inner Gold Hairline Frame
        pdf.setDrawColor(197, 155, 39);
        pdf.setLineWidth(0.6);
        pdf.rect(11, 11, pageWidth - 22, pageHeight - 22, 'D');

        // Header: Brand Title
        pdf.setFontSize(12);
        pdf.setTextColor(15, 82, 68);
        pdf.text('COACH SPACE', pageWidth / 2, 26, { align: 'center' });

        // Certificate Title
        pdf.setFontSize(22);
        pdf.setTextColor(15, 82, 68);
        pdf.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 40, { align: 'center' });

        pdf.setFontSize(9.5);
        pdf.setTextColor(197, 155, 39);
        pdf.text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', pageWidth / 2, 48, { align: 'center' });

        // Recipient Name
        pdf.setFontSize(28);
        pdf.setTextColor(30, 41, 59);
        pdf.text(String(certificateData.studentName || t('defaultStudentName')), pageWidth / 2, 72, { align: 'center' });

        // Gold Accent Underline
        pdf.setFillColor(197, 155, 39);
        pdf.rect(pageWidth / 2 - 25, 76, 50, 0.6, 'F');

        // Description Paragraph
        pdf.setFontSize(10.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text('In recognition of successfully fulfilling all curriculum requirements and practical coursework in:', pageWidth / 2, 94, { align: 'center' });

        // Course Title
        pdf.setFontSize(17);
        pdf.setTextColor(15, 82, 68);
        const splitCourse = pdf.splitTextToSize(`« ${certificateData.courseTitle} »`, 200);
        pdf.text(splitCourse, pageWidth / 2, 108, { align: 'center' });

        // Divider
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.4);
        pdf.line(30, 142, pageWidth - 30, 142);

        // Footer Metadata: Issue Date (Left)
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text('ISSUE DATE', 35, 158);
        pdf.setFontSize(10);
        pdf.setTextColor(51, 65, 85);
        pdf.text(String(certificateData.issueDate || 'Recent'), 35, 166);

        pdf.setFontSize(8);
        pdf.setTextColor(15, 82, 68);
        pdf.text(`ID: ${certificateData.certificateCode || cleanCode}`, 35, 174);

        // Right: Instructor Signature
        pdf.setFontSize(13);
        pdf.setTextColor(30, 41, 59);
        const resolvedInst = certificateData.instructorName && !certificateData.instructorName.toLowerCase().includes('certified instructor')
          ? certificateData.instructorName
          : t('defaultInstructor');
        pdf.text(resolvedInst, pageWidth - 35, 162, { align: 'right' });
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.4);
        pdf.line(pageWidth - 75, 165, pageWidth - 35, 165);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text('LEAD INSTRUCTOR & ACADEMIC MENTOR', pageWidth - 35, 172, { align: 'right' });

        pdf.save(fileName);
        setDownloadStatus(t('downloadSuccess'));
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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
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
          {t('loadingCertificate')}
        </span>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
          <Award className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            {t('notFound')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print-certificate-container" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/student/certificates`}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title={t('backToCertificates')}
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#0F5244]" />
            <span>{t('title')}</span>
          </h1>
        </div>

        {/* Action Buttons: Print, Verify & Download PDF */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-98 cursor-pointer"
            title={t('printCertificate')}
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('print')}</span>
          </button>

          {/* Verify Public Link */}
          <Link
            href={`/${locale}/certificates/verify/${encodeURIComponent(certificateData.certificateCode || certificateData.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300/80 bg-emerald-50/80 hover:bg-emerald-100 text-[#0F5244] text-xs font-bold transition-all shadow-2xs active:scale-98 cursor-pointer"
            title={t('verifyCertificate')}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('verify')}</span>
          </Link>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-98 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{downloadStatus || t('downloading')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-100" />
                <span>{t('downloadPdf')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Luxury Redesigned Certificate Card */}
      <div ref={certificateCardRef} className="print-certificate-card w-full">
        <CertificateTemplate
          data={certificateData}
          locale={locale}
        />
      </div>

      {/* Print Specific CSS */}
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
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
