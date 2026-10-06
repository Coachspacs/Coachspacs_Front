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
    <div className="block md:hidden relative rounded-3xl bg-gradient-to-b from-[var(--color-bg-default)] via-[var(--color-bg-default)] to-[var(--color-bg-default)] border-2 border-slate-200 shadow-lg p-4 overflow-hidden select-none">
      {/* Soft Grid Terrain Background */}
      <div
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-primary-main) 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Roadmap Start Line Header */}
      <div className="flex justify-center pb-5 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 border border-brand text-brand-dark text-xs font-bold shadow-xs backdrop-blur-xs">
          <Flag className="w-3.5 h-3.5 text-brand" />
          <span>{isAr ? "نقطة انطلاق المسار" : "Roadmap Start Line"}</span>
        </div>
      </div>

      {/* Vertical Stepped Timeline List */}
      <div className="relative z-10 space-y-4">
        {/* Continuous Glowing Vertical Track behind the Nodes */}
        <div
          className={`absolute top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-slate-100 via-[var(--color-primary-main)] to-brand shadow-md ${
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
                      ? "bg-gradient-to-tr from-brand to-[var(--color-primary-main)] text-white border-2 border-slate-200 shadow-lg"
                      : isSkipped
                        ? "bg-slate-200 text-slate-500 border-2 border-slate-300"
                        : isActive
                          ? "bg-gradient-to-tr from-[var(--color-primary-main)] via-[var(--color-primary-main)] to-[var(--color-primary-light)] text-white border-2 border-[var(--color-primary-main)] ring-4 ring-slate-200 shadow-lg"
                          : isCapstone
                            ? "bg-gradient-to-tr from-[var(--color-primary-main)] to-[var(--color-primary-main)] text-white border-2 border-[var(--color-primary-main)]"
                            : "bg-gradient-to-br from-white via-slate-50 to-slate-100 text-[var(--color-primary-main)] border-2 border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3] text-white" />
                  ) : isSkipped ? (
                    <SkipForward className="w-4 h-4 text-slate-400" />
                  ) : isCapstone ? (
                    <Trophy className="w-5 h-5 text-white" />
                  ) : isActive ? (
                    <>
                      <span className="text-xs font-mono font-black leading-none">
                        0{idx + 1}
                      </span>
                      <span className="text-[8px] font-black uppercase text-white tracking-wider mt-0.5">
                        {isAr ? "نشطة" : "LIVE"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-mono font-black leading-none text-[var(--color-primary-main)]">
                        0{idx + 1}
                      </span>
                      <span className="text-[8px] font-bold text-brand-dark uppercase tracking-wider mt-0.5">
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
                    className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-100 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <div className="shrink-0 origin-center">
                      <AnimatedRobotCharacter size="sm" showCap={true} />
                    </div>
                    <span className="text-[11px] font-black text-brand-dark">
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
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--color-primary-main)]/95 text-white text-xs font-black shadow-md border border-[var(--color-primary-main)]/40 backdrop-blur-xs">
          <Trophy className="w-3.5 h-3.5 text-[var(--color-primary-main)]" />
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
