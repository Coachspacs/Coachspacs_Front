"use client";

import { useEffect } from "react";
import { GlobalBrandingConfig } from "@/types/cms";
import { generateBrandingCss } from "@/lib/brandingCss";

interface DynamicBrandingListenerProps {
  initialBranding?: GlobalBrandingConfig;
}

export function DynamicBrandingListener({ initialBranding }: DynamicBrandingListenerProps) {
  useEffect(() => {
    function applyBranding(branding: GlobalBrandingConfig) {
      if (!branding) return;
      const css = generateBrandingCss(branding);
      let styleTag = document.getElementById("cms-dynamic-branding");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "cms-dynamic-branding";
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = css;
    }

    // 1. Sync from localStorage if available (for instant draft preview updates)
    try {
      const cached = localStorage.getItem("coachspace_cms_branding");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.colors?.primaryMain) {
          applyBranding(parsed);
        }
      }
    } catch {}

    // 2. Listen to custom event for in-tab preview updates
    const handleBrandingUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<GlobalBrandingConfig>;
      if (customEvent?.detail) {
        applyBranding(customEvent.detail);
      } else {
        try {
          const updated = localStorage.getItem("coachspace_cms_branding");
          if (updated) applyBranding(JSON.parse(updated));
        } catch {}
      }
    };

    // 3. Listen to cross-tab updates via storage event
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === "coachspace_cms_branding" && e.newValue) {
        try {
          applyBranding(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener("cms-branding-updated", handleBrandingUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("cms-branding-updated", handleBrandingUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  return null;
}

export default DynamicBrandingListener;
