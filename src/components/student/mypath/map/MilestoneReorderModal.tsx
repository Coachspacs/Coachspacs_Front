"use client";

import React from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical, X } from "lucide-react";
import { RoadmapMilestone } from "@/types/mypath";

interface MilestoneReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestonesState: RoadmapMilestone[];
  currentActiveIndex: number;
  totalCount: number;
  isAr: boolean;
  soundOn: boolean;
  handleMoveMilestone: (index: number, direction: "up" | "down") => void;
  handleReorderGroup: (newOrder: RoadmapMilestone[]) => void;
}

export function MilestoneReorderModal({
  isOpen,
  onClose,
  milestonesState,
  currentActiveIndex,
  totalCount,
  isAr,
  soundOn,
  handleMoveMilestone,
  handleReorderGroup,
}: MilestoneReorderModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                onClick={onClose}
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
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0F5244] to-[#146654] hover:from-[#09352C] hover:to-[#0F5244] text-white text-xs font-black shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {isAr ? "تم وحفظ الترتيب" : "Done / Save Order"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MilestoneReorderModal;
