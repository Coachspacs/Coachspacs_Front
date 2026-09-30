"use client";

import React, { useEffect, useState } from "react";
import { GlobalBrandingConfig } from "@/types/cms";
import { DEFAULT_BRANDING } from "@/lib/cmsDefaults";
import { generateBrandingCss } from "@/lib/brandingCss";

export { generateBrandingCss };

interface DynamicBrandingClientProps {
  initialBranding?: GlobalBrandingConfig;
}

export function DynamicBrandingClient({ initialBranding }: DynamicBrandingClientProps) {
  const [branding, setBranding] = useState<GlobalBrandingConfig>(initialBranding || DEFAULT_BRANDING);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("coachspace_cms_branding");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.colors?.primaryMain) {
          setBranding(parsed);
        }
      }
    } catch {}

    async function syncBranding() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.branding) {
          setBranding(json.branding);
          try {
            localStorage.setItem("coachspace_cms_branding", JSON.stringify(json.branding));
          } catch {}
        }
      } catch {}
    }
    syncBranding();

    const handleBrandingUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<GlobalBrandingConfig>;
      if (customEvent?.detail) {
        setBranding(customEvent.detail);
      } else {
        try {
          const updated = localStorage.getItem("coachspace_cms_branding");
          if (updated) setBranding(JSON.parse(updated));
        } catch {}
      }
    };

    window.addEventListener("cms-branding-updated", handleBrandingUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "coachspace_cms_branding" && e.newValue) {
        try {
          setBranding(JSON.parse(e.newValue));
        } catch {}
      }
    });

    return () => {
      window.removeEventListener("cms-branding-updated", handleBrandingUpdate);
    };
  }, []);

  const cssString = generateBrandingCss(branding);

  return (
    <style
      id="cms-dynamic-branding"
      dangerouslySetInnerHTML={{ __html: cssString }}
    />
  );
}

export default DynamicBrandingClient;
