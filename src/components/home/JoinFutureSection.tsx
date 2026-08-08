"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";

export function JoinFutureSection() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="w-full bg-[#F0F3FF] py-10 sm:py-14">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-8">
        {/* Full-width container with rounded corners rounded-3xl / rounded-[36px] */}
        <div className="relative bg-[#003535] rounded-3xl lg:rounded-[36px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl border border-white/10">
          
          {/* Figma Linear Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to top right, #003535 0%, rgba(0, 53, 53, 0) 50%, rgba(0, 53, 53, 0) 100%)",
            }}
          />

          {/* Left Column (Content & Actions) */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center text-left rtl:text-right space-y-6 z-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight">
              {t("joinTitle")}
            </h2>

            <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
              {t("joinSubtitle")}
            </p>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
              <Link
                href={`/${locale}/become-instructor`}
                className="bg-[#006C49] hover:bg-[#00573b] active:scale-95 text-white text-sm sm:text-base font-bold px-7 py-3.5 rounded-full transition-all duration-200 shadow-md inline-flex items-center justify-center"
              >
                {t("startTeaching")}
              </Link>

              <Link
                href={`/${locale}/become-instructor`}
                className="text-white hover:opacity-85 text-sm sm:text-base font-semibold transition-opacity inline-flex items-center gap-1.5 group"
              >
                <span>{t("learnMore")}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Image positioned at the top right, leaves green space below */}
          <div className="lg:col-span-5 relative flex flex-col justify-start z-20 min-h-[340px] lg:min-h-[400px]">
            <div className="relative w-full h-[260px] sm:h-[300px] lg:h-[330px] overflow-hidden ltr:rounded-tr-3xl ltr:lg:rounded-tr-[36px] rtl:rounded-tl-3xl rtl:lg:rounded-tl-[36px]">
              <Image
                src="/images/join-instructors.png"
                alt={t("joinTitle")}
                fill
                className="object-cover object-top"
              />
            </div>
            {/* Green space #003535 remains exposed underneath the image */}
          </div>

        </div>
      </div>
    </section>
  );
}
