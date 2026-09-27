"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Play,
  Clock,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  Share2,
  Check,
  Lock,
  BookOpen,
  Compass,
  Trophy,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Code2,
  Palette,
  Database,
  BrainCircuit,
  Smartphone,
  Cloud,
  Layers,
  Star,
  UserCheck,
  Zap,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkle,
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
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [copiedToast, setCopiedToast] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  // Initialize sound preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coachspace_mypath_sound_enabled");
      if (saved !== null) {
        const val = saved === "true";
        setSoundOn(val);
        soundFx.setEnabled(val);
      }
    } catch {}
  }, []);

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    soundFx.setEnabled(nextVal);
    try {
      localStorage.setItem("coachspace_mypath_sound_enabled", String(nextVal));
    } catch {}
    if (nextVal) soundFx.playOptionSelect();
  };

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

  const toggleExpandMilestone = (id: string) => {
    soundFx.playOptionSelect();
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
        accentColor: "from-emerald-500 to-teal-600",
        badge: isAr ? "مسار مخصص" : "Custom Track",
      };
    }
    switch (preferences.track) {
      case "uiux":
        return {
          title: isAr ? "تصميم واجهات وتجربة المستخدم (UI/UX)" : "UI/UX Product Design",
          icon: Palette,
          accentColor: "from-fuchsia-500 to-rose-500",
          badge: isAr ? "تصميم وتجربة" : "Design & UX",
        };
      case "frontend":
        return {
          title: isAr ? "هندسة واجهات الويب (Frontend)" : "Frontend Web Engineering",
          icon: Code2,
          accentColor: "from-emerald-600 to-teal-500",
          badge: isAr ? "تطوير الواجهات" : "Frontend Track",
        };
      case "backend":
        return {
          title: isAr ? "البنية الخلفية والنظم السحابية (Backend)" : "Backend Architecture",
          icon: Database,
          accentColor: "from-blue-600 to-indigo-600",
          badge: isAr ? "الأنظمة وقواعد البيانات" : "Backend & Cloud",
        };
      case "fullstack":
        return {
          title: isAr ? "تطوير الويب الشامل (Full-Stack)" : "Full-Stack Web Development",
          icon: Layers,
          accentColor: "from-indigo-600 to-violet-600",
          badge: isAr ? "تطوير متكامل" : "Full-Stack Mastery",
        };
      case "ai":
        return {
          title: isAr ? "الذكاء الاصطناعي وتعلّم الآلة (AI & ML)" : "Artificial Intelligence & ML",
          icon: BrainCircuit,
          accentColor: "from-purple-600 to-pink-500",
          badge: isAr ? "الذكاء الاصطناعي" : "AI & GenAI",
        };
      case "data":
        return {
          title: isAr ? "علم وهندسة البيانات (Data Science)" : "Data Science & Analytics",
          icon: Database,
          accentColor: "from-cyan-600 to-blue-600",
          badge: isAr ? "علم البيانات" : "Data Science",
        };
      case "mobile":
        return {
          title: isAr ? "تطوير تطبيقات الموبايل (Mobile)" : "Cross-Platform Mobile Apps",
          icon: Smartphone,
          accentColor: "from-amber-500 to-orange-600",
          badge: isAr ? "تطبيقات الهواتف" : "Mobile Engineering",
        };
      case "cloud":
        return {
          title: isAr ? "الحوسبة السحابية وDevOps" : "Cloud Engineering & DevOps",
          icon: Cloud,
          accentColor: "from-sky-500 to-cyan-600",
          badge: isAr ? "السحابة وDevOps" : "Cloud & DevOps",
        };
      default:
        return {
          title: isAr ? "المسار التقني المتخصص" : "Specialized Tech Roadmap",
          icon: Compass,
          accentColor: "from-emerald-600 to-teal-500",
          badge: isAr ? "مسار احترافي" : "Pro Pathway",
        };
    }
  };

  const trackInfo = getTrackDetails();
  const TrackIcon = trackInfo.icon;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-8 relative z-10 text-start w-full max-w-4xl mx-auto pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. SOFT, LUMINOUS & CREATIVE HERO PASSPORT */}
      {/* ========================================================================= */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border border-emerald-200/70 p-6 sm:p-8 shadow-sm backdrop-blur-md overflow-hidden group">
        {/* Soft Decorative Ambient Lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl pointer-events-none translate-y-12 -translate-x-12" />

        <div className="relative z-10 space-y-6">
          {/* Top Row: Track Icon + Main Title + Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Title & Icon Header */}
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
                  ({completedCount} {isAr ? `من ${totalCount} محطات` : `of ${totalCount} stations`})
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
      {/* 2. THE SILK PATHWAY - SOFT & CREATIVE STATIONS TIMELINE */}
      {/* ========================================================================= */}
      <div className="relative py-2 space-y-8">
        {/* Soft Dynamic Spine */}
        <div
          className={`absolute top-8 bottom-12 w-1 rounded-full ${
            isAr ? "right-5 sm:right-7" : "left-5 sm:left-7"
          } bg-gradient-to-b from-emerald-300 via-teal-200 to-slate-200`}
        />

        {/* Stations Loop */}
        <div className="space-y-7">
          {roadmap.milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === "completed";
            const isActive = !isCompleted && idx === currentActiveIndex;
            const firstCourse = milestone.courses && milestone.courses.length > 0 ? milestone.courses[0] : null;
            const isExpanded = Boolean(expandedMilestones[milestone.id]);

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="relative flex items-start gap-4 sm:gap-7"
              >
                {/* Creative Milestone Sphere Node */}
                <div className="relative shrink-0 z-20 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleToggleCompleted(milestone.id)}
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center font-black transition-all duration-300 cursor-pointer ${
                      isCompleted
                        ? "bg-gradient-to-tr from-[#0F5244] to-emerald-500 text-white shadow-md shadow-emerald-700/25 border-2 border-emerald-300"
                        : isActive
                        ? "bg-gradient-to-tr from-[#0F5244] via-emerald-600 to-teal-500 text-white ring-4 ring-emerald-300/40 shadow-lg shadow-emerald-600/30 border-2 border-emerald-200 animate-pulse-gentle"
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
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-emerald-200" />
                    ) : (
                      <span className="text-sm sm:text-base font-black font-mono">
                        {idx + 1}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Soft & Creative Station Card */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                      isCompleted
                        ? "bg-emerald-50/40 border-emerald-200/80 shadow-2xs"
                        : isActive
                        ? "bg-white border-emerald-400 ring-4 ring-emerald-400/10 shadow-lg shadow-slate-200/60"
                        : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Top Ribbon Header */}
                    <div className="p-4 sm:p-6 pb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100/90">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-black uppercase px-3 py-1 rounded-xl tracking-wider ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isActive
                              ? "bg-gradient-to-r from-[#0F5244] to-emerald-700 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isAr ? `المحطة ${idx + 1}` : `Station ${idx + 1}`}
                        </span>

                        <span className="text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                          {milestone.durationWeeks} {isAr ? "أسابيع" : "weeks"}
                        </span>
                      </div>

                      {/* State Badge */}
                      <div>
                        {isCompleted ? (
                          <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{isAr ? "مكتملة بنجاح" : "Completed"}</span>
                          </span>
                        ) : isActive ? (
                          <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                            <span>{isAr ? "المحطة الحالية (ابدأ هنا)" : "Current Focus"}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>{isAr ? "المحطة القادمة" : "Upcoming"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Course Title & Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2.5">
                          <BookOpen className="w-5 h-5 text-[#0F5244] shrink-0 mt-0.5" />
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {firstCourse
                              ? isAr
                                ? firstCourse.titleAr
                                : firstCourse.title
                              : isAr
                              ? milestone.titleAr
                              : milestone.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed ps-7">
                          {isAr ? milestone.descriptionAr : milestone.description}
                        </p>
                      </div>

                      {/* Skills Cloud */}
                      {milestone.skills && milestone.skills.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap ps-7">
                          {(isAr && milestone.skillsAr ? milestone.skillsAr : milestone.skills).map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50/70 text-[#0F5244] border border-emerald-200/70 hover:bg-emerald-100 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Creative Station Project Card */}
                      {milestone.projectTitle && (
                        <div className="rounded-2xl bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 border border-emerald-100 p-4 flex items-start gap-3 shadow-2xs">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#0F5244] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                            <FolderGit2 className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-[10px] font-black uppercase text-[#0F5244] tracking-wider block">
                              {isAr ? "مشروع المحطة التطبيقي (Capstone Project)" : "Practical Station Project"}
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                              {isAr ? milestone.projectTitleAr || milestone.projectTitle : milestone.projectTitle}
                            </h4>
                          </div>
                        </div>
                      )}

                      {/* Collapsible Syllabus & Details */}
                      {firstCourse && (
                        <div className="ps-7">
                          <button
                            type="button"
                            onClick={() => toggleExpandMilestone(milestone.id)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <span>
                              {isExpanded
                                ? isAr
                                  ? "إخفاء التفاصيل"
                                  : "Hide Course Details"
                                : isAr
                                ? "عرض تفاصيل الدورة والمدرب"
                                : "View Instructor & Details"}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden pt-2.5"
                              >
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4 text-[#0F5244]" />
                                    <span>{firstCourse.instructor}</span>
                                  </span>
                                  <div className="flex items-center gap-3 text-slate-500 font-semibold text-[11px]">
                                    <span>
                                      {firstCourse.durationHours} {isAr ? "ساعة تدريبية" : "hours"}
                                    </span>
                                    {firstCourse.level && (
                                      <span className="capitalize px-2 py-0.5 rounded-md bg-emerald-100/70 text-[#0F5244] font-bold text-[10.5px]">
                                        {firstCourse.level}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 sm:p-5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
                      {firstCourse ? (
                        <Link
                          href={`/${locale}/courses/${firstCourse.slug || firstCourse.id || "course"}`}
                          className="px-5 py-2.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black transition-all inline-flex items-center gap-2 shadow-md shadow-[#0F5244]/20 hover:shadow-lg active:scale-95 group cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-emerald-300" />
                          <span>{isAr ? "بدء ودراسة الدورة" : "Start Course"}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                      ) : <div />}

                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(milestone.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                          isCompleted
                            ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-50 border-emerald-200/80 text-[#0F5244] hover:bg-emerald-100 shadow-2xs"
                        }`}
                      >
                        {isCompleted ? (isAr ? "إلغاء التحديد" : "Undo") : isAr ? "إنجاز المحطة ✓" : "Mark Done ✓"}
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
