"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Shield,
  Database,
  UserCheck,
  Lock,
  Eye,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  LegalPageLayout,
  LegalSectionItem,
} from "@/components/legal/LegalPageLayout";

export default function PrivacyPolicyPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = useTranslations("legal");
  const tPrivacy = useTranslations("legal.privacy");

  const sections: LegalSectionItem[] = [
    {
      id: "introduction",
      icon: Shield,
      title: tPrivacy("intro.title"),
      content: (
        <div className="space-y-2">
          <p className="leading-relaxed">{tPrivacy("intro.p1")}</p>
          <p className="leading-relaxed">{tPrivacy("intro.p2")}</p>
        </div>
      ),
    },
    {
      id: "collection",
      icon: Database,
      title: tPrivacy("collection.title"),
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">{tPrivacy("collection.intro")}</p>
          <ul className="space-y-2 list-disc list-inside text-slate-600 ps-2">
            <li>
              <strong className="text-slate-900">
                {tPrivacy("collection.accountLabel")}{" "}
              </strong>
              {tPrivacy("collection.accountValue")}
            </li>
            <li>
              <strong className="text-slate-900">
                {tPrivacy("collection.learningLabel")}{" "}
              </strong>
              {tPrivacy("collection.learningValue")}
            </li>
            <li>
              <strong className="text-slate-900">
                {tPrivacy("collection.instructorLabel")}{" "}
              </strong>
              {tPrivacy("collection.instructorValue")}
            </li>
            <li>
              <strong className="text-slate-900">
                {tPrivacy("collection.techLabel")}{" "}
              </strong>
              {tPrivacy("collection.techValue")}
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "usage",
      icon: UserCheck,
      title: tPrivacy("usage.title"),
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">{tPrivacy("usage.intro")}</p>
          <ul className="space-y-2 list-disc list-inside text-slate-600 ps-2">
            <li>{tPrivacy("usage.point1")}</li>
            <li>{tPrivacy("usage.point2")}</li>
            <li>{tPrivacy("usage.point3")}</li>
            <li>{tPrivacy("usage.point4")}</li>
            <li>{tPrivacy("usage.point5")}</li>
          </ul>
        </div>
      ),
    },
    {
      id: "payments",
      icon: Lock,
      title: tPrivacy("payments.title"),
      content: (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#0F5244] shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-[#0F5244]">
                {tPrivacy("payments.badgeStrong")}{" "}
              </strong>
              {tPrivacy("payments.badgeText")}
            </div>
          </div>
          <p className="leading-relaxed">{tPrivacy("payments.description")}</p>
        </div>
      ),
    },
    {
      id: "cookies",
      icon: Eye,
      title: tPrivacy("cookies.title"),
      content: (
        <p className="leading-relaxed">{tPrivacy("cookies.content")}</p>
      ),
    },
    {
      id: "rights",
      icon: FileText,
      title: tPrivacy("rights.title"),
      content: (
        <div className="space-y-2">
          <p className="leading-relaxed">{tPrivacy("rights.intro")}</p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 ps-2">
            <li>{tPrivacy("rights.point1")}</li>
            <li>{tPrivacy("rights.point2")}</li>
            <li>{tPrivacy("rights.point3")}</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <LegalPageLayout
      locale={locale}
      backToHomeText={t("backToHome")}
      badgeText={tPrivacy("badge")}
      badgeIcon={Sparkles}
      title={tPrivacy("title")}
      lastUpdatedText={t("lastUpdated", {
        date: tPrivacy("lastUpdatedDate"),
      })}
      subtitle={tPrivacy("subtitle")}
      sections={sections}
      contactTitle={tPrivacy("contact.title")}
      contactDescription={tPrivacy("contact.description")}
      contactEmail={t("supportEmail")}
    />
  );
}
