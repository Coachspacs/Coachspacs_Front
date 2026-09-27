"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Play,
  Award,
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
} from "lucide-react";
import { GeneratedRoadmap, RoadmapMilestone, MyPathPreferences } from "@/types/mypath";
import { soundFx } from "@/lib/soundEffects";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";

interface InteractiveCurriculumMapProps {
  roadmap: GeneratedRoadmap;
  preferences: MyPathPreferences;
  isAr?: boolean;
  locale: string;
  onMilestoneToggle: (id: string) => void;
  onRegenerate: () => void;
  onEditPreferences: () => void;
}

interface WaypointNode {
  milestoneIndex: number;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
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
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // Active milestone index (first non-completed milestone)
  const activeMilestoneIndex = roadmap.milestones.findIndex((m) => m.status !== "completed");
  const currentActiveIndex = activeMilestoneIndex === -1 ? totalCount - 1 : activeMilestoneIndex;

  // Dynamic Waypoint coordinates generation (Handles 2, 3, 4, 5, etc. milestones smoothly)
  const waypoints: WaypointNode[] = useMemo(() => {
    if (totalCount === 0) return [];
    if (totalCount === 1) {
      return [{ milestoneIndex: 0, xPercent: 50, yPercent: 50 }];
    }

    return roadmap.milestones.map((_, idx) => {
      // Alternate left (~26%) and right (~74%)
      const isEven = idx % 2 === 0;
      const xPercent = isEven ? 26 : 74;
      // Even vertical distribution between 14% and 86%
      const yPercent = 14 + (idx / (totalCount - 1)) * 72;

      return {
        milestoneIndex: idx,
        xPercent,
        yPercent,
      };
    });
  }, [roadmap.milestones, totalCount]);

