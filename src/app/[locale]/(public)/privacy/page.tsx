"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Shield,
  Database,
  UserCheck,
  Lock,
  Eye,
  FileText,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Award,
  ShieldAlert,
} from "lucide-react";
import {
  LegalPageLayout,
  LegalSectionItem,
} from "@/components/legal/LegalPageLayout";
import { DEFAULT_LEGAL_PAGES } from "@/lib/cmsDefaults";
import { LegalPageData } from "@/types/cms";

const ICON_MAP: Record<string, any> = {
  Shield,
  Database,
  UserCheck,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
  BookOpen,
  Award,
  ShieldAlert,
  Sparkles,
};

function renderLegalContent(text: string) {
  if (!text) return null;
  const paragraphs = text.split("\n\n").filter(Boolean);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split("\n").filter(Boolean);
        const hasBullets = lines.some(
          (l) =>
            l.trim().startsWith("•") ||
            l.trim().startsWith("- ") ||
            l.trim().startsWith("* ")
        );
        if (hasBullets) {
          const hasIntro =
            !lines[0].trim().startsWith("•") &&
            !lines[0].trim().startsWith("- ") &&
            !lines[0].trim().startsWith("* ");
          const intro = hasIntro ? lines[0] : null;
          const bulletLines = hasIntro ? lines.slice(1) : lines;

          return (
            <div key={pIdx} className="space-y-2">
              {intro && <p className="leading-relaxed">{intro}</p>}
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 ps-2">
                {bulletLines.map((b, bIdx) => {
                  const cleaned = b.replace(/^[•\-\*]\s*/, "");
                  const parts = cleaned.split(":");
                  if (parts.length > 1 && parts[0].length < 35) {
                    return (
                      <li key={bIdx}>
                        <strong className="text-slate-900">{parts[0]}: </strong>
                        {parts.slice(1).join(":")}
                      </li>
                    );
                  }
                  return <li key={bIdx}>{cleaned}</li>;
                })}
              </ul>
            </div>
          );
        }
        return (
          <p key={pIdx} className="leading-relaxed">
            {p}
          </p>
        );
      })}
    </div>
  );
}

function PrivacyPolicyContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const isPreview = searchParams?.get("preview") === "true";

  const t = useTranslations("legal");
  const [pageData, setPageData] = useState<LegalPageData>(DEFAULT_LEGAL_PAGES.privacy);

  useEffect(() => {
    async function loadCmsLegal() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success && json.legal) {
          const data =
            isPreview && json.legal.draft?.privacy
              ? json.legal.draft.privacy
              : json.legal.published?.privacy || DEFAULT_LEGAL_PAGES.privacy;
          setPageData(data);
        }
      } catch (err) {
        console.warn("Failed to load CMS privacy policy data, using fallback:", err);
      }
    }
    loadCmsLegal();
  }, [isPreview]);

  const sections: LegalSectionItem[] = (pageData.sections || []).map((sec, idx) => {
    const IconComponent = (sec.icon && ICON_MAP[sec.icon]) || Shield;
    const title = isAr ? sec.title_ar : sec.title_en;
    const contentText = isAr ? sec.content_ar : sec.content_en;

    return {
      id: sec.id || `sec-${idx}`,
      icon: IconComponent,
      title,
      content: renderLegalContent(contentText),
    };
  });

  return (
    <LegalPageLayout
      locale={locale}
      backToHomeText={t("backToHome")}
      badgeText={isAr ? pageData.badge_ar : pageData.badge_en}
      badgeIcon={Sparkles}
      title={isAr ? pageData.title_ar : pageData.title_en}
      lastUpdatedText={t("lastUpdated", {
        date: isAr ? pageData.lastUpdatedDate_ar : pageData.lastUpdatedDate_en,
      })}
      subtitle={isAr ? pageData.subtitle_ar : pageData.subtitle_en}
      sections={sections}
      contactTitle={isAr ? pageData.contactTitle_ar : pageData.contactTitle_en}
      contactDescription={
        isAr ? pageData.contactDescription_ar : pageData.contactDescription_en
      }
      contactEmail={pageData.contactEmail || t("supportEmail")}
    />
  );
}

export default function PrivacyPolicyPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50/70" />}>
      <PrivacyPolicyContent />
    </React.Suspense>
  );
}


