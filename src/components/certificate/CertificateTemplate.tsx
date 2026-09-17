"use client";

import React from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { ShieldCheck } from "lucide-react";

export interface CertificateData {
  id: number | string;
  studentName: string;
  courseTitle: string;
  instructorName?: string;
  issueDate: string;
  certificateCode: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
  locale?: string;
  className?: string;
  id?: string;
}

// Minimal, Subtle Corner Flourishes in Green/Gold Palette
function SubtleCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`w-7 h-7 sm:w-9 sm:h-9 text-[#8C6512] pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
    >
      <path d="M0 0 L48 0" strokeWidth="1.2" />
      <path d="M0 0 L0 48" strokeWidth="1.2" />
      <path d="M5 5 L38 5" strokeWidth="0.7" strokeDasharray="2 2" />
      <path d="M5 5 L5 38" strokeWidth="0.7" strokeDasharray="2 2" />
      <circle cx="8" cy="8" r="2" fill="#0F5244" stroke="none" />
    </svg>
  );
}

export function CertificateTemplate({
  data,
  locale,
  className = "",
  id = "coachspace-certificate-card",
}: CertificateTemplateProps) {
  const t = useTranslations("certificate");
  const currentLocale = useLocale() || (locale ? locale.toLowerCase() : "en");
  const isAr = currentLocale === "ar";

  const {
    studentName,
    courseTitle,
    instructorName,
    issueDate,
    certificateCode,
  } = data;

  // Resolve actual instructor name from props or translation JSON files
  const resolvedInstructor =
    instructorName &&
    instructorName !== "Certified Instructor" &&
    instructorName !== "المدرب المعتمد" &&
    !instructorName.toLowerCase().includes("certified instructor")
      ? instructorName
      : t("defaultInstructor");

  return (
    <div
      id={id}
      dir={isAr ? "rtl" : "ltr"}
      className={`relative w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-[#FAF9F6] text-slate-800 shadow-xl shadow-slate-900/5 overflow-hidden border-2 border-[#0F5244]/25 p-3 sm:p-5 md:p-7 select-none ${className}`}
    >
      {/* Subtle Double-Line Inner Border */}
      <div className="relative w-full h-full rounded-xl sm:rounded-2xl border-2 border-[#8C6512]/35 p-6 sm:p-9 md:p-11 flex flex-col justify-between items-center text-center bg-white/80 backdrop-blur-xs">
        
        {/* Subtle Extra Inset Hairline */}
        <div className="absolute inset-2 sm:inset-2.5 rounded-lg sm:rounded-xl border border-[#0F5244]/15 pointer-events-none" />

        {/* 4 Minimal Corner Flourishes */}
        <SubtleCorner className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5" />
        <SubtleCorner className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 -scale-x-100" />
        <SubtleCorner className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 -scale-y-100" />
        <SubtleCorner className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 -scale-x-100 -scale-y-100" />

        {/* Background Watermark Element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] sm:opacity-[0.055] overflow-hidden z-0">
          <Image
            src="/images/brand-logo.png"
            alt=""
            width={360}
            height={360}
            className="w-64 sm:w-80 h-auto object-contain"
          />
        </div>

        {/* ========================================================
            1. HEADER: Brand Emblem & Refined Academic Title
           ======================================================== */}
        <div className="relative z-10 w-full pt-1 sm:pt-2 space-y-2.5">
          {/* Subtle Brand Lockup */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs">
            <Image
              src="/images/brand-logo.png"
              alt="Coach Space"
              width={22}
              height={22}
              className="w-auto h-4 sm:h-5 object-contain"
            />
            <span className="text-[11px] sm:text-xs font-bold text-[#0F5244] tracking-wider font-sans">
              {t("brandTag")}
            </span>
          </div>

          {/* Certificate Main Title & Darkened High-Contrast Gold Subtitle */}
          <div className="space-y-1">
            <h1 className="font-serif-luxury text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-[#0F5244]">
              {t("achievementTitle")}
            </h1>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#7E5B10]">
              {t("presentedTo")}
            </p>
          </div>
        </div>

        {/* ========================================================
            2. RECIPIENT NAME (Refined to ~32-34px in dark navy bold)
           ======================================================== */}
        <div className="relative z-10 my-4 sm:my-5 w-full max-w-xl px-2">
          <h2 className="font-serif-luxury text-xl sm:text-2xl md:text-[30px] lg:text-[33px] font-bold text-slate-900 tracking-tight leading-tight">
            {studentName || t("defaultStudentName")}
          </h2>
          {/* Darkened Gold Accent Underline */}
          <div className="mx-auto mt-2 sm:mt-2.5 flex items-center justify-center gap-1.5">
            <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#7E5B10]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#7E5B10]" />
            <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#7E5B10]" />
          </div>
        </div>

        {/* ========================================================
            3. COURSE DETAILS & CITATION
           ======================================================== */}
        <div className="relative z-10 w-full max-w-xl space-y-1.5 px-4">
          <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed">
            {t("recognitionText")}
          </p>

          <h3 className="font-serif-luxury text-lg sm:text-xl md:text-[22px] lg:text-[25px] font-bold text-[#0F5244] leading-snug tracking-tight">
            « {courseTitle || t("defaultCourseTitle")} »
          </h3>

          <p className="text-[11px] text-slate-500 font-medium">
            {t("commitmentNotice")}
          </p>
        </div>

        {/* ========================================================
            4. FOOTER: Balanced Two-Column Details & Instructor Signature
           ======================================================== */}
        <div className="relative z-10 w-full pt-6 sm:pt-7 mt-5 sm:mt-6 border-t border-slate-200/80">
          <div className="flex flex-row items-end justify-between gap-4">
            
            {/* Left Column: Official Issue Date & Verification ID */}
            <div className="text-start space-y-1.5">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t("issueDate")}
                </span>
                <span className="block text-xs sm:text-[13px] font-bold text-slate-800">
                  {issueDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-800 font-mono font-bold tracking-wide pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ID: {certificateCode}</span>
              </div>
            </div>

            {/* Right Column: Instructor Signature & Actual Name */}
            <div className="text-end flex flex-col items-end space-y-1">
              {/* Script-style signature */}
              <span className="font-signature text-2xl sm:text-3xl md:text-4xl text-slate-800 select-none leading-none -rotate-1 pe-1">
                {resolvedInstructor}
              </span>
              <div className="w-28 sm:w-36 md:w-44 h-[1.5px] bg-slate-300" />
              {/* Actual Instructor Name as the bold line */}
              <span className="block text-xs sm:text-sm font-bold text-slate-900 pt-0.5">
                {resolvedInstructor}
              </span>
              {/* Official Subtitle */}
              <span className="block text-[10px] sm:text-[11px] font-medium text-slate-500">
                {t("leadInstructorSubtitle")}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
