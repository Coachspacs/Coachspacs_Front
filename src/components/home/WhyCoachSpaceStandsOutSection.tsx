"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Award, Globe, Clock, Sparkles, TrendingUp, LucideIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { WhyCoachSpaceStandsOutSectionData } from "@/types/cms";

interface FeatureItem {
  id: string;
  customIcon?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
}

interface WhyCoachSpaceStandsOutProps {
  data?: WhyCoachSpaceStandsOutSectionData;
}

export function WhyCoachSpaceStandsOutSection({ data }: WhyCoachSpaceStandsOutProps = {}) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAr = locale === "ar";

  const titleText = (isAr ? data?.title_ar : data?.title_en) || t("standsOutTitle");
  const subtitleText = (isAr ? data?.subtitle_ar : data?.subtitle_en) || t("standsOutSubtitle");

  const defaultFeatures: FeatureItem[] = [
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

  const features: FeatureItem[] =
    data?.cards && data.cards.length > 0
      ? data.cards.map((c, i) => {
          const icons = [Clock, Sparkles, TrendingUp, Award, Globe];
          return {
            id: c.id || `card-${i}`,
            icon: icons[i % icons.length],
            title: isAr ? c.title_ar : c.title_en,
            description: isAr ? c.desc_ar : c.desc_en,
          };
        })
      : defaultFeatures;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full bg-[#F0F3FF] pb-16 sm:pb-24 pt-4 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {titleText}
          </h2>
          <p className="mt-3 text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
            {subtitleText}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100/90 flex flex-col justify-start gap-4 group w-full cursor-default"
              >
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-[#e2f3f0] text-[#0d7a66] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#004442] group-hover:text-white group-hover:shadow-md transition-all duration-300">
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
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

