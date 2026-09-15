"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  Search,
  Loader2,
  Award,
  X,
} from "lucide-react";
import { certificateService } from "@/services/certificateService";
import { CertificateItem } from "@/types/certificate";
import { EnrolledCourse } from "@/types/course";

interface StudentCertificatesTabProps {
  courses?: EnrolledCourse[];
}

export function StudentCertificatesTab({
  courses,
}: StudentCertificatesTabProps) {
  const tWs = useTranslations("studentWorkspace");
  const tCert = useTranslations("certificate");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [liveCertificates, setLiveCertificates] = useState<CertificateItem[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isSubscribed = true;

    async function loadCertificates() {
      try {
        const certs = await certificateService.getMyCertificates();
        if (isSubscribed && Array.isArray(certs)) {
          setLiveCertificates(certs);
        }
      } catch (err) {
        console.warn("[StudentCertificatesTab] Error fetching live certificates:", err);
      } finally {
        if (isSubscribed) {
          setIsLoadingCerts(false);
        }
      }
    }

    loadCertificates();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Only display official backend certificates from /api/certificates
  const certificateList = liveCertificates.map((item) => {
    const code = item.certificate_code || `CS-${item.id}`;
    const courseId = item.course?.id || item.course_id || (typeof item.course === 'number' || typeof item.course === 'string' ? item.course : undefined);
    
    // Look up in passed enrolled courses if title not directly present
    const matchedEnr = courses?.find(
      (c) => String(c.id) === String(courseId) || String(c.course_id) === String(courseId)
    );

    const courseTitle =
      (isAr
        ? item.course?.title_ar || item.course?.title || item.course_title || matchedEnr?.title_ar || matchedEnr?.title
        : item.course?.title_en || item.course?.title || item.course_title || matchedEnr?.title_en || matchedEnr?.title) ||
      matchedEnr?.title ||
      item.course?.title ||
      item.course_title ||
      item.title ||
      (isAr ? "دورة تدريبية متخصصة" : "Specialized Course");

    return {
      id: item.id,
      certificate_code: code,
      title: courseTitle,
      course_id: courseId,
      issued_at: item.issued_at,
      pdf_url: item.pdf_url,
      source: "api",
    };
  });

  const filteredCertificates = certificateList.filter((cert) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = (cert.title || "").toLowerCase().includes(q);
    const codeMatch = String(cert.certificate_code || "").toLowerCase().includes(q);
    const idMatch = String(cert.id || "").toLowerCase().includes(q);
    const courseIdMatch = cert.course_id
      ? String(cert.course_id).toLowerCase().includes(q)
      : false;
    return titleMatch || codeMatch || idMatch || courseIdMatch;
  });

  const handleDownloadPdf = async (cert: any) => {
    const targetId = cert.id || cert.certificate_code;
    setDownloadingId(targetId);
    setDownloadStatus(tCert("preparingCertificate"));

    try {
      await certificateService.downloadCertificate(targetId, (status, detail) => {
        if (status === "pending") {
          setDownloadStatus(detail || tCert("retryingDownload"));
        } else if (status === "ready") {
          setDownloadStatus(tCert("downloadReady"));
        }
      });
    } catch (err) {
      console.warn("Failed to download certificate PDF:", err);
      // Open certificate view page with auto-download triggered
      window.open(
        `/${locale}/student/certificates/${cert.certificate_code || cert.id}?download=1`,
        "_blank"
      );
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
        setDownloadStatus(null);
      }, 2000);
    }
  };

  const formatIssuedDate = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header with Search & Achievement Milestone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {tWs("earnedCertificatesTitle")}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {tWs("earnedCertificatesDesc")}
          </p>
        </div>

        {/* Search Credential Input */}
        {certificateList.length > 0 && (
          <div className="relative w-full sm:w-72 md:w-80 group">
            <div className="absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 pointer-events-none flex items-center justify-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <Search className="w-4 h-4 stroke-[2.2]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tWs("searchCredentialPlaceholder")}
              style={{ outline: "none" }}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none focus:outline-none focus-visible:outline-none transition-all duration-200 rtl:pr-11 ltr:pl-11 rtl:pl-10 ltr:pr-10 text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all focus:outline-none cursor-pointer"
                title={isAr ? "مسح" : "Clear"}
                aria-label={isAr ? "مسح" : "Clear"}
              >
                <X className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Certificate Cards Grid */}
      {isLoadingCerts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-white shadow-2xs animate-pulse space-y-4"
            >
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-full w-24" />
                  <div className="h-5 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <div className="h-8 bg-slate-100 rounded-xl w-20" />
                <div className="h-8 bg-slate-100 rounded-xl w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {filteredCertificates.map((cert) => {
            const isThisDownloading =
              downloadingId === (cert.id || cert.certificate_code);
            const formattedDate = formatIssuedDate(cert.issued_at);

            return (
              <div
                key={cert.certificate_code || cert.id}
                className="relative p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:border-emerald-500/35 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full group overflow-hidden"
              >
                {/* Subtle top accent edge highlight */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Subtle CoachSpace organic leaf watermark motif */}
                <svg
                  className="absolute -top-3 -end-3 w-28 h-28 text-emerald-900/[0.035] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M50 85 C50 50, 75 35, 80 15 C60 20, 45 45, 50 85 Z" fill="currentColor" fillOpacity="0.5" />
                  <path d="M50 85 C48 55, 25 40, 20 25 C38 28, 48 55, 50 85 Z" fill="currentColor" fillOpacity="0.3" />
                  <path d="M50 85 L50 35" stroke="currentColor" strokeWidth="1.5" />
                </svg>

                {/* Top Section: Icon + Details (Verified badge, Title, ID & Date) */}
                <div className="relative z-10">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 text-[#0F5244] border border-emerald-100/90 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <Award className="w-6 h-6 stroke-[1.9]" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5 text-start">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50/90 border border-emerald-200/60 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white shrink-0" />
                        <span>{tCert("verifiedCertificate")}</span>
                      </div>
                      <h3
                        className="text-sm sm:text-base font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0F5244] transition-colors"
                        title={cert.title}
                      >
                        {cert.title}
                      </h3>
                      {/* Certificate ID & subtle natural issue date */}
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pt-0.5 flex-wrap">
                        <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                          ID: {cert.certificate_code}
                        </span>
                        {formattedDate && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{tCert("issued")} {formattedDate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row: View + Download PDF ONLY */}
                <div className="mt-5 pt-4 border-t border-slate-100 relative z-10 flex items-center justify-end gap-2 sm:gap-2.5 flex-wrap">
                  {/* View Certificate Page */}
                  <Link
                    href={`/${locale}/student/certificates/${cert.certificate_code || cert.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap group/link"
                  >
                    <Eye className="w-4 h-4 text-slate-400 group-hover/link:text-slate-600 transition-colors shrink-0" />
                    <span className="whitespace-nowrap">{tWs("viewCertificate")}</span>
                  </Link>

                  {/* Download PDF Button with async retry support */}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(cert)}
                    disabled={isThisDownloading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-98 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shrink-0 whitespace-nowrap min-w-fit"
                  >
                    {isThisDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span className="text-[11px] truncate max-w-[120px] whitespace-nowrap">
                          {downloadStatus || tCert("preparingCertificate")}
                        </span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">{tWs("downloadPdf")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchQuery.trim() ? (
        /* Search Not Found State */
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {tWs("noSearchResultTitle")}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tWs("noSearchResultDesc")}
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0F5244] bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            {isAr ? "إلغاء البحث" : "Clear Search"}
          </button>
        </div>
      ) : (
        /* Empty State */
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-2xs text-center space-y-5 sm:space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-[#0F5244] shadow-2xs">
            <Award className="h-9 w-9 stroke-[1.8]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {tWs("noCertificatesTitle")}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              {tWs("noCertificatesDesc")}
            </p>
          </div>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs font-black transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <span>{tWs("exploreCourses")}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default StudentCertificatesTab;
