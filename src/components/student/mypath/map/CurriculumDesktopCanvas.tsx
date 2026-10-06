"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flag, Check, SkipForward, Trophy } from "lucide-react";
import { RoadmapMilestone } from "@/types/mypath";
import { AnimatedRobotCharacter } from "../AnimatedRobotCharacter";
import { MilestoneCardView } from "./MilestoneCardView";
import { WaypointNode } from "./types";

interface CurriculumDesktopCanvasProps {
  isAr: boolean;
  locale: string;
  milestonesState: RoadmapMilestone[];
  waypoints: WaypointNode[];
  svgRoadPath: string;
  dynamicMinHeight: number;
  totalCount: number;
  currentActiveIndex: number;
  expandedMilestoneId: string | null;
  enrolledCourseIds: string[];
  setExpandedMilestoneId: (id: string | null) => void;
  handleToggleCompleted: (id: string) => void;
  handleToggleSkip: (id: string) => void;
  handleMoveMilestone: (index: number, direction: "up" | "down") => void;
}

export function CurriculumDesktopCanvas({
  isAr,
  locale,
  milestonesState,
  waypoints,
  svgRoadPath,
  dynamicMinHeight,
  totalCount,
  currentActiveIndex,
  expandedMilestoneId,
  enrolledCourseIds,
  setExpandedMilestoneId,
  handleToggleCompleted,
  handleToggleSkip,
  handleMoveMilestone,
}: CurriculumDesktopCanvasProps) {
  return (
    <div
      className="hidden md:block relative rounded-3xl bg-gradient-to-b from-[var(--color-bg-default)] via-[var(--color-bg-default)] to-[var(--color-bg-default)] border-2 border-slate-200 shadow-lg overflow-hidden select-none py-6"
      style={{ minHeight: `${dynamicMinHeight}px` }}
    >
      {/* Subtle Roadmap Origin Pin */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/90 border border-brand text-brand-dark text-[11px] font-bold shadow-xs backdrop-blur-xs">
        <Flag className="w-3.5 h-3.5 text-brand" />
        <span>
          {isAr ? "نقطة انطلاق المسار" : "Roadmap Start Line"}
        </span>
      </div>
      {/* Soft Grid Terrain Background */}
      <div
        className="absolute inset-0 opacity-[0.28] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-primary-main) 1.2px, transparent 1.2px)",
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
              <stop offset="0%" stopColor="var(--color-primary-main)" />
              <stop offset="30%" stopColor="var(--color-primary-light)" />
              <stop offset="65%" stopColor="var(--color-primary-main)" />
              <stop offset="100%" stopColor="var(--color-primary-main)" />
            </linearGradient>
            <linearGradient
              id="trackBedGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--color-primary-main)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="var(--color-primary-main)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary-main)" stopOpacity="0.2" />
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
            stroke="var(--color-primary-main)"
            strokeOpacity="0.1"
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
            stroke="var(--color-primary-main)"
            strokeOpacity="0.25"
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
            <div className="relative flex items-center justify-center">
              {/* 1. Checkpoint Stone Button (Centers exactly on the waypoint) */}
              <div className="flex flex-col items-center shrink-0 relative z-10">
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
                      ? "bg-gradient-to-tr from-brand to-[var(--color-primary-main)] text-white border-2 border-slate-200 shadow-lg ring-4 ring-slate-200"
                      : isSkipped
                        ? "bg-slate-200 text-slate-500 border-2 border-slate-300"
                        : isActive
                          ? "bg-gradient-to-tr from-[var(--color-primary-main)] via-[var(--color-primary-main)] to-[var(--color-primary-light)] text-white border-2 border-[var(--color-primary-main)] shadow-lg ring-4 ring-slate-200"
                          : isCapstone
                            ? "bg-gradient-to-tr from-[var(--color-primary-main)] to-[var(--color-primary-main)] text-white border-2 border-[var(--color-primary-main)] shadow-md ring-4 ring-slate-200"
                            : "bg-gradient-to-br from-white via-slate-50 to-slate-100 text-[var(--color-primary-main)] border-2 border-slate-200 shadow-lg hover:border-brand"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3] text-white drop-shadow-xs" />
                  ) : isSkipped ? (
                    <SkipForward className="w-5 h-5 text-slate-400" />
                  ) : isCapstone ? (
                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-xs" />
                  ) : isActive ? (
                    <>
                      <span className="text-base sm:text-lg font-mono font-black leading-none">
                        0{idx + 1}
                      </span>
                      <span className="text-[9px] font-black uppercase text-white tracking-wider mt-0.5">
                        {isAr ? "نشطة" : "LIVE"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-base sm:text-lg font-mono font-black leading-none text-[var(--color-primary-main)]">
                        0{idx + 1}
                      </span>
                      <span className="text-[9px] font-bold text-brand-dark uppercase tracking-wider mt-0.5">
                        {isAr ? "محطة" : "LVL"}
                      </span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* 2. Attached Milestone Card View (Absolutely positioned to the side) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-0"
                style={
                  isLeft
                    ? { left: "100%", paddingLeft: "1rem" }
                    : { right: "100%", paddingRight: "1rem" }
                }
              >
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
          </div>
        );
      })}

      {/* 4. Subtle Roadmap Capstone Goal Marker at the bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand text-white text-[11px] font-black shadow-md border border-slate-200 backdrop-blur-xs">
        <Trophy className="w-3.5 h-3.5 text-[var(--color-primary-main)]" />
        <span>
          {isAr
            ? "هدف المسار: الإتقان والجاهزية الوظيفية"
            : "Goal: Mastery & Career Readiness"}
        </span>
      </div>
    </div>
  );
}

export default CurriculumDesktopCanvas;
