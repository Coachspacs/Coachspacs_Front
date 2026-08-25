"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  Share2,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Mail,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Check,
  ArrowRight,
  Quote,
  MapPin,
  ExternalLink,
  Star,
  Layers,
} from "lucide-react";
import { PublicInstructor } from "@/types/publicInstructor";
import { CourseCard } from "@/components/catalog/CourseCard";
import {
  getSavedInstructorOverrides,
  getLocalizedName,
  getLocalizedHeadline,
  getLocalizedSpecialization,
  getLocalizedSkill,
} from "@/lib/mockInstructors";

interface PublicInstructorProfileViewProps {
  instructor: PublicInstructor;
}

export function PublicInstructorProfileView({ instructor: initialInstructor }: PublicInstructorProfileViewProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("publicInstructorProfile");

  const [instructor, setInstructor] = useState<PublicInstructor>(initialInstructor || ({} as any));
  const [copied, setCopied] = useState(false);

  // Sync client profile state with saved local/mock overrides on mount
  useEffect(() => {
    if (!initialInstructor) return;
    const overrides = getSavedInstructorOverrides(initialInstructor.id || initialInstructor.slug || "");

    let activeGlobal: any = {};
    if (typeof window !== "undefined") {
      try {
        activeGlobal = JSON.parse(localStorage.getItem("coachspace_active_instructor_profile") || "{}");
      } catch (e) {
        activeGlobal = {};
      }
    }

    const merged = { ...activeGlobal, ...overrides };

    if (Object.keys(merged).length > 0) {
      setInstructor((prev) => ({
        ...prev,
        ...merged,
        name: merged.name || prev.name,
        nameAr: merged.nameAr || merged.name || prev.nameAr,
        headline: merged.headline !== undefined ? merged.headline : prev.headline,
        headlineAr: merged.headlineAr !== undefined ? merged.headlineAr : prev.headlineAr,
        specialization: merged.specialization !== undefined ? merged.specialization : prev.specialization,
        specializationAr: merged.specializationAr !== undefined ? merged.specializationAr : prev.specializationAr,
        experienceYears: merged.experienceYears !== undefined ? merged.experienceYears : prev.experienceYears,
        bio: merged.bio !== undefined ? merged.bio : prev.bio,
        bioAr: merged.bioAr !== undefined ? merged.bioAr : prev.bioAr,
        skills: merged.skills !== undefined ? merged.skills : prev.skills,
        skillsAr: merged.skillsAr !== undefined ? merged.skillsAr : prev.skillsAr,
        avatar: merged.avatar !== undefined ? merged.avatar : prev.avatar,
        hourlyRate: merged.hourlyRate !== undefined ? merged.hourlyRate : prev.hourlyRate,
        hourlyRateAr: merged.hourlyRateAr !== undefined ? merged.hourlyRateAr : prev.hourlyRateAr,
        location: merged.location !== undefined ? merged.location : prev.location,
        locationAr: merged.locationAr !== undefined ? merged.locationAr : prev.locationAr,
        socials: {
          ...(prev.socials || {}),
          ...(merged.socials || {}),
        },
      }));
    }
  }, [initialInstructor]);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        console.error("Clipboard copy error:", e);
      }
    }
  };

  const courses = instructor.courses || [];
  const socials = instructor.socials;

  const displayName = getLocalizedName(instructor.name, instructor.nameAr, isAr);
  const displayHeadline = getLocalizedHeadline(
    isAr ? instructor.headlineAr || instructor.headline : instructor.headline,
    isAr
  );
  const displaySpecialization = getLocalizedSpecialization(
    isAr ? instructor.specializationAr || instructor.specialization : instructor.specialization,
    isAr
  );
  
  const rawLocation = isAr ? (instructor.locationAr || instructor.location) : (instructor.location || instructor.locationAr);
  const displayLocation = rawLocation?.trim() || "";

  const rawHourlyRate = isAr ? (instructor.hourlyRateAr || instructor.hourlyRate) : (instructor.hourlyRate || instructor.hourlyRateAr);
  const displayHourlyRate = rawHourlyRate?.trim() || "";

  const rawBio = isAr ? (instructor.bioAr || instructor.bio) : (instructor.bio || instructor.bioAr);
  const displayBio = rawBio?.trim() || "";

  const displaySkills = (
    (isAr ? instructor.skillsAr : instructor.skills) ||
    instructor.skills ||
    []
  )
    .filter(Boolean)
    .map((s) => getLocalizedSkill(s, isAr));

  const initialLetter = (displayName || "U").trim().charAt(0).toUpperCase();

  const hasSocials = Boolean(
    socials?.github || socials?.linkedin || socials?.website || socials?.email || socials?.twitter
  );

  const hasTotalStudents = Boolean(instructor.totalStudents && instructor.totalStudents > 0);
  const hasCourses = courses.length > 0;
  const hasQuickStats = hasTotalStudents || hasCourses;
  const hasSidebar = Boolean(hasQuickStats || hasSocials);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800 font-sans" dir={isAr ? "rtl" : "ltr"}>
      
      {/* ================= BREADCRUMBS ================= */}
      <div className="border-b border-slate-200/70 bg-white sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${locale}`} className="hover:text-[#0F5244] transition-colors">
              {t("breadcrumbHome")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 text-slate-300 shrink-0" />
            <Link href={`/${locale}/catalog`} className="hover:text-[#0F5244] transition-colors">
              {t("breadcrumbCatalog")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 text-slate-300 shrink-0" />
            <span className="text-slate-400">{t("breadcrumbInstructors")}</span>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180 text-slate-300 shrink-0" />
            <span suppressHydrationWarning className="text-[#0F5244] font-bold truncate max-w-xs sm:max-w-md">
              {displayName}
            </span>
          </nav>
        </div>
      </div>

      {/* ================= MAIN PROFILE CONTAINER ================= */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Master Profile Container Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* 1. TOP PROFILE HEADER */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left/Start: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-slate-50 border-2 border-slate-200/80 overflow-hidden flex items-center justify-center shadow-xs">
                    {instructor.avatar ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={instructor.avatar}
                          alt={displayName}
                          fill
                          priority
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#E6F3EF] to-[#D5EDE6] flex items-center justify-center text-[#0F5244]">
                        <span suppressHydrationWarning className="text-3xl sm:text-4xl font-extrabold select-none">
                          {initialLetter}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name, Verified Badge & Location */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 suppressHydrationWarning className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {displayName}
                    </h1>
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200/80 text-[11px] font-bold shadow-2xs"
                      title={t("verifiedTooltip")}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0F5244]" />
                      <span>{t("verifiedBadge")}</span>
                    </div>
                  </div>

                  {/* Headline or Specialization */}
                  {Boolean(displayHeadline || displaySpecialization) && (
                    <p suppressHydrationWarning className="text-xs sm:text-sm font-semibold text-slate-600">
                      {displayHeadline || displaySpecialization}
                    </p>
                  )}

                  {/* Location & Optional Hourly Rate */}
                  <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                    {displayLocation && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span suppressHydrationWarning>{displayLocation}</span>
                      </div>
                    )}

                    {displayHourlyRate && (
                      <span suppressHydrationWarning className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#0F5244] text-[11px] font-bold border border-emerald-200">
                        {displayHourlyRate}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Right/End Actions: Share & Explore Courses */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto self-stretch md:self-center">
                <button
                  onClick={handleShare}
                  type="button"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t("share")}</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/${locale}/catalog`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#45D1B4]" />
                  <span>{t("exploreCourses")}</span>
                </Link>
              </div>

            </div>
          </div>

          {/* 2. TWO-COLUMN SPLIT LAYOUT (Sticky Sidebar + Main Content) */}
          <div className={`grid grid-cols-1 ${hasSidebar ? "lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-slate-100" : ""}`}>
            
            {/* ================= MODULAR SIDEBAR COLUMN ================= */}
            {hasSidebar && (
              <aside className="lg:col-span-4 p-5 sm:p-7 space-y-4 bg-slate-50/50">
                <div className="lg:sticky lg:top-24 space-y-4">
                  
                  {/* Modular Card 1: Key Quick Stats */}
                  {hasQuickStats && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#0F5244]" />
                        <span>{t("quickHighlights")}</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2.5">
                        {hasTotalStudents && (
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                            <span className="text-slate-400 font-medium block text-[11px]">
                              {t("totalStudents")}
                            </span>
                            <span className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5 block">
                              {instructor.totalStudentsFormatted || instructor.totalStudents}
                            </span>
                          </div>
                        )}

                        {hasCourses && (
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                            <span className="text-slate-400 font-medium block text-[11px]">
                              {t("activeCourses")}
                            </span>
                            <span className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5 block">
                              {courses.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Modular Card: Linked Accounts & Direct Contact */}
                  {hasSocials && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-[#0F5244]" />
                        <span>{t("linkedAccounts")}</span>
                      </h4>
                      <div className="space-y-2">
                        {socials?.github && (
                          <a
                            href={socials.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Github className="h-4 w-4 text-slate-800" />
                              <span className="font-bold text-xs text-slate-800">GitHub</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.linkedin && (
                          <a
                            href={socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4 text-[#0077B5]" />
                              <span className="font-bold text-xs text-slate-800">LinkedIn</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.twitter && (
                          <a
                            href={socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                              <span className="font-bold text-xs text-slate-800">Twitter / X</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.website && (
                          <a
                            href={socials.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-[#0F5244]" />
                              <span className="font-bold text-xs text-slate-800">{t("website")}</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                          </a>
                        )}

                        {socials?.email && (
                          <a
                            href={`mailto:${socials.email}`}
                            className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-[#E6F3EF] border border-slate-200/70 hover:border-[#A7E2D4] flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="h-4 w-4 text-[#0F5244] shrink-0" />
                              <span className="font-bold text-xs text-slate-800 truncate">{socials.email}</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-[#0F5244] transition-colors shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </aside>
            )}

            {/* ================= RIGHT MAIN CONTENT COLUMN ================= */}
            <section className={`${hasSidebar ? "lg:col-span-8" : "lg:col-span-12"} p-6 sm:p-8 space-y-8 bg-white`}>
              
              {/* Bio / About Overview */}
              {displayBio && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Quote className="h-4 w-4 text-[#0F5244]" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {t("aboutCoach")}
                    </h3>
                  </div>
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed font-normal space-y-2.5">
                    {displayBio.split("\n").map((paragraph, idx) =>
                      paragraph.trim() ? (
                        <p key={idx} suppressHydrationWarning>
                          {paragraph}
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* ================= COURSES SECTION ================= */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#0F5244]" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {t("coursesTitle", { count: courses.length })}
                    </h3>
                  </div>
                  {courses.length > 0 && (
                    <span className="text-xs font-semibold text-[#0F5244]">
                      {t("instantEnrollment")}
                    </span>
                  )}
                </div>

                {courses.length === 0 ? (
                  /* Compact & Clean Empty state for courses */
                  <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/50 p-6 sm:p-7 text-center space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#0F5244] border border-emerald-100 flex items-center justify-center mx-auto shadow-2xs">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {t("noCoursesTitle")}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        {t("noCoursesDesc")}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/catalog`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                    >
                      <span>{t("browseCatalog")}</span>
                      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                    </Link>
                  </div>
                ) : (
                  /* Grid of Published Courses */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {courses.map((course) => (
                      <div key={course.id} className="transition-transform hover:-translate-y-0.5 duration-150">
                        <CourseCard course={course} isAr={isAr} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ================= SKILLS SECTION ================= */}
              {displaySkills.length > 0 && (
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Layers className="h-4 w-4 text-[#0F5244]" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {t("skillsTitle")}
                    </h3>
                  </div>

                  {/* Modern Refined Badges */}
                  <div className="flex flex-wrap gap-2">
                    {displaySkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/70 text-emerald-800 border border-emerald-200/60 hover:border-emerald-300 text-xs font-medium transition-all duration-150 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= REVIEWS SECTION ================= */}
              {instructor.reviews && instructor.reviews.length > 0 && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {t("reviewsTitle", { count: instructor.reviews.length })}
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">
                      {instructor.rating || 5.0} ★
                    </span>
                  </div>

                  <div className="space-y-3">
                    {instructor.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl border border-slate-200/70 bg-[#FBFDFB] space-y-2 shadow-2xs hover:border-slate-300/80 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {isAr ? rev.studentNameAr : rev.studentName}
                            </span>
                            <div className="flex items-center text-amber-400">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400">{isAr ? rev.dateAr : rev.date}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed italic font-normal">
                          &ldquo;{isAr ? rev.commentAr : rev.comment}&rdquo;
                        </p>

                        <div className="text-[11px] text-slate-400 font-semibold pt-1">
                          {t("courseLabel", { title: isAr ? rev.courseTitleAr || rev.courseTitle : rev.courseTitle || rev.courseTitleAr })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}
