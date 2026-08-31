"use client";

import React from "react";
import { useLocale } from "next-intl";

export interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  className?: string;
  tooltipText?: string;
}

/**
 * Authentic vector SVG verified badge (pure icon, zero emojis).
 * Clean, high-precision circular starburst badge with a sharp white checkmark.
 */
export function VerifiedBadge({
  size = "sm",
  showText = false,
  text,
  className = "",
  tooltipText,
}: VerifiedBadgeProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const defaultText = isAr ? "موثق" : "Verified";
  const defaultTooltip = isAr
    ? "حساب موثق ومعتمد رسمياً من المنصة"
    : "Officially Verified Account";

  const displayText = text || defaultText;
  const displayTooltip = tooltipText || defaultTooltip;

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    xs: "text-[10px]",
    sm: "text-[11px]",
    md: "text-xs",
    lg: "text-sm",
  };

  // Pure SVG icon element
  const iconElement = (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0 inline-block align-middle transition-transform duration-200 hover:scale-110`}
      aria-label={displayTooltip}
    >
      {/* Sleek rounded starburst verified seal in primary emerald */}
      <path
        d="M6.215 2.138a1.5 1.5 0 011.834-.693l1.196.47a1.5 1.5 0 001.074 0l1.196-.47a1.5 1.5 0 011.834.693l.707 1.077a1.5 1.5 0 00.759.623l1.242.333a1.5 1.5 0 011.134 1.56l-.037 1.285a1.5 1.5 0 00.41 1.002l.865.957a1.5 1.5 0 010 2.016l-.865.957a1.5 1.5 0 00-.41 1.002l.037 1.285a1.5 1.5 0 01-1.134 1.56l-1.242.333a1.5 1.5 0 00-.759.623l-.707 1.077a1.5 1.5 0 01-1.834.693l-1.196-.47a1.5 1.5 0 00-1.074 0l-1.196.47a1.5 1.5 0 01-1.834-.693l-.707-1.077a1.5 1.5 0 00-.759-.623l-1.242-.333a1.5 1.5 0 01-1.134-1.56l.037-1.285a1.5 1.5 0 00-.41-1.002l-.865-.957a1.5 1.5 0 010-2.016l.865-.957a1.5 1.5 0 00.41-1.002l-.037-1.285a1.5 1.5 0 011.134-1.56l1.242-.333a1.5 1.5 0 00.759-.623l.707-1.077z"
        fill="#0F5244"
      />
      {/* Crisp white checkmark */}
      <path
        d="M13.78 7.72a.75.75 0 01.06 1.06l-4.5 5a.75.75 0 01-1.1.02l-2.25-2.25a.75.75 0 111.06-1.06l1.7 1.7 3.97-4.41a.75.75 0 011.06-.06z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!showText) {
    return (
      <span
        className={`inline-flex items-center justify-center select-none cursor-default ${className}`}
        title={displayTooltip}
      >
        {iconElement}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0F5244] border border-emerald-200/80 font-bold select-none cursor-default shadow-2xs ${className}`}
      title={displayTooltip}
    >
      {iconElement}
      <span className={`${textSizes[size]} font-extrabold leading-none`}>{displayText}</span>
    </span>
  );
}
