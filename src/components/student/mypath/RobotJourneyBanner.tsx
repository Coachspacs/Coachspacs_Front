"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";
import { soundFx } from "@/lib/soundEffects";

interface RobotJourneyBannerProps {
  currentStepIndex: number; // 1, 2, 3, 4
  totalSteps?: number; // 4
  stepBadge?: string;
  stepCategory?: string;
  isAr: boolean;
}

// Exact Waypoint coordinates matching the 4 milestone posts on the S-curve trail
const WAYPOINTS = [
  { step: 1, x: 17, y: 36 }, // Over Milestone 1 (START)
  { step: 2, x: 68, y: 44 }, // Over Milestone 2 (MILESTONE)
  { step: 3, x: 43, y: 15 }, // Over Milestone 3 (PROGRESS)
  { step: 4, x: 88, y: 10 }, // Over Milestone 4 (FINISH)
];

export function RobotJourneyBanner({
  currentStepIndex,
  isAr,
}: RobotJourneyBannerProps) {
  const activeWaypoint =
    WAYPOINTS.find((w) => w.step === currentStepIndex) || WAYPOINTS[0];
  const isFirstMount = useRef(true);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Initialize sound state from localStorage on client
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
    if (nextVal) {
      soundFx.playOptionSelect();
    }
  };

  // Trigger playful robotic jet glide sound effect on milestone changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    soundFx.playRobotTravel(currentStepIndex);
  }, [currentStepIndex]);

  return (
    <div className="w-full h-44 sm:h-52 relative rounded-3xl overflow-hidden border border-emerald-200/70 shadow-xs select-none mb-4 bg-emerald-50/20">
      {/* Background Scenic Landscape */}
      <Image
        src="/images/mypath/mypath-daylight-hero.jpg"
        alt="Coach Space Learning Journey Road"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Floating Sound Toggle Pill (Glassmorphic) */}
      <div
        className={`absolute top-3 ${
          isAr ? "left-3" : "right-3"
        } z-30 flex items-center gap-1.5`}
      >
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? (isAr ? "كتم الصوت" : "Mute Sound") : (isAr ? "تفعيل الصوت" : "Unmute Sound")}
          title={soundOn ? (isAr ? "كتم الصوت" : "Mute Sound") : (isAr ? "تفعيل الصوت" : "Unmute Sound")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/85 hover:bg-white text-slate-700 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          {soundOn ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-extrabold text-slate-700 hidden sm:inline">
                {isAr ? "الصوت مفعل" : "Sound On"}
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-extrabold text-slate-500 hidden sm:inline">
                {isAr ? "الصوت مكتوم" : "Muted"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4TH MILESTONE PILLAR & FLAG (Exact Match to Posts 1, 2, 3) */}
      {/* ========================================================================= */}
      <div
        style={{ left: "88%", top: "34%" }}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
      >
        <svg
          width="48"
          height="54"
          viewBox="0 0 48 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs select-none"
        >
          {/* Ground Soft Shadow on Grass */}
          <ellipse cx="20" cy="50" rx="14" ry="3.5" fill="rgba(15,82,68,0.24)" />

          {/* Grass Blades at Base (Left) */}
          <path d="M10 50C9 45 7 40 4 38C7 43 8 47 10 50Z" fill="#10B981" />
          <path d="M12 50C12 44 11 38 9 35C11 42 12 46 13 50Z" fill="#059669" />
          <path d="M14 50C15 45 17 40 19 37C17 43 16 47 14 50Z" fill="#34D399" />

          {/* 3D White Milestone Pillar */}
          {/* Left Side Face (Soft Shaded) */}
          <polygon points="12,22 20,19 20,46 12,48" fill="#E6EFEA" />
          {/* Front Face (Pure White) */}
          <polygon points="20,19 34,22 34,49 20,46" fill="#FFFFFF" />
          {/* Top Face */}
          <polygon
            points="12,22 20,19 34,22 26,25"
            fill="#F8FAFC"
            stroke="#CFDFD7"
            strokeWidth="0.5"
          />
          {/* Outlines */}
          <polyline
            points="12,22 12,48 20,46 34,49 34,22"
            stroke="#CFDFD7"
            strokeWidth="0.75"
            fill="none"
          />
          <line x1="20" y1="19" x2="20" y2="46" stroke="#CFDFD7" strokeWidth="0.75" />

          {/* Bold Green Number 4 on Front Face */}
          <text
            x="27"
            y="35"
            fontSize="12.5"
            fontWeight="900"
            fill="#0F5244"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            4
          </text>

          {/* Flagpole (White/Silver) */}
          <line
            x1="20"
            y1="8"
            x2="20"
            y2="20"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="20" cy="8" r="1.2" fill="#FFFFFF" />

          {/* Waving Green Flag Banner with FINISH */}
          <path
            d="M20 8.5C26 7 35 11 44 8.5L42 16C34 18 26 14.5 20 16V8.5Z"
            fill="url(#flagGreenFinishGrad)"
          />
          <text
            x="31"
            y="12.6"
            fontSize="3.8"
            fontWeight="900"
            fill="#FFFFFF"
            textAnchor="middle"
            dominantBaseline="middle"
            letterSpacing="0.4"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            FINISH
          </text>

          <defs>
            <linearGradient
              id="flagGreenFinishGrad"
              x1="20"
              y1="8.5"
              x2="44"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#0B6B55" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Active Milestone Glowing Radar Wave */}
      <motion.div
        key={`radar-${currentStepIndex}`}
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: [0.8, 1.8, 2.2], opacity: [0.8, 0.4, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
        style={{
          left: `${activeWaypoint.x}%`,
          top: `${activeWaypoint.y + 14}%`,
        }}
        className="absolute w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-400/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
      />

      {/* Soft Ambient Light Gradient on edge */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/10 via-transparent to-transparent pointer-events-none" />

      {/* ========================================================================= */}
      {/* ANIMATED ROBOT GLIDING SMOOTHLY ABOVE MILESTONES (1 -> 2 -> 3 -> 4) */}
      {/* ========================================================================= */}
      <motion.div
        initial={false}
        animate={{
          left: `${activeWaypoint.x}%`,
          top: `${activeWaypoint.y}%`,
          transform: "translateX(-50%)",
        }}
        transition={{
          type: "spring",
          stiffness: 85,
          damping: 14,
          mass: 0.6,
        }}
        className="absolute z-30 flex flex-col items-center pointer-events-none"
      >
        <AnimatedRobotCharacter size="sm" />
      </motion.div>
    </div>
  );
}

