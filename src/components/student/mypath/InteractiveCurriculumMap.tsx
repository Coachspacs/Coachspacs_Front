"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Lock,
  BookOpen,
  Compass,
  Trophy,
  SkipForward,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Flag,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  GripVertical,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  GeneratedRoadmap,
  RoadmapMilestone,
  MyPathPreferences,
} from "@/types/mypath";
import { soundFx } from "@/lib/soundEffects";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";

interface InteractiveCurriculumMapProps {
  roadmap: GeneratedRoadmap;
  preferences: MyPathPreferences;
  isAr?: boolean;
  locale: string;
  onMilestoneToggle: (id: string) => void;
  onRegenerate: () => void;
  onEditPreferences?: () => void;
  onReorderMilestones?: (newMilestones: RoadmapMilestone[]) => void;
}

interface WaypointNode {
  milestoneIndex: number;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
}

interface MilestoneCardViewProps {
  milestone: RoadmapMilestone;
  idx: number;
  isExpanded: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  isActive: boolean;
  isEnrolled: boolean;
  firstCourse: any;
  courseTitle: string;
  courseDesc: string;
  isAr: boolean;
  locale: string;
  onToggleExpand: () => void;
  onToggleCompleted: () => void;
  onToggleSkip: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isMobile?: boolean;
}

