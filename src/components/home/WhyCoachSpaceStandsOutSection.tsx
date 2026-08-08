"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Award, Globe, LucideIcon } from "lucide-react";

interface FeatureItem {
  id: string;
  customIcon?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
}

export function WhyCoachSpaceStandsOutSection() {
  const t = useTranslations("home");

  const features: FeatureItem[] = [
    {
      id: "learn-anywhere",
      customIcon: "/images/icons/learn-anywhere.png",
      title: t("feature1Title"),
      description: t("feature1Desc"),
    },
    {
      id: "expert-instructors",
      customIcon: "/images/icons/expert-instructors.png",
      title: t("feature2Title"),
      description: t("feature2Desc"),
    },
    {
      id: "global-certification",
      icon: Award,
      title: t("feature3Title"),
      description: t("feature3Desc"),
    },
    {
      id: "bilingual-learning",
      icon: Globe,
      title: t("feature4Title"),
      description: t("feature4Desc"),
    },
  ];

  return (
    <section className="w-full bg-[#F0F3FF] pb-16 sm:pb-24 pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t("standsOutTitle")}
          </h2>
          <p className="mt-3 text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
            {t("standsOutSubtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 flex flex-col justify-start gap-4 group w-full"
              >
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-[#e2f3f0] text-[#0d7a66] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#004442] group-hover:text-white transition-all duration-300">
                  {feature.customIcon ? (
                    <Image
                      src={feature.customIcon}
                      alt={feature.title}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain group-hover:brightness-0 group-hover:invert transition-all duration-300"
                    />
                  ) : Icon ? (
                    <Icon className="w-6 h-6 stroke-[2] text-[#0d7a66] group-hover:text-white transition-colors duration-300" />
                  ) : null}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#004442] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
