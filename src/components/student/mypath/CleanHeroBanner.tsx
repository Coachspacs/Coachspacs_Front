"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AnimatedRobotCharacter } from "./AnimatedRobotCharacter";

interface CleanHeroBannerProps {
  isAr: boolean;
}

export function CleanHeroBanner({ isAr }: CleanHeroBannerProps) {
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
    <div className="w-full h-56 sm:h-64 relative rounded-2xl overflow-hidden border border-emerald-100/90 shadow-xs select-none mb-5 perspective-1000 bg-emerald-50/20">
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
        {/* Background Scenic Landscape */}
        <Image
          src="/images/mypath/mypath-daylight-hero.jpg"
          alt="Coach Space Learning Journey Landscape"
          fill
          priority
          className="object-cover object-center"
        />

        {/* 4th Milestone Pillar & Flag (matching 1, 2, 3) */}
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
            <ellipse cx="20" cy="50" rx="14" ry="3.5" fill="rgba(15,82,68,0.24)" />
            <path d="M10 50C9 45 7 40 4 38C7 43 8 47 10 50Z" fill="#10B981" />
            <path d="M12 50C12 44 11 38 9 35C11 42 12 46 13 50Z" fill="#059669" />
            <path d="M14 50C15 45 17 40 19 37C17 43 16 47 14 50Z" fill="#34D399" />

            <polygon points="12,22 20,19 20,46 12,48" fill="#E6EFEA" />
            <polygon points="20,19 34,22 34,49 20,46" fill="#FFFFFF" />
            <polygon
              points="12,22 20,19 34,22 26,25"
              fill="#F8FAFC"
              stroke="#CFDFD7"
              strokeWidth="0.5"
            />
            <polyline
              points="12,22 12,48 20,46 34,49 34,22"
              stroke="#CFDFD7"
              strokeWidth="0.75"
              fill="none"
            />
            <line x1="20" y1="19" x2="20" y2="46" stroke="#CFDFD7" strokeWidth="0.75" />

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

            <path
              d="M20 8.5C26 7 35 11 44 8.5L42 16C34 18 26 14.5 20 16V8.5Z"
              fill="url(#flagGreenFinishGradHero)"
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
                id="flagGreenFinishGradHero"
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

        {/* Live Animated Robot hovering above Start Point (Milestone 1) */}
        <div className="absolute top-[36%] left-[17%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
          <AnimatedRobotCharacter size="md" />
        </div>

        {/* Soft Ambient Light Gradient on edge */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/10 via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}
