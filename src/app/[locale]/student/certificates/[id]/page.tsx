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
          return name || (isAr ? 'الطالب المتميز' : 'Distinguished Student');
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

          return isAr ? 'دورة تدريبية متخصصة' : 'Specialized Professional Course';
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
          return isAr ? 'المدرب المعتمد' : 'Certified Instructor';
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
            courseIdStr === targetLower ||
            courseIdStr === normalizedNumId ||
            code === `cert-${normalizedNumId}` ||
            code === `cs-${normalizedNumId}`
          );
        });

        if (matchedCert) {
          const studentName = resolveStudentName(matchedCert.student_name);
          const courseTitle = await resolveCourseTitle(matchedCert, matchedCert.course?.id || matchedCert.course_id);
          const instructorName = resolveInstructorName(matchedCert);

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
          const studentName = resolveStudentName(matchedEnr.student_name);
          const courseTitle = await resolveCourseTitle(matchedEnr, matchedEnr.course?.id || matchedEnr.course_id);
          const instructorName = resolveInstructorName(matchedEnr);

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
            (matchedEnr.certificate?.id ? `CS-${matchedEnr.certificate.id}` : rawParam.toUpperCase());

          setCertificateData({
            id: matchedEnr.certificate?.id || matchedEnr.id,
            studentName,
            courseTitle,
            instructorName,
            issueDate,
            certificateCode,
          });
          return;
        }

        // 3. Third priority: Try public verification endpoint by code
        try {
          const verifyData = await certificateService.verifyCertificate(rawParam);
          if (verifyData && verifyData.course_title) {
            const studentName = resolveStudentName(verifyData.student_full_name);
            const courseTitle = verifyData.course_title.trim();
            const instructorName = verifyData.instructor_name || (isAr ? 'المدرب المعتمد' : 'Certified Instructor');
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
              id: verifyData.certificate_code || rawParam.toUpperCase(),
              studentName,
              courseTitle,
              instructorName,
              issueDate,
              certificateCode: verifyData.certificate_code || rawParam.toUpperCase(),
            });
            return;
          }
        } catch (_) {}

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
        
        // Split Layout: Left Emerald Panel & Right Warm Cream Area
        const pageWidth = 297;
        const pageHeight = 210;

        // Right Area: Warm Cream Background
        pdf.setFillColor(250, 248, 245);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Left Panel: Deep Dark Forest Emerald
        pdf.setFillColor(11, 59, 44);
        pdf.rect(0, 0, 95, pageHeight, 'F');

        // Left Panel: Brand Header
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Coach Space', 20, 28);

        // Left Panel: Course Section
        pdf.setFontSize(10);
        pdf.setTextColor(167, 243, 208);
        pdf.text('COURSE', 20, 95);

        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        const splitCourse = pdf.splitTextToSize(String(certificateData.courseTitle || 'Course'), 65);
        pdf.text(splitCourse, 20, 106);

        // Left Panel: Verified Credential
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Verified credential', 20, 180);
        pdf.setFontSize(8.5);
        pdf.setTextColor(167, 243, 208);
        pdf.text(`ID ${certificateData.certificateCode || cleanCode}`, 20, 187);

        // Right Panel: Awarded to
        pdf.setFontSize(12);
        pdf.setTextColor(155, 112, 35);
        pdf.text('Awarded to', 115, 45);

        // Right Panel: Student Name
        pdf.setFontSize(26);
        pdf.setTextColor(15, 23, 42);
        pdf.text(String(certificateData.studentName || 'Student Name'), 115, 62);

        // Right Panel: Gold Underline Accent
        pdf.setFillColor(197, 155, 39);
        pdf.rect(115, 68, 24, 1.2, 'F');

        // Right Panel: Description Paragraph
        pdf.setFontSize(11);
        pdf.setTextColor(71, 85, 105);
        const descText = `For completing ${certificateData.courseTitle || 'the course'} in full — every lesson, exercise, and assessment finished to a certified standard. This credential reflects practical skill, not just attendance.`;
        const splitDesc = pdf.splitTextToSize(descText, 155);
        pdf.text(splitDesc, 115, 88);

        // Right Panel: Divider
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.4);
        pdf.line(115, 138, 275, 138);

        // Right Panel: Metadata Row
        pdf.setFontSize(8.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Issue date', 115, 152);
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(String(certificateData.issueDate || 'Recent'), 115, 160);

        pdf.setFontSize(8.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Instructor', 170, 152);
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(String(certificateData.instructorName || 'Certified Instructor'), 170, 160);

        pdf.setFontSize(14);
        pdf.setTextColor(30, 41, 59);
        pdf.text(String(certificateData.instructorName || 'Laila Hourani'), 230, 158);
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.3);
        pdf.line(230, 163, 272, 163);
        pdf.setFontSize(8.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Instructor signature', 230, 170);

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

        {/* Actions: Verify Authenticity & Download PDF */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/${locale}/certificates/verify/${encodeURIComponent(certificateData.certificateCode || certificateData.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300/80 bg-emerald-50/80 hover:bg-emerald-100 text-[#0F5244] text-xs font-bold transition-all shadow-2xs active:scale-98 cursor-pointer"
            title={isAr ? "التحقق من صحة ومصداقية الشهادة" : "Verify certificate authenticity"}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'التحقق من صحة الشهادة' : 'Verify Certificate'}</span>
          </Link>

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

      {/* Modern Luxury Split-Layout Certificate */}
      <div
        ref={certificateCardRef}
        className="relative print-certificate-card w-full rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden"
      >
        <div className="w-full flex flex-col md:flex-row items-stretch min-h-[500px] sm:min-h-[540px]">
          
          {/* LEFT SIDEBAR: Deep Forest Emerald (33% width) */}
          <div className="relative w-full md:w-[35%] lg:w-[32%] bg-[#0B3B2C] text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-hidden shrink-0 select-none">
            
            {/* Subtle botanical organic leaf watermark vectors in background */}
            <svg
              className="absolute -top-12 -left-12 w-48 h-48 text-white/[0.04] pointer-events-none"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M50 0 C70 30, 90 40, 100 70 C80 90, 40 100, 20 70 C0 40, 30 10, 50 0 Z" />
            </svg>
            <svg
              className="absolute top-1/3 -right-12 w-56 h-56 text-emerald-400/[0.05] pointer-events-none"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M50 0 C80 20, 100 60, 70 90 C40 100, 10 70, 0 40 C10 10, 30 0, 50 0 Z" />
            </svg>
            <svg
              className="absolute -bottom-10 -left-6 w-44 h-44 text-white/[0.03] pointer-events-none"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M50 0 C70 30, 90 40, 100 70 C80 90, 40 100, 20 70 C0 40, 30 10, 50 0 Z" />
            </svg>

            {/* Top: Brand Logo & Title */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-[#0B3B2C]" />
              </div>
              <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-wide">
                Coach Space
              </span>
            </div>

            {/* Middle: Course Label and Course Title */}
            <div className="relative z-10 my-8 sm:my-12 space-y-2">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-300/80 block">
                {isAr ? "الدورة التدريبية" : "Course"}
              </span>
              <h3 className="font-serif-luxury italic text-white text-2xl sm:text-3xl font-bold leading-tight drop-shadow-xs">
                {certificateData.courseTitle}
              </h3>
            </div>

            {/* Bottom: Verified Credential & ID Badge */}
            <div className="relative z-10 pt-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-emerald-400/30 bg-emerald-950/60 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white tracking-tight">
                  {isAr ? "شهادة معتمدة وموثقة" : "Verified credential"}
                </span>
                <span className="block text-[11px] font-mono text-emerald-300/85 tracking-wider uppercase">
                  ID {certificateData.certificateCode}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT CONTENT AREA: Warm Paper Cream (67-68% width) */}
          <div className="relative flex-1 bg-[#FAF8F5] p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between space-y-6 sm:space-y-8 text-slate-800">
            
            {/* Top: Awarded to & Recipient Student Name */}
            <div className="space-y-2 sm:space-y-3 text-start">
              <span className="font-serif-luxury italic text-amber-900/80 text-sm sm:text-base font-semibold block">
                {isAr ? "مُنحت إلى" : "Awarded to"}
              </span>
              
              <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                {certificateData.studentName}
              </h2>

              <div className="w-16 sm:w-20 h-0.5 bg-[#C59B27] mt-3 rounded-full" />
            </div>

            {/* Middle: Rich descriptive paragraph with bold course name */}
            <div className="space-y-2 text-start">
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
                {isAr ? (
                  <>
                    تقديراً لاجتياز دورة <strong className="font-bold text-slate-900">{certificateData.courseTitle}</strong> بالكامل وتفوق — وإتمام كافة الدروس والتمارين والتقييمات وفقاً لأعلى المعايير المعتمدة التي تعكس المهارة العملية الحقيقية.
                  </>
                ) : (
                  <>
                    For completing <strong className="font-bold text-slate-900">{certificateData.courseTitle}</strong> in full — every lesson, exercise, and assessment finished to a certified standard. This credential reflects practical skill, not just attendance.
                  </>
                )}
              </p>
            </div>

            {/* Divider Line */}
            <div className="border-t border-slate-200/80 pt-6 sm:pt-8" />

            {/* Bottom: 3-column Metadata Row (Issue Date, Instructor, Instructor Signature) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-start">
              
              {/* 1. Issue Date */}
              <div className="space-y-1">
                <span className="block text-[11px] font-semibold text-slate-400">
                  {isAr ? "تاريخ الإصدار" : "Issue date"}
                </span>
                <span className="block text-xs sm:text-sm font-bold text-slate-900">
                  {certificateData.issueDate}
                </span>
              </div>

              {/* 2. Instructor Name */}
              <div className="space-y-1">
                <span className="block text-[11px] font-semibold text-slate-400">
                  {isAr ? "المدرب" : "Instructor"}
                </span>
                <span className="block text-xs sm:text-sm font-bold text-slate-900">
                  {certificateData.instructorName || (isAr ? "المدرب المعتمد" : "Certified Instructor")}
                </span>
              </div>

              {/* 3. Instructor Signature */}
              <div className="space-y-1 sm:text-end flex flex-col sm:items-end">
                <span className="font-signature text-3xl sm:text-4xl text-slate-800 tracking-wider select-none leading-none -rotate-2">
                  {certificateData.instructorName || "Laila Hourani"}
                </span>
                <div className="w-32 sm:w-36 h-[1px] bg-slate-300 mt-1" />
                <span className="block text-[11px] font-semibold text-slate-400 pt-0.5">
                  {isAr ? "توقيع المدرب" : "Instructor signature"}
                </span>
              </div>

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
            border: 1px solid #e2e8f0 !important;
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
