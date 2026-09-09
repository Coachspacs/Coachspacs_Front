"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Award, Download, CheckCircle2, Calendar, ShieldCheck } from "lucide-react";

interface StudentCertificatesTabProps {
  courses: any[];
}

export function StudentCertificatesTab({
  courses,
}: StudentCertificatesTabProps) {
  const tWs = useTranslations("studentWorkspace");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const completedCourses = courses.filter((c) => c.isCompleted);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {tWs("earnedCertificatesTitle")}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            {completedCourses.length}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {tWs("earnedCertificatesDesc")}
        </p>
      </div>

      {/* Certificate Cards Grid */}
      {completedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {completedCourses.map((cert) => (
            <div
              key={cert.id}
              className="p-5 sm:p-6 rounded-3xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-2xs hover:border-[#0F5244]/40 hover:shadow-sm transition-all relative overflow-hidden flex flex-col justify-between h-full"
            >
              <div className="flex items-start gap-3.5 sm:gap-4 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100/80 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isAr ? "شهادة إتمام معتمدة" : "Verified Certificate"}</span>
                  </div>
                  <div className="min-h-[2.75rem] sm:min-h-[3rem] flex items-start">
                    <h4
                      className="text-sm sm:text-base font-black text-slate-900 leading-snug line-clamp-2"
                      title={cert.title}
                    >
                      {cert.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                    <span className="truncate">ID: {cert.certificateId || `CS-${cert.id}`}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-nowrap">
                <div className="text-[11px] sm:text-xs text-slate-500 font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "مكتمل 100%" : "Completed 100%"}</span>
                </div>

                <Link
                  href={`/${locale}/student/certificates/${cert.certificateId || `CS-${cert.id}`}`}
                  className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>{tWs("downloadPdf")}</span>
                </Link>
              </div>
            </div>
          ))}
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
