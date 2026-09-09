"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  UserCheck,
  BookOpen,
  Award,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  LegalPageLayout,
  LegalSectionItem,
} from "@/components/legal/LegalPageLayout";

export default function TermsOfServicePage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = useTranslations("legal");
  const tTerms = useTranslations("legal.terms");

  const sections: LegalSectionItem[] = [
    {
      id: "acceptance",
      icon: CheckCircle2,
      title: tTerms("acceptance.title"),
      content: (
        <p className="leading-relaxed">
          {tTerms("acceptance.content")}
        </p>
      ),
    },
    {
      id: "accounts",
      icon: UserCheck,
      title: tTerms("accounts.title"),
      content: (
        <div className="space-y-2">
          <p className="leading-relaxed">{tTerms("accounts.intro")}</p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 ps-2">
            <li>{tTerms("accounts.point1")}</li>
            <li>{tTerms("accounts.point2")}</li>
            <li>{tTerms("accounts.point3")}</li>
          </ul>
        </div>
      ),
    },
    {
      id: "license",
      icon: BookOpen,
      title: tTerms("license.title"),
      content: (
        <div className="space-y-2">
          <p className="leading-relaxed">{tTerms("license.intro")}</p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 ps-2">
            <li>{tTerms("license.point1")}</li>
            <li>{tTerms("license.point2")}</li>
          </ul>
        </div>
      ),
    },
    {
      id: "certificates",
      icon: Award,
      title: tTerms("certificates.title"),
      content: (
        <p className="leading-relaxed">
          {tTerms("certificates.content")}
        </p>
      ),
    },
    {
      id: "conduct",
      icon: ShieldAlert,
      title: tTerms("conduct.title"),
      content: (
        <div className="space-y-2">
          <p className="leading-relaxed">{tTerms("conduct.intro")}</p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 ps-2">
            <li>{tTerms("conduct.point1")}</li>
            <li>{tTerms("conduct.point2")}</li>
            <li>{tTerms("conduct.point3")}</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <LegalPageLayout
      locale={locale}
      backToHomeText={t("backToHome")}
      badgeText={tTerms("badge")}
      badgeIcon={Sparkles}
      title={tTerms("title")}
      lastUpdatedText={t("lastUpdated", { date: tTerms("lastUpdatedDate") })}
      subtitle={tTerms("subtitle")}
      sections={sections}
      contactTitle={tTerms("contact.title")}
      contactDescription={tTerms("contact.description")}
      contactEmail={t("supportEmail")}
    />
  );
}
