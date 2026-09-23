"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedRobotCharacter() {
  return (
    <motion.div
      animate={{
        y: [0, -14, 0],
        rotate: [0, -2, 2, 0],
      }}
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative w-32 h-44 sm:w-40 sm:h-52 select-none pointer-events-auto cursor-pointer"
    >
      <svg
        viewBox="0 0 160 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(15,82,68,0.22)]"
      >
        <defs>
          {/* Gradients for cute robot body & shading */}
          <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F0FAF6" />
            <stop offset="100%" stopColor="#D8EFE7" />
          </linearGradient>

          <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="thrusterFlameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38E09D" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. JET PROPULSION FLAME (Animated pulse underneath) */}
        <motion.g
          animate={{
            scaleY: [0.8, 1.3, 0.8],
            scaleX: [0.9, 1.1, 0.9],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "80px 175px" }}
        >
          <path
            d="M 68 175 C 68 175 74 205 80 208 C 86 205 92 175 92 175 Z"
            fill="url(#thrusterFlameGrad)"
          />
          <ellipse cx="80" cy="188" rx="5" ry="8" fill="#A7F3D0" opacity="0.9" />
        </motion.g>

        {/* 2. ROBOT LOWER BODY / TORSO */}
        <ellipse cx="80" cy="148" rx="28" ry="26" fill="url(#robotBodyGrad)" stroke="#E2E8F0" strokeWidth="2" />
        
        {/* Torso Center AI Core Light */}
        <circle cx="80" cy="145" r="9" fill="#E6F7F1" stroke="#38E09D" strokeWidth="2.5" />
        <motion.circle
          cx="80"
          cy="145"
          r="4.5"
          fill="#38E09D"
          animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Left Arm (Resting on side) */}
        <path
          d="M 52 135 C 44 142 42 155 46 164 C 48 168 53 167 55 163 C 58 155 57 143 55 137 Z"
          fill="url(#robotBodyGrad)"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* 3. WAVING RIGHT ARM (Actively Waving in Real Time!) */}
        <motion.g
          animate={{
            rotate: [0, 24, -4, 20, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "106px 136px" }}
        >
          {/* Upper & Forearm */}
          <path
            d="M 106 136 C 118 132 132 122 138 108 C 141 102 147 104 146 110 C 142 124 126 142 112 145 Z"
            fill="url(#robotBodyGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Waving Hand Mitten */}
          <ellipse cx="140" cy="105" rx="7" ry="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M 136 102 C 138 97 144 98 145 103" stroke="#38E09D" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* 4. ROBOT HEAD */}
        <g>
          {/* Head Shape */}
          <rect
            x="42"
            y="62"
            width="76"
            height="62"
            rx="28"
            fill="url(#robotBodyGrad)"
            stroke="#E2E8F0"
            strokeWidth="2.5"
          />

          {/* Ears / Head Antennas */}
          <rect x="36" y="80" width="8" height="24" rx="4" fill="#38E09D" opacity="0.9" />
          <rect x="116" y="80" width="8" height="24" rx="4" fill="#38E09D" opacity="0.9" />

          {/* Dark Glass Visor Screen */}
          <rect x="50" y="72" width="60" height="42" rx="16" fill="url(#robotVisorGrad)" />

          {/* BLINKING GLOWING MINT LED EYES */}
          <motion.g
            animate={{
              scaleY: [1, 1, 0.1, 1, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              times: [0, 0.45, 0.5, 0.55, 1],
            }}
            style={{ transformOrigin: "80px 92px" }}
          >
            {/* Left Eye (Happy arc shape) */}
            <path
              d="M 60 93 C 60 87 69 87 69 93"
              stroke="#38E09D"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right Eye (Happy arc shape) */}
            <path
              d="M 91 93 C 91 87 100 87 100 93"
              stroke="#38E09D"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Cute Mint Smile */}
          <path
            d="M 74 104 C 77 107 83 107 86 104"
            stroke="#38E09D"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* 5. GRADUATION CAP (Academic Mastery) */}
        <g transform="translate(80, 58)">
          {/* Cap Diamond Top */}
          <polygon
            points="0,-22 46,-8 0,6 -46,-8"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="1.5"
          />
          {/* Cap Skull Base */}
          <path
            d="M -22 -6 C -22 6 22 6 22 -6"
            fill="#1E293B"
          />
          {/* Cap Button */}
          <circle cx="0" cy="-8" r="3" fill="#38E09D" />
          
          {/* Swinging Tassel */}
          <motion.g
            animate={{
              rotate: [-5, 8, -5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "0px -8px" }}
          >
            <path
              d="M 0 -8 C 12 -4 28 4 32 16"
              stroke="#38E09D"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="32" cy="18" r="3.5" fill="#38E09D" />
          </motion.g>
        </g>
      </svg>
    </motion.div>
  );
}