  // Dynamic smooth S-Curve SVG road path connecting all waypoints
  const svgRoadPath = useMemo(() => {
    if (waypoints.length < 2) return "";

    const points = waypoints.map((wp) => ({
      x: (wp.xPercent / 100) * 800,
      y: (wp.yPercent / 100) * 1000,
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midY = (p1.y + p2.y) / 2;
      d += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [waypoints]);

  const activeWaypoint = waypoints[currentActiveIndex] || waypoints[0];

  const triggerCelebration = () => {
    try {
      soundFx.playCelebration();
      confetti({
        particleCount: 110,
        spread: 85,
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

  const handleShare = () => {
    try {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      }
    } catch {}
  };

  // Human readable track title
  const getTrackName = () => {
    if (preferences.customTrackName) return preferences.customTrackName;
    switch (preferences.track) {
      case "uiux":
        return isAr ? "تصميم واجهات وتجربة المستخدم (UI/UX)" : "UI/UX Product Design";
      case "frontend":
        return isAr ? "تطوير واجهات المستخدم (Frontend Development)" : "Frontend Web Engineering";
      case "backend":
        return isAr ? "تطوير البنية الخلفية والسحابية (Backend)" : "Backend & Cloud Architecture";
      case "fullstack":
        return isAr ? "التطوير الشامل المتكامل (Full-Stack)" : "Full-Stack Web Development";
      case "ai":
        return isAr ? "الذكاء الاصطناعي وتعلّم الآلة (AI & ML)" : "Artificial Intelligence & ML";
      case "data":
        return isAr ? "علم وهندسة البيانات (Data Science)" : "Data Science & Analytics";
      case "mobile":
        return isAr ? "تطوير تطبيقات الموبايل (Mobile Apps)" : "Cross-Platform Mobile Apps";
      case "cloud":
        return isAr ? "الحوسبة السحابية وDevOps" : "Cloud Engineering & DevOps";
      default:
        return isAr ? "المسار التقني المتخصص" : "Specialized Tech Roadmap";
    }
  };

  // Dynamic proportional height calculated from number of milestones
  const dynamicMinHeight = Math.max(420, totalCount * 190);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-4 relative z-10 text-start w-full max-w-6xl mx-auto pb-10">
      {/* ========================================================================= */}
      {/* 1. COMPACT & SLEEK HEADER PASSPORT (WIDE & LOW-PROFILE) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#0F5244] via-[#0D4438] to-[#073027] text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-lg border border-emerald-600/40 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
          {/* Left / Title & Info */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-emerald-200">
                <Compass className="w-3 h-3 text-[#38E09D]" />
                <span>{isAr ? "خريطة المسار الذكية" : "Dynamic Curriculum Map"}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#38E09D] border border-emerald-400/30 text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-[#38E09D]" />
                <span>{isAr ? `${totalCount} محطات مخصصة` : `${totalCount} Milestones`}</span>
              </span>
            </div>

            <h1 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight">
              {getTrackName()}
            </h1>
          </div>

          {/* Right / Hours, Duration Stats & Sound Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="bg-black/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/15 flex items-center gap-3 sm:gap-4">
              <div className="text-start">
                <span className="text-[9px] font-bold text-emerald-300 block leading-tight">
                  {isAr ? "الالتزام" : "Hours"}
                </span>
                <span className="text-[11px] font-black text-white">
                  {preferences.hoursPerWeek} {isAr ? "س/أسب" : "h/w"}
                </span>
              </div>

              <div className="w-px h-6 bg-white/15" />

              <div className="text-start">
                <span className="text-[9px] font-bold text-emerald-300 block leading-tight">
                  {isAr ? "المدة" : "Duration"}
                </span>
                <span className="text-[11px] font-black text-white">
                  {Math.max(1, Math.round(roadmap.estimatedWeeks / 4))} {isAr ? "أشهر" : "mos"}
                </span>
              </div>

              <div className="w-px h-6 bg-white/15" />

              {/* Audio Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 transition-all cursor-pointer border border-white/10"
                title={soundOn ? (isAr ? "كتم الصوت" : "Mute") : (isAr ? "تشغيل الصوت" : "Unmute")}
              >
                {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#38E09D]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls & Progress Bar */}
        <div className="pt-2.5 mt-2.5 border-t border-white/10 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 font-medium text-emerald-200/90">
              <span className="font-black text-white">{progressPercent}%</span>
              <span>•</span>
              <span>{isAr ? `${completedCount} من أصل ${totalCount} محطات مكتملة` : `${completedCount}/${totalCount} completed`}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-white transition-all cursor-pointer text-[11px]"
              >
                <Share2 className="w-3 h-3 text-[#38E09D]" />
                <span>{copiedToast ? (isAr ? "تم!" : "Copied!") : isAr ? "مشاركة" : "Share"}</span>
              </button>
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-white transition-all cursor-pointer text-[11px]"
              >
                <RotateCcw className="w-3 h-3 text-[#38E09D]" />
                <span>{isAr ? "إعادة بناء" : "Regenerate"}</span>
              </button>
              <button
                type="button"
                onClick={onEditPreferences}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-white transition-all cursor-pointer text-[11px]"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#38E09D]" />
                <span>{isAr ? "التفضيلات" : "Preferences"}</span>
              </button>
            </div>
          </div>

          <div className="w-full h-1.5 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-400 to-[#38E09D] rounded-full shadow-md"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC ROADMAP CANVAS (HANDLES 2, 3, 4, 5+ MILESTONES DYNAMICALLY) */}
      {/* ========================================================================= */}
      <div
        className="relative rounded-3xl bg-gradient-to-b from-[#E8F8F2] via-[#F0FAF6] to-[#E6F5EF] border-2 border-emerald-300/80 shadow-lg overflow-hidden select-none"
        style={{ minHeight: `${dynamicMinHeight}px` }}
      >
        {/* Terrain Pattern Background */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#0F5244 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Dynamic SVG Winding Road Path */}
        {svgRoadPath && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 1000"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="questRoadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="35%" stopColor="#0F5244" />
                <stop offset="70%" stopColor="#059669" />
                <stop offset="100%" stopColor="#0F5244" />
              </linearGradient>
              <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Road Base Underlayer */}
            <path
              d={svgRoadPath}
              stroke="#C6EBDC"
              strokeWidth="38"
              strokeLinecap="round"
              fill="none"
            />

            {/* Stepping Path Border */}
            <path
              d={svgRoadPath}
              stroke="#95DBC0"
              strokeWidth="24"
              strokeLinecap="round"
              fill="none"
            />

            {/* Center Glowing Pulse Line */}
            <path
              d={svgRoadPath}
              stroke="url(#questRoadGrad)"
              strokeWidth="6"
              strokeDasharray="10 8"
              strokeLinecap="round"
              fill="none"
              filter="url(#roadGlow)"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* ========================================================================= */}
        {/* DYNAMIC CHECKPOINTS WITH DIRECTLY ATTACHED COMPACT COURSE BOXES */}
        {/* ========================================================================= */}
        {waypoints.map((wp, idx) => {
          const milestone = roadmap.milestones[wp.milestoneIndex];
          if (!milestone) return null;

          const isCompleted = milestone.status === "completed";
          const isActive = !isCompleted && wp.milestoneIndex === currentActiveIndex;
          const isCapstone = idx === waypoints.length - 1;
          const firstCourse = milestone.courses && milestone.courses.length > 0 ? milestone.courses[0] : null;
          const isLeft = wp.xPercent < 50;

          return (
            <div
              key={milestone.id}
              className="absolute z-20"
              style={{
                top: `${wp.yPercent}%`,
                left: `${wp.xPercent}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Checkpoint Node + Attached Compact Course Box (facing inward toward map center) */}
              <div
                className={`relative flex items-center gap-2.5 sm:gap-4 ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* 1. The 3D Checkpoint Stone Button */}
                <div className="flex flex-col items-center shrink-0">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleToggleCompleted(milestone.id)}
                    className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center font-black shadow-lg transition-all cursor-pointer relative ${
                      isCompleted
                        ? "bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white border-3 border-emerald-200 shadow-emerald-700/30"
                        : isActive
                        ? "bg-gradient-to-tr from-[#0F5244] to-[#1a7763] text-white border-3 border-[#38E09D] shadow-emerald-950/40 ring-4 ring-emerald-300/40"
                        : isCapstone
                        ? "bg-gradient-to-tr from-[#0F5244] to-[#1a7763] text-white border-3 border-emerald-300 shadow-emerald-700/30"
                        : "bg-white text-slate-700 border-3 border-slate-200 shadow-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
                    ) : isCapstone ? (
                      <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-[#38E09D]" />
                    ) : (
                      <>
                        <span className="text-base sm:text-xl font-mono leading-none">{idx + 1}</span>
                        <span className="text-[9px] font-bold opacity-80 mt-0.5">{isAr ? "محطة" : "LVL"}</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* 2. The Attached Compact Course Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -2 }}
                  className={`w-52 sm:w-64 rounded-2xl p-3 sm:p-3.5 border transition-all duration-200 shadow-md ${
                    isCompleted
                      ? "bg-emerald-50/95 border-emerald-300 text-emerald-950"
                      : isActive
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-lg"
                      : "bg-white/95 border-slate-200/90 text-slate-800"
                  }`}
                >
                  {/* Top Station Badge & Status */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                      {isAr ? `المحطة ${idx + 1}` : `Stage ${idx + 1}`}
                    </span>

                    {isCompleted ? (
                      <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{isAr ? "مكتملة" : "Done"}</span>
                      </span>
                    ) : isActive ? (
                      <span className="text-[10px] font-bold text-[#0F5244] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{isAr ? "الحالية" : "Active"}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{isAr ? "قادمة" : "Next"}</span>
                      </span>
                    )}
                  </div>

                  {/* Course Name & Brief 2-Line Summary */}
                  <div className="pt-2 space-y-1 text-start">
                    <div className="flex items-start gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#0F5244] shrink-0 mt-0.5" />
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1">
                        {firstCourse
                          ? isAr
                            ? firstCourse.titleAr
                            : firstCourse.title
                          : isAr
                          ? milestone.titleAr
                          : milestone.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2">
                      {isAr ? milestone.descriptionAr : milestone.description}
                    </p>
                  </div>

                  {/* Bottom Actions: Start Button + Done Toggle */}
                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {firstCourse ? (
                      <Link
                        href={`/${locale}/courses/${firstCourse.slug || firstCourse.id || "uiux-design"}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F5244] hover:bg-[#07382E] text-white text-[10px] font-bold transition-colors cursor-pointer shadow-2xs group"
                      >
                        <Play className="w-2.5 h-2.5 fill-current text-[#38E09D]" />
                        <span>{isAr ? "فتح الدورة" : "Start"}</span>
                        <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {milestone.durationWeeks * 3} {isAr ? "ساعة" : "hrs"}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleCompleted(milestone.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        isCompleted
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-[#0F5244]"
                      }`}
                    >
                      {isCompleted ? (isAr ? "تراجع" : "Undo") : isAr ? "إنجاز ✓" : "Done ✓"}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })}

        {/* Animated Robot Navigator Floating above Current Active Waypoint */}
        {activeWaypoint && (
          <motion.div
            animate={{
              x: `${activeWaypoint.xPercent}%`,
              y: `${activeWaypoint.yPercent}%`,
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-[150%]"
            style={{ top: 0, left: 0 }}
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-[#0F5244] text-white px-2.5 py-1 rounded-xl text-[10px] font-black shadow-lg mb-1 whitespace-nowrap border border-[#38E09D]/40">
                {isAr ? "المحطة التالية هنا! 🚀" : "Next Quest Here! 🚀"}
              </div>
              <div className="w-12 h-3.5 bg-emerald-500/25 rounded-full blur-sm absolute bottom-0" />
              <AnimatedRobotCharacter size="sm" />
            </div>
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. CAPSTONE GRADUATION CERTIFICATE BANNER */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-300 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm text-start"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0F5244] text-[#38E09D] flex items-center justify-center shrink-0 shadow-md">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
              {isAr ? "الاعتماد المهني وشهادة التخرج" : "Verified Credential"}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {isAr ? "شهادة إتمام المسار المعتمدة رسمياً" : "Certified Track Completion Credential"}
            </h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed max-w-xl">
              {isAr
                ? "تتضمن شهادتك رمز QR مشفر للتحقق الفوري مع اعتماد جميع المشاريع المنجزة لسيرتك الذاتية."
                : "Earn a shareable, verifiable certificate with unique QR verification and accredited portfolio projects."}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/certificates/verify`}
          className="px-5 py-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer hover:shadow-lg"
        >
          <Award className="w-4 h-4 text-[#38E09D]" />
          <span>{isAr ? "معاينة نموذج الشهادة" : "Preview Certificate"}</span>
        </Link>
      </motion.div>
    </div>
  );
}

export default InteractiveCurriculumMap;
