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
  className = "",
  id = "coachspace-certificate-card",
}: CertificateTemplateProps) {
  const {
    studentName,
    courseTitle,
    instructorName,
    issueDate,
    certificateCode,
  } = data;

  // Resolve actual instructor name (default to English Sarah Whitfield)
  const resolvedInstructor =
    instructorName &&
    instructorName !== "Certified Instructor" &&
    instructorName !== "المدرب المعتمد" &&
    !instructorName.toLowerCase().includes("certified instructor")
      ? instructorName
      : "Sarah Whitfield";

  // Ensure English-formatted date if valid date string provided
  let formattedEnglishDate = issueDate;
  try {
    const parsedDate = new Date(issueDate);
    if (!isNaN(parsedDate.getTime()) && !issueDate.includes(" ")) {
      formattedEnglishDate = parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  } catch (_) {}

  return (
    <div
      id={id}
      dir="ltr"
      style={{ width: "842px", height: "595px" }}
      className={`relative w-[842px] h-[595px] min-w-[842px] min-h-[595px] max-w-[842px] max-h-[595px] rounded-3xl bg-[#FAF9F6] text-slate-800 shadow-2xl shadow-slate-900/10 border-2 border-brand-dark/25 p-6 select-none box-border flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Subtle Double-Line Inner Border */}
      <div className="relative w-full h-full rounded-2xl border-2 border-[#8C6512]/35 p-7 flex flex-col justify-between items-center text-center bg-white/85 backdrop-blur-xs box-border">
        
        {/* Subtle Extra Inset Hairline */}
        <div className="absolute inset-2.5 rounded-xl border border-brand-dark/15 pointer-events-none" />

        {/* 4 Minimal Corner Flourishes */}
        <SubtleCorner className="absolute top-2.5 left-2.5" />
        <SubtleCorner className="absolute top-2.5 right-2.5 -scale-x-100" />
        <SubtleCorner className="absolute bottom-2.5 left-2.5 -scale-y-100" />
        <SubtleCorner className="absolute bottom-2.5 right-2.5 -scale-x-100 -scale-y-100" />

        {/* Background Watermark Element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.055] overflow-hidden z-0">
          <Image
            src="/images/brand-logo.png"
            alt=""
            width={360}
            height={360}
            className="w-72 h-auto object-contain"
          />
        </div>

        {/* ========================================================
            1. HEADER: Brand Emblem & Refined Academic Title (English)
           ======================================================== */}
        <div className="relative z-10 w-full pt-1 space-y-2">
          {/* Subtle Brand Lockup */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs">
            <Image
              src="/images/brand-logo.png"
              alt="Coach Space"
              width={22}
              height={22}
              className="w-auto h-4 object-contain"
            />
            <span className="text-[11px] font-bold text-brand-dark tracking-wider font-sans">
              COACH SPACE
            </span>
          </div>

          {/* Certificate Main Title & High-Contrast Gold Subtitle */}
          <div className="space-y-1">
            <h1 className="font-serif-luxury text-3xl font-bold tracking-[0.18em] text-brand-dark">
              CERTIFICATE OF ACHIEVEMENT
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7E5B10]">
              THIS CERTIFICATE IS PROUDLY PRESENTED TO
            </p>
          </div>
        </div>

        {/* ========================================================
            2. RECIPIENT NAME
           ======================================================== */}
        <div className="relative z-10 my-2 w-full max-w-xl px-2">
          <h2 className="font-serif-luxury text-[32px] font-bold text-slate-900 tracking-tight leading-tight truncate">
            {studentName || "Distinguished Student"}
          </h2>
          {/* Darkened Gold Accent Underline */}
          <div className="mx-auto mt-2 flex items-center justify-center gap-1.5">
            <div className="h-[1.5px] w-16 bg-gradient-to-r from-transparent to-[#7E5B10]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#7E5B10]" />
            <div className="h-[1.5px] w-16 bg-gradient-to-l from-transparent to-[#7E5B10]" />
          </div>
        </div>

        {/* ========================================================
            3. COURSE DETAILS & CITATION (English)
           ======================================================== */}
        <div className="relative z-10 w-full max-w-xl space-y-1.5 px-4">
          <p className="text-[13px] text-slate-600 font-normal leading-relaxed">
            In recognition of successfully fulfilling all curriculum requirements and practical coursework for:
          </p>

          <h3 className="font-serif-luxury text-[22px] font-bold text-brand-dark leading-snug tracking-tight truncate">
            « {courseTitle || "Specialized Professional Course"} »
          </h3>

          <p className="text-[11px] text-slate-500 font-medium">
            Demonstrating high proficiency and certified academic commitment.
          </p>
        </div>

        {/* ========================================================
            4. FOOTER: Balanced Two-Column Details & Instructor Signature (English)
           ======================================================== */}
        <div className="relative z-10 w-full pt-4 mt-2 border-t border-slate-200/80">
          <div className="flex flex-row items-end justify-between px-2">
            
            {/* Left Column: Official Issue Date & Verification ID */}
            <div className="text-start space-y-1">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  ISSUE DATE
                </span>
                <span className="block text-[13px] font-bold text-slate-800">
                  {formattedEnglishDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-brand-dark font-mono font-bold tracking-wide pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary-main)] shrink-0" />
                <span>ID: {certificateCode}</span>
              </div>
            </div>

            {/* Right Column: Instructor Signature & Actual Name */}
            <div className="text-end flex flex-col items-end space-y-1">
              {/* Script-style signature */}
              <span className="font-signature text-3xl text-slate-800 select-none leading-none -rotate-1 pe-1">
                {resolvedInstructor}
              </span>
              <div className="w-40 h-[1.5px] bg-slate-300" />
              {/* Actual Instructor Name as the bold line */}
              <span className="block text-xs font-bold text-slate-900 pt-0.5">
                {resolvedInstructor}
              </span>
              {/* Official Subtitle */}
              <span className="block text-[10px] font-medium text-slate-500">
                Lead Instructor & Academic Mentor
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
