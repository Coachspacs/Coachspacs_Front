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
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#0F5244", "#10B981", "#38E09D", "#F59E0B", "#D1FAE5"],
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
      };
    }
    switch (preferences.track) {
      case "uiux":
        return {
          title: isAr ? "تصميم واجهات وتجربة المستخدم (UI/UX)" : "UI/UX Product Design",
          icon: Palette,
        };
      case "frontend":
        return {
          title: isAr ? "هندسة واجهات الويب (Frontend)" : "Frontend Web Engineering",
          icon: Code2,
        };
      case "backend":
        return {
          title: isAr ? "البنية الخلفية والنظم السحابية (Backend)" : "Backend Architecture",
          icon: Database,
        };
      case "fullstack":
        return {
          title: isAr ? "تطوير الويب الشامل (Full-Stack)" : "Full-Stack Web Development",
          icon: Layers,
        };
      case "ai":
        return {
          title: isAr ? "الذكاء الاصطناعي وتعلّم الآلة (AI & ML)" : "Artificial Intelligence & ML",
          icon: BrainCircuit,
        };
      case "data":
        return {
          title: isAr ? "علم وهندسة البيانات (Data Science)" : "Data Science & Analytics",
          icon: Database,
        };
      case "mobile":
        return {
          title: isAr ? "تطوير تطبيقات الموبايل (Mobile)" : "Cross-Platform Mobile Apps",
          icon: Smartphone,
        };
      case "cloud":
        return {
          title: isAr ? "الحوسبة السحابية وDevOps" : "Cloud Engineering & DevOps",
          icon: Cloud,
        };
      default:
        return {
          title: isAr ? "المسار التقني المتخصص" : "Specialized Tech Roadmap",
          icon: Compass,
        };
    }
  };

  const trackInfo = getTrackDetails();
  const TrackIcon = trackInfo.icon;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6 relative z-10 text-start w-full max-w-4xl mx-auto pb-8 font-sans">
      {/* ========================================================================= */}
      {/* 1. SOFT & ELEGANT HEADER PASSPORT */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F5244] to-[#0A3D32] text-white p-5 sm:p-7 shadow-sm border border-emerald-700/30 overflow-hidden">
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Row: Track Icon + Title + Stats Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title Details */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0 text-[#38E09D]">
                <TrackIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md">
                    {isAr ? "خطة التعلّم المخصصة" : "Personalized Learning Path"}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {trackInfo.title}
                </h1>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-black/20 backdrop-blur-md rounded-2xl px-3.5 py-1.5 border border-white/10 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-100">
                <Clock className="w-3.5 h-3.5 text-[#38E09D]" />
                <span>{preferences.hoursPerWeek} {isAr ? "س/أسبوع" : "hrs/wk"}</span>
              </div>

              <div className="w-px h-4 bg-white/20" />

              <div className="flex items-center gap-1.5 text-emerald-100">
                <Calendar className="w-3.5 h-3.5 text-[#38E09D]" />
                <span>{Math.max(1, Math.round(roadmap.estimatedWeeks / 4))} {isAr ? "أشهر" : "mos"}</span>
              </div>

              <div className="w-px h-4 bg-white/20" />

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 rounded-lg hover:bg-white/15 text-emerald-200 transition-colors cursor-pointer"
                title={soundOn ? (isAr ? "كتم الصوت" : "Mute Sound") : (isAr ? "تشغيل الصوت" : "Unmute Sound")}
              >
                {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#38E09D]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Progress Bar & Actions */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-200">
              <span>{progressPercent}% {isAr ? "مكتمل" : "Completed"} ({completedCount} {isAr ? `من ${totalCount} محطات` : `of ${totalCount} stations`})</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-[#38E09D]" />
                  <span>{copiedToast ? (isAr ? "تم النسخ!" : "Copied!") : isAr ? "مشاركة" : "Share"}</span>
                </button>

                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#38E09D]" />
                  <span>{isAr ? "إعادة البناء" : "Regenerate"}</span>
                </button>

                <button
                  type="button"
                  onClick={onEditPreferences}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#38E09D]" />
                  <span>{isAr ? "التفضيلات" : "Preferences"}</span>
                </button>
              </div>
            </div>

            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 to-[#38E09D] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SOFT & CLEAN MODULAR STATIONS TIMELINE */}
      {/* ========================================================================= */}
      <div className="relative py-2">
        {/* Soft Slender Vertical Timeline Spine */}
        <div
          className={`absolute top-6 bottom-8 w-0.5 bg-emerald-200/80 rounded-full ${
            isAr ? "right-5 sm:right-7" : "left-5 sm:left-7"
          }`}
        />

        {/* Station Cards */}
        <div className="space-y-6">
          {roadmap.milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === "completed";
            const isActive = !isCompleted && idx === currentActiveIndex;
            const firstCourse = milestone.courses && milestone.courses.length > 0 ? milestone.courses[0] : null;
            const isExpanded = Boolean(expandedMilestones[milestone.id]);

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="relative flex items-start gap-3 sm:gap-6"
              >
                {/* Milestone Node on Spine */}
                <div className="relative shrink-0 z-20 pt-1.5">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleToggleCompleted(milestone.id)}
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all cursor-pointer shadow-xs ${
                      isCompleted
                        ? "bg-[#0F5244] text-white border-2 border-emerald-300"
                        : isActive
                        ? "bg-[#0F5244] text-[#38E09D] ring-4 ring-emerald-100 border-2 border-[#38E09D]"
                        : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                    }`}
                    title={isCompleted ? (isAr ? "مكتملة - انقر للتراجع" : "Completed - Click to undo") : (isAr ? "تحديد كمكتملة" : "Mark as completed")}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                    ) : (
                      <span className="text-sm sm:text-base font-black font-mono">
                        {idx + 1}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Soft Station Card */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
                      isCompleted
                        ? "bg-emerald-50/40 border-emerald-200/70"
                        : isActive
                        ? "bg-white border-emerald-400 ring-2 ring-emerald-400/15 shadow-sm"
                        : "bg-white border-slate-200/80 shadow-xs"
                    }`}
                  >
                    {/* Station Top Pill Header */}
                    <div className="p-4 sm:p-5 pb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] sm:text-xs font-bold uppercase px-2.5 py-0.5 rounded-lg ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-900"
                              : isActive
                              ? "bg-[#0F5244] text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isAr ? `المحطة ${idx + 1}` : `Station ${idx + 1}`}
                        </span>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {milestone.durationWeeks} {isAr ? "أسابيع" : "weeks"}
                        </span>
                      </div>

                      {/* State Text */}
                      <div>
                        {isCompleted ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{isAr ? "مكتملة" : "Completed"}</span>
                          </span>
                        ) : isActive ? (
                          <span className="text-xs font-bold text-[#0F5244] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{isAr ? "المحطة الحالية" : "Current"}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>{isAr ? "قادمة" : "Upcoming"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Station Content */}
                    <div className="p-4 sm:p-5 space-y-3.5">
                      {/* Title & Description */}
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-[#0F5244] shrink-0 mt-0.5" />
                          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {firstCourse
                              ? isAr
                                ? firstCourse.titleAr
                                : firstCourse.title
                              : isAr
                              ? milestone.titleAr
                              : milestone.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
                          {isAr ? milestone.descriptionAr : milestone.description}
                        </p>
                      </div>

                      {/* Skills Cloud */}
                      {milestone.skills && milestone.skills.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {(isAr && milestone.skillsAr ? milestone.skillsAr : milestone.skills).map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/80"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Soft Capstone Project Pill */}
                      {milestone.projectTitle && (
                        <div className="rounded-xl bg-[#F7FCF9] border border-emerald-100 p-3 flex items-start gap-2.5">
                          <FolderGit2 className="w-4 h-4 text-[#0F5244] shrink-0 mt-0.5" />
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                              {isAr ? "مشروع المحطة التطبيقي" : "Station Project"}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {isAr ? milestone.projectTitleAr || milestone.projectTitle : milestone.projectTitle}
                            </h4>
                          </div>
                        </div>
                      )}

                      {/* Collapsible Syllabus Detail */}
                      {firstCourse && (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleExpandMilestone(milestone.id)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{isExpanded ? (isAr ? "إخفاء التفاصيل" : "Hide Details") : (isAr ? "عرض تفاصيل الدورة والمدرب" : "View Course Details")}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden pt-2"
                              >
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-between gap-2">
                                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-[#0F5244]" />
                                    <span>{firstCourse.instructor}</span>
                                  </span>
                                  <span className="text-slate-500 font-medium">
                                    {firstCourse.durationHours} {isAr ? "ساعة" : "hours"}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="p-3 sm:p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                      {firstCourse ? (
                        <Link
                          href={`/${locale}/courses/${firstCourse.slug || firstCourse.id || "course"}`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs group"
                        >
                          <Play className="w-3 h-3 fill-current text-[#38E09D]" />
                          <span>{isAr ? "فتح الدورة" : "Start Course"}</span>
                          <ExternalLink className="w-3 h-3 opacity-80 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                      ) : <div />}

                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(milestone.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isCompleted
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-50 hover:bg-emerald-100 text-[#0F5244]"
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
