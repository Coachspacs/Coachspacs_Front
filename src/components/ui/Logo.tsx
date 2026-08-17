"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

interface LogoProps {
  compact?: boolean;
  showText?: boolean;
  isAr?: boolean;
  className?: string;
  imageClassName?: string;
}

export function Logo({
  compact = false,
  showText = true,
  isAr,
  className = "",
  imageClassName = "",
}: LogoProps) {
  const t = useTranslations("header");
  const locale = useLocale() || "en";
  const isArabic = isAr ?? (locale === "ar");
  const logoHeight = compact ? 36 : 50;

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 shrink-0 focus:outline-none ${className}`}
    >
      <Image
        src="/images/logo.png"
        alt="Coach Space Logo"
        width={180}
        height={logoHeight}
        priority
        className={`w-auto shrink-0 object-contain ${
          imageClassName
            ? imageClassName
            : compact
            ? "h-9 sm:h-10"
            : "h-12 sm:h-14"
        }`}
        style={{ height: `${logoHeight}px`, width: "auto" }}
      />

      {showText && (
        <span
          className={`hidden sm:flex font-extrabold text-[#0F5244] tracking-tight rtl:tracking-normal leading-none items-center shrink-0 ${
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          }`}
          style={{ lineHeight: 1 }}
        >
          {t("brandName")}
        </span>
      )}
    </Link>
  );
}

