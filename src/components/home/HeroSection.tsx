"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  ArrowRight,
  Users,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { HeroSectionData } from "@/types/cms";

interface HeroSectionProps {
  data?: HeroSectionData;
}

export function HeroSection({ data }: HeroSectionProps = {}) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const badgeText = (isAr ? data?.badge_ar : data?.badge_en) || t("heroBadge");
  const titleText = (isAr ? data?.title_ar : data?.title_en) || t("heroTitle");
  const highlightText = (isAr ? data?.highlighted_text_ar : data?.highlighted_text_en) || t("heroTitleHighlight");
  const descriptionText = (isAr ? data?.description_ar : data?.description_en) || t("heroSubtitle");
  const ctaPrimaryText = (isAr ? data?.cta_primary_text_ar : data?.cta_primary_text_en) || t("exploreCourses");
  const ctaPrimaryLink = data?.cta_primary_link || `/${locale}/courses`;
  const ctaSecondaryText = (isAr ? data?.cta_secondary_text_ar : data?.cta_secondary_text_en) || t("startLearningFree");
  const ctaSecondaryLink = data?.cta_secondary_link || `/${locale}/register`;
  const heroImageUrl = data?.hero_image_url || "/images/hero-coach.png";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = user?.name || user?.fullName || user?.email?.split("@")[0] || "";
  const isInstructor = (user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach";
  const approvalStatus = (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase();
  const isApproved = approvalStatus === "approved";

  // Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 pt-12 md:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10">
      {/* Background Animated Aurora Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#6CF8BB]/15 blur-[100px] pointer-events-none animate-aurora-drift z-0" />
      <div className="absolute top-10 right-0 w-[32rem] h-[32rem] rounded-full bg-[#0F5244]/8 blur-[120px] pointer-events-none animate-float-delayed z-0" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 flex flex-col items-start text-left rtl:text-right z-10"
          >
            
            {/* Dynamic Welcome Pill / Badge */}
            <motion.div variants={itemVariants}>
              {mounted && isAuthenticated ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F5244] text-white shadow-md mb-6 text-xs sm:text-sm font-bold animate-in fade-in duration-300">
                  <Sparkles className="w-4 h-4 text-[#6CF8BB] shrink-0" />
                  <span>
                    {isInstructor
                      ? t("welcomeInstructor", { name: displayName })
                      : t("welcomeStudent", { name: displayName })}
                  </span>
                  {isInstructor && (
                    <span
                      className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        !isApproved
                          ? "bg-amber-400/25 text-amber-200"
                          : "bg-white/15 text-emerald-200"
                      }`}
                    >
                      {isApproved
                        ? t("instructorBadge")
                        : t("instructorPendingBadge")}
                    </span>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6CF8BB]/20 text-[#0F5244] border border-[#6CF8BB]/40 shadow-xs mb-6 text-xs font-bold tracking-wider uppercase">
                  <VerifiedBadge size="xs" />
                  <span>{badgeText}</span>
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.35] mb-6"
            >
              {titleText}{" "}
              <span className="text-[#0F5244] block mt-2 sm:mt-3">
                {highlightText}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mb-8 font-medium"
            >
              {descriptionText}
            </motion.p>

            {/* Dynamic CTAs Row */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3.5 sm:gap-4"
            >
              {mounted && isAuthenticated ? (
                isInstructor ? (
                  <>
                    <Link
                      href={
                        isApproved
                          ? `/${locale}/instructor/dashboard`
                          : `/${locale}/instructor/settings`
                      }
                      className="inline-flex items-center gap-2.5 bg-[#0F5244] hover:bg-[#0c4337] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-lg shadow-[#0F5244]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer animate-shimmer"
                    >
                      <span>{t("instructorDashboardBtn")}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href={
                        isApproved
                          ? `/${locale}/instructor/courses/new`
                          : `/${locale}/instructor/settings`
                      }
                      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0F5244] border-2 border-[#0F5244]/30 hover:border-[#0F5244] font-bold text-sm sm:text-base px-6 py-3.5 rounded-full shadow-xs transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <span>{t("createCourseBtn")}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/student/courses`}
                      className="inline-flex items-center gap-2.5 bg-[#0F5244] hover:bg-[#0c4337] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-lg shadow-[#0F5244]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer animate-shimmer"
                    >
                      <span>{t("myLearning")}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href={`/${locale}/courses`}
                      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0F5244] border-2 border-[#0F5244]/30 hover:border-[#0F5244] font-bold text-sm sm:text-base px-6 py-3.5 rounded-full shadow-xs transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <span>{t("exploreMoreCourses")}</span>
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link
                    href={ctaPrimaryLink}
                    className="inline-flex items-center gap-3 bg-[#0F5244] hover:bg-[#0c4337] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg shadow-[#0F5244]/20 hover:shadow-xl hover:shadow-[#0F5244]/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer animate-shimmer"
                  >
                    <span>{ctaPrimaryText}</span>
                    <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={ctaSecondaryLink}
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0F5244] border-2 border-[#0F5244]/30 hover:border-[#0F5244] font-bold text-sm sm:text-base px-6 py-3.5 rounded-full shadow-xs transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>{ctaSecondaryText}</span>
                  </Link>
                </>
              )}
            </motion.div>

          </motion.div>

          {/* Hero Image & Interactive Floating Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="hidden lg:flex lg:col-span-6 relative justify-center lg:justify-end rtl:lg:justify-start items-center mt-10 lg:mt-0"
          >
            
            {/* Ambient Glow */}
            <div className="absolute -top-[31px] ltr:right-0 rtl:-left-8 w-[600px] h-[600px] rounded-[9999px] bg-[#6CF8BB]/20 blur-[80px] pointer-events-none z-0" />

            {/* Image Wrapper */}
            <div className="relative z-10 w-full max-w-[440px] sm:max-w-[480px] rtl:lg:-translate-x-8 transition-transform duration-300">
              
              <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-white group/heroimg">
                <Image
                  src={heroImageUrl}
                  alt="Coach Space"
                  width={640}
                  height={640}
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                  className="w-full h-full object-cover object-center group-hover/heroimg:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Floating Card 1: Students */}
              <div className="absolute -top-5 ltr:-left-6 rtl:-right-6 sm:-top-7 sm:ltr:-left-8 sm:rtl:-right-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/70 border border-slate-100 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] z-20 select-none animate-float-slow">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#6CF8BB]/25 text-[#0F5244] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {t("activeStudentsCount")}
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    {t("activeStudentsLabel")}
                  </div>
                </div>
              </div>

              {/* Floating Card 2: Courses */}
              <div className="absolute top-1/2 ltr:-right-6 rtl:-left-6 sm:ltr:-right-8 sm:rtl:-left-8 -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/70 border border-slate-100 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] z-20 select-none animate-float-delayed">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#6CF8BB]/25 text-[#0F5244] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {t("expertCoursesCount")}
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    {t("expertCoursesLabel")}
                  </div>
                </div>
              </div>

              {/* Floating Card 3: Certificates */}
              <div className="absolute -bottom-5 ltr:left-6 rtl:right-6 sm:-bottom-7 sm:ltr:left-10 sm:rtl:right-10 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/70 border border-slate-100 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] z-20 select-none animate-float-slow">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#6CF8BB]/25 text-[#0F5244] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {t("certificatesCount")}
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    {t("certificatesLabel")}
                  </div>
                </div>
              </div>

            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}

