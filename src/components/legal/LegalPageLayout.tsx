"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Mail, LucideIcon } from "lucide-react";

export interface LegalSectionItem {
  id: string;
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
}

export interface LegalPageLayoutProps {
  locale: string;
  backToHomeText: string;
  badgeText: string;
  badgeIcon?: LucideIcon;
  title: string;
  lastUpdatedText: string;
  subtitle: string;
  sections: LegalSectionItem[];
  contactTitle: string;
  contactDescription: string;
  contactEmail?: string;
}

export function LegalPageLayout({
  locale,
  backToHomeText,
  badgeText,
  badgeIcon: BadgeIcon = Sparkles,
  title,
  lastUpdatedText,
  subtitle,
  sections,
  contactTitle,
  contactDescription,
  contactEmail = "coachspace4@gmail.com",
}: LegalPageLayoutProps) {
  const isAr = locale === "ar";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50/70 font-sans text-slate-800 py-8 sm:py-14 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Back Link */}
        <div>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#0F5244] transition-colors group cursor-pointer"
          >
            {isAr ? (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            ) : (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            )}
            <span>{backToHomeText}</span>
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D1FAF0] text-[#0F5244]">
            <BadgeIcon className="h-3.5 w-3.5" />
            <span>{badgeText}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {lastUpdatedText}
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Policy Sections Cards */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                aria-labelledby={`heading-${section.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-100/60">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2
                    id={`heading-${section.id}`}
                    className="text-base sm:text-lg font-bold text-slate-900"
                  >
                    {section.title}
                  </h2>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed ps-1 sm:ps-11">
                  {section.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Support Footer Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#EBF5F3] via-[#F4F9F8] to-[#E2F1EE] border border-[#0F5244]/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          {/* Subtle Ambient Background Decorative Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#45D1B4]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0F5244]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 text-center sm:text-start z-10">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {contactTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md leading-relaxed">
              {contactDescription}
            </p>
          </div>

          <a
            href={`mailto:${contactEmail}`}
            className="z-10 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs sm:text-sm font-black transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer active:scale-95"
          >
            <Mail className="w-4 h-4 text-emerald-300" />
            <span>{contactEmail}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
