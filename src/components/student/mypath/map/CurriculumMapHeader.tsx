"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";

interface CurriculumMapHeaderProps {
  isAr: boolean;
  totalCount: number;
  completedCount: number;
  progressPercent: number;
  trackName: string;
  soundOn: boolean;
  toggleSound: () => void;
  onOpenReorderModal: () => void;
  onRegenerate: () => void;
}

export function CurriculumMapHeader({
  isAr,
  totalCount,
  completedCount,
  progressPercent,
  trackName,
  soundOn,
  toggleSound,
  onOpenReorderModal,
  onRegenerate,
}: CurriculumMapHeaderProps) {
  return (
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
            {trackName}
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
                onOpenReorderModal();
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0F5244] font-black transition-all shadow-[0_2px_10px_rgba(255,255,255,0.2)] hover:shadow-md active:scale-95 cursor-pointer text-xs"
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
  );
}

export default CurriculumMapHeader;
