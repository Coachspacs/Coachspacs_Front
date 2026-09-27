"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Share2,
  Check,
  Lock,
  BookOpen,
  UserCheck,
  ExternalLink,
  CheckCircle2,
  Zap,
  ShoppingBag,
  Sparkle,
  Compass,
  Palette,
  Code2,
  Database,
  Layers,
  BrainCircuit,
  Smartphone,
  Cloud,
} from "lucide-react";
import { GeneratedRoadmap, RoadmapMilestone, MyPathPreferences } from "@/types/mypath";
import { soundFx } from "@/lib/soundEffects";

interface InteractiveCurriculumMapProps {
  roadmap: GeneratedRoadmap;
  preferences: MyPathPreferences;
  isAr?: boolean;
  locale: string;
  onMilestoneToggle: (id: string) => void;
  onRegenerate: () => void;
  onEditPreferences: () => void;
}

export function InteractiveCurriculumMap({
  roadmap,
  preferences,
  isAr = false,
  locale,
  onMilestoneToggle,
  onRegenerate,
  onEditPreferences,
}: InteractiveCurriculumMapProps) {
  const [copiedToast, setCopiedToast] = useState(false);

  const totalCount = roadmap.milestones.length;
  const completedCount = roadmap.milestones.filter((m) => m.status === "completed").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Active milestone index (first non-completed milestone)
  const activeMilestoneIndex = roadmap.milestones.findIndex((m) => m.status !== "completed");
  const currentActiveIndex = activeMilestoneIndex === -1 ? totalCount - 1 : activeMilestoneIndex;

  const triggerCelebration = () => {
    try {
      soundFx.playCelebration();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#0F5244", "#10B981", "#34D399", "#6EE7B7", "#D1FAE5", "#FBBF24"],
      });
    } catch {}
  };

  const handleToggleCompleted = (milestoneId: string) => {
    const target = roadmap.milestones.find((m) => m.id === milestoneId);
    if (target && target.status !== "completed") {
      triggerCelebration();
    } else {
      soundFx.playOptionSelect();
    }
    onMilestoneToggle(milestoneId);
  };

  const handleShare = () => {
    try {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      }
    } catch {}
  };

  // Human readable track title & icon
  const getTrackDetails = () => {
    if (preferences.customTrackName) {
      return {
        title: preferences.customTrackName,
        icon: Sparkles,
        badge: isAr ? "مسار مخصص" : "Custom Track",
      };
    }
    switch (preferences.track) {
      case "uiux":
        return {
          title: isAr ? "تصميم واجهات وتجربة المستخدم (UI/UX)" : "UI/UX Product Design",
          icon: Palette,
          badge: isAr ? "تصميم وتجربة" : "Design & UX",
        };
      case "frontend":
        return {
          title: isAr ? "هندسة واجهات الويب (Frontend)" : "Frontend Web Engineering",
          icon: Code2,
          badge: isAr ? "تطوير الواجهات" : "Frontend Track",
        };
      case "backend":
        return {
          title: isAr ? "البنية الخلفية والنظم السحابية (Backend)" : "Backend Architecture",
          icon: Database,
          badge: isAr ? "الأنظمة وقواعد البيانات" : "Backend & Cloud",
        };
      case "fullstack":
        return {
          title: isAr ? "تطوير الويب الشامل (Full-Stack)" : "Full-Stack Web Development",
          icon: Layers,
          badge: isAr ? "تطوير متكامل" : "Full-Stack Mastery",
        };
      case "ai":
        return {
          title: isAr ? "الذكاء الاصطناعي وتعلّم الآلة (AI & ML)" : "Artificial Intelligence & ML",
          icon: BrainCircuit,
          badge: isAr ? "الذكاء الاصطناعي" : "AI & GenAI",
        };
      case "data":
        return {
          title: isAr ? "علم وهندسة البيانات (Data Science)" : "Data Science & Analytics",
          icon: Database,
          badge: isAr ? "علم البيانات" : "Data Science",
        };
      case "mobile":
        return {
          title: isAr ? "تطوير تطبيقات الموبايل (Mobile)" : "Cross-Platform Mobile Apps",
          icon: Smartphone,
          badge: isAr ? "تطبيقات الهواتف" : "Mobile Engineering",
        };
      case "cloud":
        return {
          title: isAr ? "الحوسبة السحابية وDevOps" : "Cloud Engineering & DevOps",
          icon: Cloud,
          badge: isAr ? "السحابة وDevOps" : "Cloud & DevOps",
        };
      default:
        return {
          title: isAr ? "المسار التقني المتخصص" : "Specialized Tech Roadmap",
          icon: Compass,
          badge: isAr ? "مسار احترافي" : "Pro Pathway",
        };
    }
  };

  const trackInfo = getTrackDetails();
  const TrackIcon = trackInfo.icon;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-8 relative z-10 text-start w-full max-w-4xl mx-auto pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. SOFT & CLEAN HERO HEADER */}
      {/* ========================================================================= */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border border-emerald-200/70 p-6 sm:p-8 shadow-sm backdrop-blur-md overflow-hidden group">
        {/* Soft Decorative Ambient Lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl pointer-events-none translate-y-12 -translate-x-12" />

        <div className="relative z-10 space-y-6">
          {/* Top Row: Track Icon + Main Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F5244] to-[#0A3D32] text-white flex items-center justify-center shadow-md shadow-[#0F5244]/15 border border-emerald-400/30 group-hover:scale-105 transition-transform duration-300">
                  <TrackIcon className="w-7 h-7 text-emerald-300 stroke-[2.2]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
                  <Sparkle className="w-2.5 h-2.5 fill-current" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-emerald-100/80 text-[#0F5244] border border-emerald-300/60">
                    {trackInfo.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isAr ? "مسار تعليمي تفاعلي ذكي" : "AI-Structured Learning Map"}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {trackInfo.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Progress Bar & Actions Row */}
          <div className="space-y-3 pt-3 border-t border-emerald-100/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Progress Count Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                  {progressPercent}%
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {isAr ? "مستوى إنجاز المسار" : "Curriculum Completion"}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ({completedCount} {isAr ? `من ${totalCount} دورات` : `of ${totalCount} courses`})
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#0F5244] text-xs font-bold transition-all border border-slate-200/80 hover:border-emerald-300 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{copiedToast ? (isAr ? "تم النسخ!" : "Copied!") : isAr ? "مشاركة" : "Share"}</span>
                </button>

                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#0F5244] text-xs font-bold transition-all border border-slate-200/80 hover:border-emerald-300 shadow-2xs cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? "إعادة البناء" : "Regenerate"}</span>
                </button>

                <button
                  type="button"
                  onClick={onEditPreferences}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-[#07382E] text-white text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{isAr ? "تعديل التفضيلات" : "Preferences"}</span>
                </button>
              </div>
            </div>

            {/* Smooth Progress Track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#38E09D] rounded-full shadow-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE CLEAN & FOCUSED COURSE ROADMAP */}
      {/* ========================================================================= */}
      <div className="relative py-2 space-y-8">
        {/* Soft Dynamic Spine */}
        <div
          className={`absolute top-8 bottom-12 w-1 rounded-full ${
            isAr ? "right-5 sm:right-7" : "left-5 sm:left-7"
          } bg-gradient-to-b from-emerald-300 via-teal-200 to-slate-200`}
        />

        {/* Stations / Courses Loop */}
        <div className="space-y-6">
          {roadmap.milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === "completed";
            const isActive = !isCompleted && idx === currentActiveIndex;
            const firstCourse = milestone.courses && milestone.courses.length > 0 ? milestone.courses[0] : null;

            // Course Title
            const courseTitle = firstCourse
              ? isAr
                ? firstCourse.titleAr
                : firstCourse.title
              : isAr
              ? milestone.titleAr
              : milestone.title;

            // Instructor Name
            const instructorName = firstCourse?.instructor || (isAr ? "نخبة من خبراء المنصة" : "Expert Instructor");

            // Free vs Paid check
            const isFree = firstCourse ? firstCourse.isFree === true || firstCourse.price === 0 : false;
            const priceText = isFree
              ? isAr
                ? "دورة مجانية ✨"
                : "Free Course ✨"
              : firstCourse?.price
              ? `${firstCourse.price} ${firstCourse.currency || "$"}`
              : isAr
              ? "دورة معتمدة"
              : "Certified Course";

            const courseLink = `/${locale}/courses/${firstCourse?.slug || firstCourse?.id || "course"}`;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="relative flex items-start gap-4 sm:gap-7"
              >
                {/* Milestone Node */}
                <div className="relative shrink-0 z-20 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleToggleCompleted(milestone.id)}
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center font-black transition-all duration-300 cursor-pointer ${
                      isCompleted
                        ? "bg-gradient-to-tr from-[#0F5244] to-emerald-500 text-white shadow-md shadow-emerald-700/20 border-2 border-emerald-300"
                        : isActive
                        ? "bg-gradient-to-tr from-[#0F5244] via-emerald-600 to-teal-500 text-white ring-4 ring-emerald-300/40 shadow-lg shadow-emerald-600/30 border-2 border-emerald-200"
                        : "bg-white text-slate-400 border-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 shadow-2xs"
                    }`}
                    title={
                      isCompleted
                        ? isAr
                          ? "مكتملة - انقر للتراجع"
                          : "Completed - Click to undo"
                        : isAr
                        ? "تحديد كمكتملة"
                        : "Mark as completed"
                    }
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                    ) : isActive ? (
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-emerald-200" />
                    ) : (
                      <span className="text-sm sm:text-base font-black font-mono">
                        {idx + 1}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Clean, Focused & Elegant Course Card */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`rounded-[2rem] border transition-all duration-300 p-5 sm:p-6 space-y-4 ${
                      isCompleted
                        ? "bg-emerald-50/40 border-emerald-200/80 shadow-2xs"
                        : isActive
                        ? "bg-white border-emerald-400 ring-4 ring-emerald-400/10 shadow-md shadow-slate-200/60"
                        : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Top Row: Station Label + Price Badge + Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-black uppercase px-3 py-1 rounded-xl tracking-wider ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isActive
                              ? "bg-[#0F5244] text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isAr ? `الدورة ${idx + 1}` : `Course ${idx + 1}`}
                        </span>

                        {/* Free / Price Badge */}
                        <span
                          className={`text-xs font-black px-3 py-0.5 rounded-full border ${
                            isFree
                              ? "bg-emerald-100/90 text-emerald-900 border-emerald-300"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {priceText}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        {isCompleted ? (
                          <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{isAr ? "مكتملة" : "Completed"}</span>
                          </span>
                        ) : isActive ? (
                          <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                            <span>{isAr ? "الدورة الحالية" : "Current Focus"}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>{isAr ? "قادمة" : "Upcoming"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Title & Instructor */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-start gap-2.5">
                        <BookOpen className="w-5 h-5 text-[#0F5244] shrink-0 mt-0.5" />
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {courseTitle}
                        </h3>
                      </div>

                      {/* Instructor Name only */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold ps-7">
                        <UserCheck className="w-4 h-4 text-[#0F5244] shrink-0" />
                        <span>
                          {isAr ? `المدرب: ${instructorName}` : `Instructor: ${instructorName}`}
                        </span>
                      </div>
                    </div>

                    {/* Clean Action Buttons Row */}
                    <div className="pt-3 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-3">
                      {/* Primary CTA: Go to Course & Enroll / Buy */}
                      <Link
                        href={courseLink}
                        className="px-5 py-2.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black transition-all inline-flex items-center gap-2 shadow-md shadow-[#0F5244]/20 hover:shadow-lg active:scale-95 group cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                        <span>
                          {isFree
                            ? isAr
                              ? "الذهاب للدورة والبدء مجاناً"
                              : "Start Free Course"
                            : isAr
                            ? "الذهاب للدورة والشراء"
                            : "View Course & Enroll"}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                      </Link>

                      {/* Mark Completed Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(milestone.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                          isCompleted
                            ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-50 border-emerald-200/80 text-[#0F5244] hover:bg-emerald-100 shadow-2xs"
                        }`}
                      >
                        {isCompleted ? (isAr ? "إلغاء التحديد" : "Undo") : isAr ? "إنجاز الدورة ✓" : "Mark Done ✓"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InteractiveCurriculumMap;
