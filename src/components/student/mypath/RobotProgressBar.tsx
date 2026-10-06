"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";

interface RobotProgressBarProps {
  currentStepIndex: number; // 1, 2, 3, 4
  totalSteps?: number; // 4
  stepBadge: string;
  stepCategory: string;
  isAr: boolean;
}

export function RobotProgressBar({
  currentStepIndex,
  totalSteps = 4,
  stepBadge,
  stepCategory,
  isAr,
}: RobotProgressBarProps) {
  const percent = Math.round((currentStepIndex / totalSteps) * 100);

  return (
    <div className="space-y-2 max-w-2xl mx-auto select-none">
      {/* Top Labels */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>
          {stepBadge} • {stepCategory}
        </span>
        <span className="font-bold text-brand-dark">{percent}%</span>
      </div>

      {/* Track & Floating Sliding Robot */}
      <div className="relative pt-6 pb-2">
        {/* Animated Flying Robot Runner on the Progress Track */}
        <motion.div
          initial={false}
          animate={{
            left: isAr ? "auto" : `${percent}%`,
            right: isAr ? `${percent}%` : "auto",
            transform: isAr ? "translateX(50%)" : "translateX(-50%)",
          }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 14,
            mass: 0.8,
          }}
          className="absolute top-0 z-20 flex flex-col items-center pointer-events-none"
        >
          {/* Micro Speech Bubble */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={currentStepIndex}
            transition={{ duration: 0.25 }}
            className="mb-1 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-full px-2 py-0.5 shadow-xs flex items-center gap-1 whitespace-nowrap"
          >
            <Sparkles className="w-2.5 h-2.5 text-brand animate-pulse" />
            <span className="text-[10px] font-black text-[var(--color-primary-main)]">
              {stepCategory}
            </span>
          </motion.div>

          {/* Mini Cute Robot */}
          <div className="-mt-1">
            <AnimatedRobotCharacter size="xs" />
          </div>
        </motion.div>

        {/* Progress Track Background */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
          {/* Animated Fill Bar */}
          <motion.div
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 14,
            }}
            className="h-full bg-gradient-to-r from-[var(--color-primary-main)] via-[var(--color-primary-light)] to-[var(--color-primary-main)] rounded-full"
          />
        </div>

        {/* Step Nodes along the line */}
        <div className="absolute inset-x-0 bottom-1 flex items-center justify-between pointer-events-none px-1">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isPassed = stepNum <= currentStepIndex;
            return (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                  isPassed
                    ? "bg-brand border-white shadow-2xs scale-110"
                    : "bg-slate-200 border-white"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
