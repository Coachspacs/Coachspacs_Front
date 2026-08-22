"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { ChevronRight, Sparkles } from "lucide-react";

export function JoinFutureSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide bottom instructor CTA banner when user is logged in (student or instructor)
  if (mounted && isAuthenticated && user) {
    return null;
  }

  return (
    <section className="w-full bg-[#FAFCFC] py-12 sm:py-16 border-t border-slate-200/60 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Full-width container with elegant light mint background for perfect contrast before the dark footer */}
        <div className="relative bg-gradient-to-br from-[#EBF5F3] via-[#F4F9F8] to-[#E2F1EE] rounded-3xl lg:rounded-[36px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-lg border border-[#0F5244]/15">
          
          {/* Subtle Decorative Background Elements */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#45D1B4]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0F5244]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Left Column (Content & Actions) */}
          <div className="col-span-1 lg:col-span-7 p-7 sm:p-10 lg:p-14 flex flex-col justify-center text-left rtl:text-right space-y-6 z-20">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 self-start bg-[#0F5244]/10 border border-[#0F5244]/15 px-3.5 py-1.5 rounded-full text-[#0F5244] text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{t("becomeInstructor")}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight">
              {t("joinTitle")}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
              {t("joinSubtitle")}
            </p>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
              <Link
                href={`/${locale}/become-instructor`}
                className="bg-[#0F5244] hover:bg-[#08382E] active:scale-95 text-white text-sm sm:text-base font-black px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-xl inline-flex items-center justify-center cursor-pointer"
              >
                {t("startTeaching")}
              </Link>

              <Link
                href={`/${locale}/become-instructor`}
                aria-label={`${t("learnMore")} - ${t("becomeInstructor")}`}
                title={`${t("learnMore")} - ${t("becomeInstructor")}`}
                className="text-[#0F5244] hover:text-[#08382E] text-sm sm:text-base font-bold transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
              >
                <span>{t("learnMore")}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="hidden lg:block lg:col-span-5 relative w-full h-full lg:min-h-[420px] z-10 overflow-hidden">
            <Image
              src="/images/join-instructors.png"
              alt={t("joinTitle")}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
