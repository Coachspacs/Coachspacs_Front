"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, MessageCircle } from "lucide-react";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";

interface CleanHeroBannerProps {
  isAr: boolean;
}

export function CleanHeroBanner({ isAr }: CleanHeroBannerProps) {
  const t = useTranslations("myPath");
  const cardRef = useRef<HTMLDivElement>(null);

  // Smooth gentle 3D tilt on card hover
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { damping: 25, stiffness: 180, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [2.5, -2.5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-2.5, 2.5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div className="w-full h-52 sm:h-64 relative rounded-2xl overflow-hidden border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs select-none mb-4 perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative group cursor-pointer"
      >
        {/* Background Scenic Landscape (Rolling green hills, road, milestone flags 1, 2, 3, sunrise star) */}
        <Image
          src="/images/mypath/mypath-landscape-bg.jpg"
          alt="Coach Space Learning Journey Landscape"
          fill
          priority
          className="object-cover"
        />

        {/* ========================================================================= */}
        {/* LIVE ANIMATED ROBOT (Floating, Waving Arm, Blinking LED Eyes) */}
        {/* ========================================================================= */}
        <div className="absolute top-[10%] left-[8%] sm:left-[12%] rtl:left-auto rtl:right-[8%] sm:rtl:right-[12%] z-20 flex flex-col items-center">
          <AnimatedRobotCharacter />

          {/* Interactive Speech Bubble from Robot */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -top-3 left-24 rtl:left-auto rtl:right-24 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-300 dark:border-emerald-600 rounded-2xl px-3 py-1 shadow-sm whitespace-nowrap hidden sm:flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#38E09D] animate-pulse" />
            <span className="text-[11px] font-black text-[#0F5244] dark:text-emerald-300">
              {t("robotGreeting")}
            </span>
          </motion.div>
        </div>

        {/* Soft Ambient Light Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Real HTML/CSS Translatable Floating Badges */}
        {/* Bottom Corner Pill */}
        <div className="absolute bottom-3 left-3.5 rtl:left-auto rtl:right-3.5 z-20">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 bg-slate-900/85 dark:bg-slate-950/90 backdrop-blur-md border border-emerald-300/40 rounded-xl px-3 py-1.5 shadow-sm text-start"
          >
            <div className="w-2 h-2 rounded-full bg-[#38E09D] animate-ping" />
            <span className="text-[11px] font-black text-emerald-200">
              {t("generatingBadge")}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
