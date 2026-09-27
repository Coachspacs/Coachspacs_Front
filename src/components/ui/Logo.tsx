"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

interface LogoProps {
  compact?: boolean;
  showText?: boolean;
  isAr?: boolean;
  href?: string;
  className?: string;
  imageClassName?: string;
}

export function Logo({
  compact = false,
  showText = true,
  isAr,
  href,
  className = "",
  imageClassName = "",
}: LogoProps) {
  const t = useTranslations("header");
  const locale = useLocale() || "en";
  const targetHref = href || `/${locale}`;
  const logoHeight = compact ? 36 : 46;
  const logoWidth = compact ? 34 : 44;

  const [logoSrc, setLogoSrc] = useState<string>("/images/brand-logo.png");

  useEffect(() => {
    const readLogo = () => {
      try {
        const globalBranding = (window as unknown as { __CMS_BRANDING__?: { logoUrl?: string } }).__CMS_BRANDING__;
        if (globalBranding?.logoUrl && globalBranding.logoUrl.trim().length > 0) {
          setLogoSrc(globalBranding.logoUrl.trim());
          return;
        }

        const cached = localStorage.getItem("coachspace_cms_branding");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.logoUrl && parsed.logoUrl.trim().length > 0) {
            setLogoSrc(parsed.logoUrl.trim());
          }
        }
      } catch {}
    };

    readLogo();

    const handleBranding = (e: Event) => {
      const customEvent = e as CustomEvent<{ logoUrl?: string }>;
      if (customEvent?.detail?.logoUrl && customEvent.detail.logoUrl.trim().length > 0) {
        setLogoSrc(customEvent.detail.logoUrl.trim());
      }
    };

    window.addEventListener("cms-branding-updated", handleBranding);
    return () => {
      window.removeEventListener("cms-branding-updated", handleBranding);
    };
  }, []);

  const isDefaultLogo = logoSrc === "/images/brand-logo.png" || logoSrc === "/images/logo.png";
  const isSvg = logoSrc.toLowerCase().includes(".svg");

  return (
    <Link
      href={targetHref}
      className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 focus:outline-none ${className}`}
    >
      <Image
        src={logoSrc}
        alt="Coach Space Logo"
        width={logoWidth}
        height={logoHeight}
        priority
        unoptimized={isSvg || isDefaultLogo}
        onError={() => setLogoSrc("/images/brand-logo.png")}
        className={`object-contain shrink-0 ${
          isDefaultLogo ? "brand-logo-img" : ""
        } ${imageClassName || ""}`}
        style={{
          height: `${logoHeight}px`,
          width: "auto",
        }}
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