function MilestoneCardView({
  milestone,
  idx,
  isExpanded,
  isCompleted,
  isSkipped,
  isActive,
  isEnrolled,
  firstCourse,
  courseTitle,
  courseDesc,
  isAr,
  locale,
  onToggleExpand,
  onToggleCompleted,
  onToggleSkip,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isMobile = false,
}: MilestoneCardViewProps) {
  return (
    <AnimatePresence mode="wait">
      {isExpanded ? (
        /* ------------------------------------------------------------- */
        /* A) EXPANDED STATE (Detailed View with AI Reason & Purchase) */
        /* ------------------------------------------------------------- */
        <motion.div
          key={`expanded-${milestone.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={`${
            isMobile ? "w-full" : "w-64 sm:w-80"
          } rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${
            isCompleted
              ? "bg-emerald-50/95 border-emerald-300/80 text-emerald-950 shadow-[0_12px_32px_-4px_rgba(16,185,129,0.18)]"
              : isActive
                ? "bg-white border-emerald-500/90 ring-2 ring-emerald-500/25 text-slate-900 shadow-[0_18px_42px_-6px_rgba(15,82,68,0.22),0_6px_16px_-3px_rgba(16,185,129,0.15)]"
                : "bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_12px_32px_-4px_rgba(15,82,68,0.10),0_4px_12px_-2px_rgba(0,0,0,0.04)]"
          }`}
        >
          {/* Top Bar: Station Badge + Status Badge + Collapse Action */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                {isAr ? `المحطة ${idx + 1}` : `Stage ${idx + 1}`}
              </span>

              {/* Enrollment status badge */}
              {isEnrolled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <Check className="w-2.5 h-2.5" />
                  <span>{isAr ? "مسجل" : "Enrolled"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold border border-amber-200/70">
                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                  <span>{isAr ? "متاحة للشراء" : "Purchase Req."}</span>
                </span>
              )}
            </div>

            {/* Status / Collapse button */}
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={isAr ? "طي التفاصيل" : "Collapse"}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Course Title & Description */}
          <div className="pt-2.5 space-y-1.5 text-start">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-[#0F5244] shrink-0 mt-0.5" />
              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                {courseTitle}
              </h4>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {courseDesc}
            </p>
          </div>

          {/* Bottom Actions: Play/Buy CTA + Done Toggle */}
          <div className="pt-3 mt-2.5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {firstCourse &&
                (isEnrolled ? (
                  <Link
                    href={`/${locale}/student/learn/${firstCourse.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0F5244] to-[#146654] hover:from-[#09352C] hover:to-[#0F5244] text-white text-xs font-black shadow-[0_4px_12px_rgba(15,82,68,0.25)] active:scale-95 transition-all group cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current text-[#38E09D] group-hover:scale-110 transition-transform" />
                    <span>{isAr ? "ابدأ التعلّم" : "Start Learning"}</span>
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/courses/${firstCourse.slug || firstCourse.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0F5244] to-[#146654] hover:from-[#09352C] hover:to-[#0F5244] text-white text-xs font-black shadow-[0_4px_12px_rgba(15,82,68,0.25)] active:scale-95 transition-all group cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3 text-[#38E09D]" />
                    <span>
                      {isAr ? "شراء الدورة والتسجيل" : "Enroll & Purchase"}
                    </span>
                  </Link>
                ))}

              <button
                type="button"
                onClick={onToggleCompleted}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                  isCompleted
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                    : "bg-emerald-50 hover:bg-emerald-100 text-[#0F5244] border border-emerald-200/60"
                }`}
              >
                {isCompleted
                  ? isAr
                    ? "تراجع"
                    : "Undo"
                  : isAr
                    ? "إنجاز"
                    : "Done"}
              </button>
            </div>

            {/* Skip & Reorder Controls */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/80 text-[10px] text-slate-500">
              <button
                type="button"
                onClick={onToggleSkip}
                className="inline-flex items-center gap-1 hover:text-amber-700 font-bold transition-colors cursor-pointer"
              >
                <SkipForward className="w-3 h-3" />
                <span>
                  {isSkipped
                    ? isAr
                      ? "إلغاء التخطي"
                      : "Unskip"
                    : isAr
                      ? "تخطي هذه المحطة"
                      : "Skip Step"}
                </span>
              </button>

              {/* Step Reorder Controls (Up / Down) */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400">
                  {isAr ? "الترتيب:" : "Reorder:"}
                </span>
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.();
                  }}
                  title={isAr ? "تقديم المحطة للأعلى" : "Move stage up"}
                  className={`p-1 rounded-md border text-xs font-bold transition-all ${
                    canMoveUp
                      ? "bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border-slate-200 cursor-pointer"
                      : "opacity-30 border-transparent text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.();
                  }}
                  title={isAr ? "تأخير المحطة للأسفل" : "Move stage down"}
                  className={`p-1 rounded-md border text-xs font-bold transition-all ${
                    canMoveDown
                      ? "bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border-slate-200 cursor-pointer"
                      : "opacity-30 border-transparent text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <ArrowDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ------------------------------------------------------------- */
        /* B) COMPACT / COLLAPSED STATE (Clean, balanced and elegant)   */
        /* ------------------------------------------------------------- */
        <motion.div
          key={`compact-${milestone.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.02 }}
          onClick={onToggleExpand}
          className={`${
            isMobile ? "w-full" : "w-56 sm:w-68"
          } rounded-2xl px-4 py-3 border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group/compact ${
            isCompleted
              ? "bg-emerald-50/90 border-emerald-200/80 text-emerald-950"
              : isSkipped
                ? "bg-slate-100/90 border-slate-200 text-slate-500 opacity-75"
                : isActive
                  ? "bg-white border-emerald-500/80 ring-2 ring-emerald-500/20 text-slate-900 shadow-md"
                  : "bg-white/95 border-slate-200/90 hover:border-emerald-300 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100/70">
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {isAr ? `المحطة ${idx + 1}` : `Stage ${idx + 1}`}
            </span>

            {isCompleted ? (
              <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                <span>{isAr ? "مكتملة" : "Done"}</span>
              </span>
            ) : isSkipped ? (
              <span className="text-[10px] font-bold text-slate-400">
                {isAr ? "تم التخطي" : "Skipped"}
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

          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover/compact:text-[#0F5244] transition-colors">
                {courseTitle}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {milestone.durationWeeks}{" "}
                {isAr ? "أسابيع دراسية" : "weeks of study"}
              </p>
            </div>
            <div className="p-1 rounded-lg bg-slate-100 group-hover/compact:bg-emerald-100 group-hover/compact:text-emerald-800 text-slate-400 transition-colors shrink-0">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function InteractiveCurriculumMap({
  roadmap,
  preferences,
  isAr = false,
  locale,
  onMilestoneToggle,
  onRegenerate,
  onEditPreferences,
  onReorderMilestones,
}: InteractiveCurriculumMapProps) {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // Local milestones state to support real-time skipping, completion & reordering
  const [milestonesState, setMilestonesState] = useState<RoadmapMilestone[]>(
    roadmap.milestones,
  );

  useEffect(() => {
    setMilestonesState(roadmap.milestones);
  }, [roadmap.milestones]);

  // Reordering milestone logic
  const handleMoveMilestone = (index: number, direction: "up" | "down") => {
    let updated: RoadmapMilestone[] | null = null;
    if (direction === "up" && index > 0) {
      updated = [...milestonesState];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === "down" && index < milestonesState.length - 1) {
      updated = [...milestonesState];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }

    if (updated) {
      setMilestonesState(updated);

      // Auto-expand the milestone that is NOW at Stage 1 / active stage
      const firstActive = updated.find(
        (m) => m.status !== "completed" && m.status !== "skipped",
      );
      const targetToExpand = firstActive ? firstActive.id : updated[0]?.id;
      if (targetToExpand) {
        setExpandedMilestoneId(targetToExpand);
      }

      // Persist the new order in localStorage and notify parent
      try {
        const updatedRoadmap = { ...roadmap, milestones: updated };
        localStorage.setItem(
          "coachspace_student_roadmap",
          JSON.stringify(updatedRoadmap),
        );
      } catch {}

      onReorderMilestones?.(updated);

      if (soundOn) soundFx.playOptionSelect();
    }
  };

  // Drag & Drop Reorder Handler
  const handleReorderGroup = (newOrder: RoadmapMilestone[]) => {
    setMilestonesState(newOrder);

    // Auto-expand the milestone that is NOW at Stage 1 / active stage
    const firstActive = newOrder.find(
      (m) => m.status !== "completed" && m.status !== "skipped",
    );
    const targetToExpand = firstActive ? firstActive.id : newOrder[0]?.id;
    if (targetToExpand) {
      setExpandedMilestoneId(targetToExpand);
    }

    // Persist the new order in localStorage and notify parent
    try {
      const updatedRoadmap = { ...roadmap, milestones: newOrder };
      localStorage.setItem(
        "coachspace_student_roadmap",
        JSON.stringify(updatedRoadmap),
      );
    } catch {}

    onReorderMilestones?.(newOrder);
  };

  // Enrolled courses detection from storage/session (Purchase requirement)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("coachspace_enrolled_courses");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const ids = parsed.map((c: any) =>
            String(c.id || c.course_id || c.slug || "").toLowerCase(),
          );
          setEnrolledCourseIds(ids);
        }
      }
    } catch {}
  }, []);

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

  const totalCount = milestonesState.length;
  const completedCount = milestonesState.filter(
    (m) => m.status === "completed",
  ).length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Active milestone index (first non-completed and non-skipped milestone)
  const activeMilestoneIndex = milestonesState.findIndex(
    (m) => m.status !== "completed" && m.status !== "skipped",
  );
  const currentActiveIndex =
    activeMilestoneIndex === -1 ? totalCount - 1 : activeMilestoneIndex;

  // Accordion state: ONLY the active lesson is expanded by default, others collapsed
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(
    () => {
      const activeM = milestonesState[currentActiveIndex];
      return activeM ? activeM.id : milestonesState[0]?.id || null;
    },
  );

  // Skip milestone handler
  const handleToggleSkip = (milestoneId: string) => {
    const updated = milestonesState.map((m) => {
      if (m.id === milestoneId) {
        const newStatus = m.status === "skipped" ? "planned" : "skipped";
        return { ...m, status: newStatus as any };
      }
      return m;
    });
    setMilestonesState(updated);

    try {
      const updatedRoadmap = { ...roadmap, milestones: updated };
      localStorage.setItem(
        "coachspace_student_roadmap",
        JSON.stringify(updatedRoadmap),
      );
    } catch {}

    onReorderMilestones?.(updated);

    if (soundOn) soundFx.playOptionSelect();
  };

  // Dynamic Waypoint coordinates generation with generous top and bottom margins
  const waypoints: WaypointNode[] = useMemo(() => {
    if (totalCount === 0) return [];
    if (totalCount === 1) {
      return [{ milestoneIndex: 0, xPercent: 50, yPercent: 50 }];
    }

    const startY = 22; // Well-spaced clearance below Roadmap Start Line
    const endY = 80; // Well-spaced clearance above Goal Marker

    return milestonesState.map((_, idx) => {
      // Alternate left (~25%) and right (~75%)
      const isEven = idx % 2 === 0;
      const xPercent = isEven ? 25 : 75;
      const yPercent =
        totalCount <= 1
          ? 50
          : startY + (idx / (totalCount - 1)) * (endY - startY);

      return {
        milestoneIndex: idx,
        xPercent,
        yPercent,
      };
    });
  }, [milestonesState, totalCount]);

  // Dynamic ultra-smooth S-Curve SVG road path connecting start pin, all waypoints, and end goal
  const svgRoadPath = useMemo(() => {
    if (waypoints.length === 0) return "";

    const points = waypoints.map((wp) => ({
      x: (wp.xPercent / 100) * 800,
      y: (wp.yPercent / 100) * 1000,
    }));

    // Start line origin coordinate in SVG viewBox (center top)
    const startOrigin = { x: 400, y: 45 };
    // End goal coordinate in SVG viewBox (center bottom)
    const endTarget = { x: 400, y: 955 };

    // Full sequence from Start Line -> all Checkpoint waypoints -> Finish Goal
    const allNodes = [startOrigin, ...points, endTarget];

    let d = `M ${allNodes[0].x} ${allNodes[0].y}`;
    for (let i = 0; i < allNodes.length - 1; i++) {
      const p1 = allNodes[i];
      const p2 = allNodes[i + 1];
      const dy = p2.y - p1.y;
      // Smooth natural cubic bezier S-curve with vertical departure and arrival tangents
      const cp1x = p1.x;
      const cp1y = p1.y + dy * 0.5;
      const cp2x = p2.x;
      const cp2y = p2.y - dy * 0.5;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
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
    const target = milestonesState.find((m) => m.id === milestoneId);
    if (target && target.status !== "completed") {
      triggerCelebration();
    } else {
      soundFx.playOptionSelect();
    }
    onMilestoneToggle(milestoneId);
  };

  // Human readable track title
  const getTrackName = () => {
    if (preferences.customTrackName) return preferences.customTrackName;
    switch (preferences.track) {
      case "uiux":
        return isAr
          ? "تصميم واجهات وتجربة المستخدم (UI/UX)"
          : "UI/UX Product Design";
      case "frontend":
        return isAr
          ? "تطوير واجهات المستخدم (Frontend Development)"
          : "Frontend Web Engineering";
      case "backend":
        return isAr
          ? "تطوير البنية الخلفية والسحابية (Backend)"
          : "Backend & Cloud Architecture";
      case "fullstack":
        return isAr
          ? "التطوير الشامل المتكامل (Full-Stack)"
          : "Full-Stack Web Development";
      case "ai":
        return isAr
          ? "الذكاء الاصطناعي وتعلّم الآلة (AI & ML)"
          : "Artificial Intelligence & ML";
      case "data":
        return isAr
          ? "علم وهندسة البيانات (Data Science)"
          : "Data Science & Analytics";
      case "mobile":
        return isAr
          ? "تطوير تطبيقات الموبايل (Mobile Apps)"
          : "Cross-Platform Mobile Apps";
      case "cloud":
        return isAr ? "الحوسبة السحابية وDevOps" : "Cloud Engineering & DevOps";
      default:
        return isAr ? "المسار التقني المتخصص" : "Specialized Tech Roadmap";
    }
  };

  // Dynamic responsive height: adapts cleanly when cards are collapsed vs expanded
  const isAnyExpanded = Boolean(expandedMilestoneId);
  const dynamicMinHeight = Math.max(
    800,
    totalCount * (isAnyExpanded ? 270 : 190),
  );

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="space-y-6 relative z-10 text-start w-full max-w-6xl mx-auto pb-4"
    >
      {/* ========================================================================= */}
      {/* 1. PATH HEADER (RICH GRADIENT + PATTERN + FULL ACTION CONTROLS)           */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#0c473a] via-[#0F5244] to-[#072a22] text-white rounded-3xl p-4 sm:p-6 shadow-[0_14px_36px_-6px_rgba(15,82,68,0.35)] border border-emerald-500/30 relative overflow-hidden">
        {/* Subtle geometric dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, #38E09D 1.5px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />

        {/* Ambient atmospheric glow orbs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          {/* Left / Title & Info Badges */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-100 shadow-xs">
                <Compass className="w-3.5 h-3.5 text-[#38E09D]" />
                <span>
                  {isAr ? "خريطة المسار الذكية" : "Dynamic Curriculum Map"}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#38E09D] border border-emerald-400/35 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#38E09D]" />
                <span>
                  {isAr
                    ? `${totalCount} محطات دراسية`
                    : `${totalCount} Milestones`}
                </span>
              </span>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
              {getTrackName()}
            </h1>
          </div>

          {/* Right / Header Meta Badges & Sound Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <button
              type="button"
              onClick={toggleSound}
              title={
                soundOn
                  ? isAr
                    ? "كتم المؤثرات الصوتية"
                    : "Mute sound"
                  : isAr
                    ? "تشغيل المؤثرات الصوتية"
                    : "Unmute sound"
              }
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-100 transition-colors cursor-pointer"
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-[#38E09D]" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>
        </div>

        {/* Action Controls & Prominent Glowing Progress Bar */}
        <div className="pt-3.5 mt-3.5 border-t border-white/15 space-y-3 relative z-10">
          <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
            {/* Progress Counter */}
            <div className="flex items-center gap-2 font-medium text-emerald-100">
              <span className="font-black text-white text-sm">
                {progressPercent}%
              </span>
              <span className="text-white/40">•</span>
              <span className="font-semibold text-emerald-200/90">
                {isAr
                  ? `${completedCount} من أصل ${totalCount} محطات مكتملة`
                  : `${completedCount}/${totalCount} milestones completed`}
              </span>
            </div>

            {/* ACTION BUTTONS GROUP */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Reorder Steps Modal Button */}
              <button
                type="button"
                onClick={() => {
                  setIsReorderModalOpen(true);
                  if (soundOn) soundFx.playOptionSelect();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/20 hover:border-white/40 active:scale-95 cursor-pointer text-xs"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#38E09D]" />
                <span>{isAr ? "إعادة ترتيب الخطوات" : "Reorder Steps"}</span>
              </button>

              {/* PRIMARY ACTION BUTTON: Regenerate */}
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0F5244] font-black transition-all shadow-[0_2px_10px_rgba(255,255,255,0.2)] hover:shadow-md active:scale-95 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0F5244]" />
                <span>{isAr ? "إعادة توليد المسار" : "Regenerate Path"}</span>
              </button>
            </div>
          </div>

          {/* Prominent, Bold Gradient Progress Bar with Glow */}
          <div className="w-full h-2.5 sm:h-3 bg-black/35 rounded-full overflow-hidden p-0.5 border border-white/15 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 via-[#38E09D] to-[#45D1B4] rounded-full shadow-[0_0_14px_rgba(56,224,157,0.65)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2A. MOBILE ROADMAP TIMELINE (PERFECT ON ALL PHONES, BLOCK MD:HIDDEN)       */}
      {/* ========================================================================= */}
      <div className="block md:hidden relative rounded-3xl bg-gradient-to-b from-[#EBF7F2] via-[#F2FAF6] to-[#E5F5EE] border-2 border-emerald-300/80 shadow-[0_12px_36px_-6px_rgba(15,82,68,0.12)] p-4 overflow-hidden select-none">
        {/* Soft Grid Terrain Background */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#0F5244 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Roadmap Start Line Header */}
        <div className="flex justify-center pb-5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-600/25 text-emerald-800 text-xs font-bold shadow-xs backdrop-blur-xs">
            <Flag className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? "نقطة انطلاق المسار" : "Roadmap Start Line"}</span>
          </div>
        </div>

        {/* Vertical Stepped Timeline List */}
        <div className="relative z-10 space-y-4">
          {/* Continuous Glowing Vertical Track behind the Nodes */}
          <div
            className={`absolute top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-emerald-400 via-[#38E09D] to-teal-600 shadow-[0_0_10px_rgba(56,224,157,0.5)] ${
              isAr ? "right-5" : "left-5"
            }`}
          />

          {milestonesState.map((milestone, idx) => {
            const isCompleted = milestone.status === "completed";
            const isSkipped = milestone.status === "skipped";
            const isActive =
              !isCompleted &&
              !isSkipped &&
              idx === currentActiveIndex;
            const isCapstone = idx === milestonesState.length - 1;
            const firstCourse =
              milestone.courses && milestone.courses.length > 0
                ? milestone.courses[0]
                : null;

            const isEnrolled =
              firstCourse?.isEnrolled ||
              (firstCourse &&
                enrolledCourseIds.some(
                  (enrolledId) =>
                    enrolledId === String(firstCourse.id).toLowerCase() ||
                    enrolledId === String(firstCourse.slug || "").toLowerCase(),
                ));

            const isExpanded = expandedMilestoneId === milestone.id;

            const courseTitle = firstCourse
              ? isAr
                ? firstCourse.titleAr
                : firstCourse.title
              : isAr
                ? milestone.titleAr
                : milestone.title;

            const courseDesc = isAr
              ? milestone.descriptionAr
              : milestone.description;

            return (
              <div key={milestone.id} className="relative flex items-start gap-3">
                {/* Checkpoint Node Button */}
                <div className="relative z-10 shrink-0 flex flex-col items-center">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setExpandedMilestoneId(isExpanded ? null : milestone.id)
                    }
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-black transition-all cursor-pointer relative shadow-md ${
                      isCompleted
                        ? "bg-gradient-to-tr from-emerald-600 to-[#0F5244] text-white border-2 border-emerald-200 shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
                        : isSkipped
                          ? "bg-slate-200 text-slate-500 border-2 border-slate-300"
                          : isActive
                            ? "bg-gradient-to-tr from-[#0F5244] via-[#146654] to-[#1E8A73] text-white border-2 border-[#38E09D] ring-4 ring-emerald-400/40 shadow-lg"
                            : isCapstone
                              ? "bg-gradient-to-tr from-[#0F5244] to-[#1a7763] text-[#38E09D] border-2 border-[#38E09D]"
                              : "bg-gradient-to-br from-[#E6F7F0] via-[#D1FAE5] to-[#B8F0DA] text-[#0F5244] border-2 border-emerald-400/70"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3] text-white" />
                    ) : isSkipped ? (
                      <SkipForward className="w-4 h-4 text-slate-400" />
                    ) : isCapstone ? (
                      <Trophy className="w-5 h-5 text-[#38E09D]" />
                    ) : isActive ? (
                      <>
                        <span className="text-xs font-mono font-black leading-none">
                          0{idx + 1}
                        </span>
                        <span className="text-[8px] font-black uppercase text-[#38E09D] tracking-wider mt-0.5">
                          {isAr ? "نشطة" : "LIVE"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-mono font-black leading-none text-[#0F5244]">
                          0{idx + 1}
                        </span>
                        <span className="text-[8px] font-bold text-emerald-800/80 uppercase tracking-wider mt-0.5">
                          {isAr ? "محطة" : "LVL"}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Milestone Card View (Full Width) */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Floating active mascot badge on active milestone */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-100/90 to-teal-50 px-3 py-1 rounded-xl border border-emerald-300/70 shadow-2xs"
                    >
                      <div className="shrink-0 origin-center">
                        <AnimatedRobotCharacter size="sm" showCap={true} />
                      </div>
                      <span className="text-[11px] font-black text-emerald-900">
                        {isAr
                          ? "أنت هنا الآن! تابع تقدمك في هذه المحطة"
                          : "You are here! Keep making progress"}
                      </span>
                    </motion.div>
                  )}

                  <MilestoneCardView
                    milestone={milestone}
                    idx={idx}
                    isExpanded={isExpanded}
                    isCompleted={isCompleted}
                    isSkipped={isSkipped}
                    isActive={isActive}
                    isEnrolled={Boolean(isEnrolled)}
                    firstCourse={firstCourse}
                    courseTitle={courseTitle}
                    courseDesc={courseDesc}
                    isAr={isAr}
                    locale={locale}
                    onToggleExpand={() =>
                      setExpandedMilestoneId(isExpanded ? null : milestone.id)
                    }
                    onToggleCompleted={() => handleToggleCompleted(milestone.id)}
                    onToggleSkip={() => handleToggleSkip(milestone.id)}
                    onMoveUp={() => handleMoveMilestone(idx, "up")}
                    onMoveDown={() => handleMoveMilestone(idx, "down")}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < totalCount - 1}
                    isMobile={true}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Capstone Goal Marker at the bottom */}
        <div className="flex justify-center pt-5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0F5244]/95 text-white text-xs font-black shadow-md border border-[#38E09D]/40 backdrop-blur-xs">
            <Trophy className="w-3.5 h-3.5 text-[#38E09D]" />
            <span>
              {isAr
                ? "هدف المسار: الإتقان والجاهزية الوظيفية"
                : "Goal: Mastery & Career Readiness"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2B. DESKTOP DYNAMIC ROADMAP CANVAS (SPACIOUS 2D S-CURVE, HIDDEN MD:BLOCK) */}
      {/* ========================================================================= */}
      <div
        className="hidden md:block relative rounded-3xl bg-gradient-to-b from-[#EBF7F2] via-[#F2FAF6] to-[#E5F5EE] border-2 border-emerald-300/80 shadow-[0_12px_36px_-6px_rgba(15,82,68,0.12)] overflow-hidden select-none py-6"
        style={{ minHeight: `${dynamicMinHeight}px` }}
      >
        {/* Subtle Roadmap Origin Pin */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/90 border border-emerald-600/25 text-emerald-800 text-[11px] font-bold shadow-xs backdrop-blur-xs">
          <Flag className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {isAr ? "نقطة انطلاق المسار" : "Roadmap Start Line"}
          </span>
        </div>
        {/* Soft Grid Terrain Background */}
        <div
          className="absolute inset-0 opacity-[0.28] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#0F5244 1.2px, transparent 1.2px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Dynamic Luminous SVG Winding Road Path */}
        {svgRoadPath && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 1000"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="questRoadGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#38E09D" />
                <stop offset="30%" stopColor="#10B981" />
                <stop offset="65%" stopColor="#0F5244" />
                <stop offset="100%" stopColor="#38E09D" />
              </linearGradient>
              <linearGradient
                id="trackBedGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#C8EFE0" />
                <stop offset="50%" stopColor="#B3EAD6" />
                <stop offset="100%" stopColor="#C8EFE0" />
              </linearGradient>
              <filter
                id="neonRoadGlow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ambient River Underlayer */}
            <path
              d={svgRoadPath}
              stroke="rgba(16, 185, 129, 0.18)"
              strokeWidth="52"
              strokeLinecap="round"
              fill="none"
            />

            {/* Road Foundation Bed */}
            <path
              d={svgRoadPath}
              stroke="url(#trackBedGrad)"
              strokeWidth="36"
              strokeLinecap="round"
              fill="none"
            />

            {/* Inner Stepping Guide Track */}
            <path
              d={svgRoadPath}
              stroke="#8CE4C3"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
            />

            {/* High-Tech Glowing Centerline Pulse */}
            <path
              d={svgRoadPath}
              stroke="url(#questRoadGrad)"
              strokeWidth="6"
              strokeDasharray="12 10"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonRoadGlow)"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Checkpoint Nodes with Accordion Cards */}
        {waypoints.map((wp, idx) => {
          const milestone = milestonesState[wp.milestoneIndex];
          if (!milestone) return null;

          const isCompleted = milestone.status === "completed";
          const isSkipped = milestone.status === "skipped";
          const isActive =
            !isCompleted &&
            !isSkipped &&
            wp.milestoneIndex === currentActiveIndex;
          const isCapstone = idx === waypoints.length - 1;
          const firstCourse =
            milestone.courses && milestone.courses.length > 0
              ? milestone.courses[0]
              : null;
          const isLeft = wp.xPercent < 50;

          const isEnrolled =
            firstCourse?.isEnrolled ||
            (firstCourse &&
              enrolledCourseIds.some(
                (enrolledId) =>
                  enrolledId === String(firstCourse.id).toLowerCase() ||
                  enrolledId === String(firstCourse.slug || "").toLowerCase(),
              ));

          const isExpanded = expandedMilestoneId === milestone.id;

          const courseTitle = firstCourse
            ? isAr
              ? firstCourse.titleAr
              : firstCourse.title
            : isAr
              ? milestone.titleAr
              : milestone.title;

          const courseDesc = isAr
            ? milestone.descriptionAr
            : milestone.description;

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
              {/* Checkpoint Node + Attached Card (Facing inward) */}
              <div
                className={`relative flex items-center gap-3 sm:gap-4 ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* 1. Checkpoint Stone Button */}
                <div className="flex flex-col items-center shrink-0 relative">
                  {(isActive || (currentActiveIndex <= 0 && idx === 0)) && (
                    <div className="absolute -top-20 sm:-top-24 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center">
                      <AnimatedRobotCharacter size="sm" showCap={true} className="scale-125 sm:scale-135 origin-bottom" />
                    </div>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      setExpandedMilestoneId(isExpanded ? null : milestone.id);
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center font-black transition-all cursor-pointer relative shadow-lg ${
                      isCompleted
                        ? "bg-gradient-to-tr from-emerald-600 to-[#0F5244] text-white border-2 border-emerald-200 shadow-[0_8px_22px_rgba(16,185,129,0.38)] ring-4 ring-emerald-300/30"
                        : isSkipped
                          ? "bg-slate-200 text-slate-500 border-2 border-slate-300"
                          : isActive
                            ? "bg-gradient-to-tr from-[#0F5244] via-[#146654] to-[#1E8A73] text-white border-2 border-[#38E09D] shadow-[0_10px_28px_rgba(15,82,68,0.48)] ring-4 ring-emerald-400/40"
                            : isCapstone
                              ? "bg-gradient-to-tr from-[#0F5244] to-[#1a7763] text-[#38E09D] border-2 border-[#38E09D] shadow-[0_8px_24px_rgba(56,224,157,0.35)] ring-4 ring-emerald-300/30"
                              : "bg-gradient-to-br from-[#E6F7F0] via-[#D1FAE5] to-[#B8F0DA] text-[#0F5244] border-2 border-emerald-400/70 shadow-[0_8px_20px_rgba(15,82,68,0.12)] hover:border-emerald-500"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3] text-white drop-shadow-xs" />
                    ) : isSkipped ? (
                      <SkipForward className="w-5 h-5 text-slate-400" />
                    ) : isCapstone ? (
                      <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-[#38E09D] drop-shadow-xs" />
                    ) : isActive ? (
                      <>
                        <span className="text-base sm:text-lg font-mono font-black leading-none">
                          0{idx + 1}
                        </span>
                        <span className="text-[9px] font-black uppercase text-[#38E09D] tracking-wider mt-0.5">
                          {isAr ? "نشطة" : "LIVE"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-base sm:text-lg font-mono font-black leading-none text-[#0F5244]">
                          0{idx + 1}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800/80 uppercase tracking-wider mt-0.5">
                          {isAr ? "محطة" : "LVL"}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* 2. Attached Milestone Card View */}
                <MilestoneCardView
                  milestone={milestone}
                  idx={idx}
                  isExpanded={isExpanded}
                  isCompleted={isCompleted}
                  isSkipped={isSkipped}
                  isActive={isActive}
                  isEnrolled={Boolean(isEnrolled)}
                  firstCourse={firstCourse}
                  courseTitle={courseTitle}
                  courseDesc={courseDesc}
                  isAr={isAr}
                  locale={locale}
                  onToggleExpand={() =>
                    setExpandedMilestoneId(isExpanded ? null : milestone.id)
                  }
                  onToggleCompleted={() => handleToggleCompleted(milestone.id)}
                  onToggleSkip={() => handleToggleSkip(milestone.id)}
                  onMoveUp={() => handleMoveMilestone(idx, "up")}
                  onMoveDown={() => handleMoveMilestone(idx, "down")}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < totalCount - 1}
                  isMobile={false}
                />
              </div>
            </div>
          );
        })}

        {/* 4. Subtle Roadmap Capstone Goal Marker at the bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0F5244]/95 text-white text-[11px] font-black shadow-md border border-[#38E09D]/40 backdrop-blur-xs">
          <Trophy className="w-3.5 h-3.5 text-[#38E09D]" />
          <span>
            {isAr
              ? "هدف المسار: الإتقان والجاهزية الوظيفية"
              : "Goal: Mastery & Career Readiness"}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REORDER STEPS INTERACTIVE MODAL DIALOG                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReorderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReorderModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#0F5244] to-[#166353] p-5 sm:p-6 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#38E09D]">
                    <ArrowUpDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {isAr ? "إعادة ترتيب محطات المسار" : "Reorder Roadmap Stages"}
                    </h3>
                    <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                      {isAr
                        ? "اسحب وأفلت المحطات أو استخدم الأسهم لتخصيص الترتيب"
                        : "Drag & drop stages or use arrows to customize the order"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content: Draggable Milestone List */}
              <Reorder.Group
                axis="y"
                values={milestonesState}
                onReorder={handleReorderGroup}
                className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1"
              >
                {milestonesState.map((milestone, idx) => {
                  const firstCourse =
                    milestone.courses && milestone.courses.length > 0
                      ? milestone.courses[0]
                      : null;
                  const courseTitle = firstCourse
                    ? isAr
                      ? firstCourse.titleAr
                      : firstCourse.title
                    : isAr
                      ? milestone.titleAr
                      : milestone.title;

                  const isCompleted = milestone.status === "completed";
                  const isSkipped = milestone.status === "skipped";
                  const isActive =
                    !isCompleted &&
                    !isSkipped &&
                    idx === currentActiveIndex;

                  return (
                    <Reorder.Item
                      key={milestone.id}
                      value={milestone}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      dragTransition={{ bounceStiffness: 400, bounceDamping: 28 }}
                      whileDrag={{
                        scale: 1.04,
                        zIndex: 9999,
                        boxShadow:
                          "0 25px 50px -12px rgba(15, 82, 68, 0.35), 0 12px 24px -6px rgba(0, 0, 0, 0.18)",
                        cursor: "grabbing",
                      }}
                      style={{ position: "relative" }}
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border select-none cursor-grab active:cursor-grabbing touch-none transition-colors duration-150 ${
                        isActive
                          ? "bg-emerald-50/95 border-emerald-400/90 shadow-xs"
                          : isCompleted
                            ? "bg-slate-50 border-emerald-200/60 opacity-90"
                            : "bg-white border-slate-200 hover:border-emerald-300 shadow-2xs"
                      }`}
                    >
                      {/* Left / Drag Handle + Title & Order badge */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Drag Handle Icon */}
                        <div
                          className="text-slate-400 hover:text-emerald-700 p-1 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing"
                          title={isAr ? "اسحب لإعادة الترتيب" : "Drag to reorder"}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <span className="w-8 h-8 rounded-xl bg-[#0F5244] text-white flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-2xs">
                          0{idx + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-slate-800 line-clamp-1">
                            {courseTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-semibold">
                            <span>
                              {milestone.durationWeeks}{" "}
                              {isAr ? "أسابيع" : "weeks"}
                            </span>
                            {isCompleted && (
                              <span className="text-emerald-700 font-bold">
                                • {isAr ? "مكتملة" : "Completed"}
                              </span>
                            )}
                            {isSkipped && (
                              <span className="text-slate-400 font-bold">
                                • {isAr ? "متخطاة" : "Skipped"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right / Up and Down Arrow Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveMilestone(idx, "up");
                          }}
                          title={isAr ? "تقديم للأعلى" : "Move up"}
                          className={`p-2 rounded-xl border font-bold transition-all ${
                            idx > 0
                              ? "bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 border-slate-200 active:scale-95 cursor-pointer shadow-2xs"
                              : "opacity-25 border-transparent text-slate-300 cursor-not-allowed"
                          }`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === totalCount - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveMilestone(idx, "down");
                          }}
                          title={isAr ? "تأخير للأسفل" : "Move down"}
                          className={`p-2 rounded-xl border font-bold transition-all ${
                            idx < totalCount - 1
                              ? "bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 border-slate-200 active:scale-95 cursor-pointer shadow-2xs"
                              : "opacity-25 border-transparent text-slate-300 cursor-not-allowed"
                          }`}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  {isAr
                    ? "يتم تحديث مسار الخريطة فوراً عند التحريك"
                    : "Map path updates instantly upon reordering"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsReorderModalOpen(false);
                    if (soundOn) soundFx.playOptionSelect();
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0F5244] to-[#146654] hover:from-[#09352C] hover:to-[#0F5244] text-white text-xs font-black shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {isAr ? "تم وحفظ الترتيب" : "Done / Save Order"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InteractiveCurriculumMap;

