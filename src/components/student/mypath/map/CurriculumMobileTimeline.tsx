"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flag, Check, SkipForward, Trophy } from "lucide-react";
import { RoadmapMilestone } from "@/types/mypath";
import { AnimatedRobotCharacter } from "../AnimatedRobotCharacter";
import { MilestoneCardView } from "./MilestoneCardView";

interface CurriculumMobileTimelineProps {
  isAr: boolean;
  locale: string;
  milestonesState: RoadmapMilestone[];
  totalCount: number;
  currentActiveIndex: number;
  expandedMilestoneId: string | null;
  enrolledCourseIds: string[];
  setExpandedMilestoneId: (id: string | null) => void;
  handleToggleCompleted: (id: string) => void;
  handleToggleSkip: (id: string) => void;
  handleMoveMilestone: (index: number, direction: "up" | "down") => void;
}

export function CurriculumMobileTimeline({
  isAr,
  locale,
  milestonesState,
  totalCount,
  currentActiveIndex,
  expandedMilestoneId,
  enrolledCourseIds,
  setExpandedMilestoneId,
  handleToggleCompleted,
  handleToggleSkip,
  handleMoveMilestone,
}: CurriculumMobileTimelineProps) {
  return (
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
  );
}

export default CurriculumMobileTimeline;
