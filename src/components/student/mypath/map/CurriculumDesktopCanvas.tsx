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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0F5244]/95 text-white text-[11px] font-black shadow-md border border-[#38E09D]/40 backdrop-blur-xs">
        <Trophy className="w-3.5 h-3.5 text-[#38E09D]" />
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
