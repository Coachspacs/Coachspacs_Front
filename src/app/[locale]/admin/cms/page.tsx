"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Palette,
  FileText,
  ShieldCheck,
  Eye,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { GlobalBrandingConfig, LandingPageDoc, LegalPagesDoc } from "@/types/cms";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export default function CmsOverviewPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const t = useTranslations("cms");

  const [branding, setBranding] = useState<GlobalBrandingConfig | null>(null);
  const [landingDoc, setLandingDoc] = useState<LandingPageDoc | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalPagesDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCmsOverview() {
      try {
        const res = await fetch("/api/cms/content");
        const json = await res.json();
        if (json.success) {
          setBranding(json.branding);
          setLandingDoc(json.landing);
          setLegalDoc(json.legal);
        }
      } catch (e) {
        console.warn("Failed to load CMS overview data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCmsOverview();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const json = await res.json();
      if (json.success) {
        setLandingDoc(json.landing);
        setStatusMessage(t("overview.publishSuccess"));
      }
    } catch (e) {
      setStatusMessage(t("overview.publishFailed"));
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 sm:p-20">
        <Loader2 className="w-8 h-8 text-[#0F5244] animate-spin" />
      </div>
    );
  }

  const hasDraft = landingDoc?.status === "has_draft_changes";
  const hasLegalDraft = legalDoc?.status === "has_draft_changes";

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* Welcome Banner with subtle depth gradient & enhanced visual hierarchy */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden bg-gradient-to-b from-[#0F5244] via-[#0B4438] to-[#062E25] border border-emerald-700/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-md text-white"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* High-contrast tag badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/35 text-white text-xs font-black backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t("overview.tag")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {t("overview.heading")}
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              {t("overview.description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            {/* Secondary Action: Preview Draft */}
            <Link
              href={`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`}
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 backdrop-blur-xs"
            >
              <Eye className="w-4 h-4 text-emerald-300" />
              <span>{t("overview.previewDraft")}</span>
            </Link>

            {/* Primary CTA: Publish Live - Prominently sized with distinct shadow */}
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 text-xs sm:text-sm font-black bg-white hover:bg-slate-50 text-[#0F5244] rounded-2xl shadow-md shadow-black/25 hover:shadow-lg hover:shadow-black/35 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0F5244]" />
              ) : (
                <Send className="w-4 h-4 rtl:rotate-180" />
              )}
              <span>{t("overview.publishLive")}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mt-6 p-4 rounded-2xl bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-xs shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Grid of Control Modules - Staggered entrance animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
      >
        {/* Module 1: Global Branding */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 ease-out group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200/80 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-300 transition-all duration-200 ease-out shrink-0">
                <Palette className="w-6 h-6 text-[#0F5244]" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 px-3 py-1 rounded-full bg-slate-100 border border-slate-300/80 shadow-2xs">
                {t("overview.brandingCard.tag")}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0F5244] transition-colors">
                {t("overview.brandingCard.title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                {t("overview.brandingCard.desc")}
              </p>
            </div>

            {/* Current Swatches with Tooltips & Hover Scale */}
            {branding && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold me-1">
                  {t("overview.activeColors")}
                </span>
                {[
                  { key: "main", color: branding.colors.primaryMain, label: "Primary Main" },
                  { key: "dark", color: branding.colors.primaryDark, label: "Primary Dark" },
                  { key: "light", color: branding.colors.primaryLight, label: "Primary Light" },
                  { key: "mint", color: branding.colors.accentMint, label: "Accent Mint" },
                ].map((swatch) => (
                  <div key={swatch.key} className="relative group/swatch flex items-center justify-center">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 transition-transform duration-200 group-hover/swatch:scale-125 cursor-pointer block shadow-2xs"
                      style={{ backgroundColor: swatch.color }}
                    />
                    {/* Tooltip with hex code */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold opacity-0 pointer-events-none group-hover/swatch:opacity-100 transition-all duration-150 whitespace-nowrap z-20 scale-95 group-hover/swatch:scale-100 shadow-md">
                      {swatch.color}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-5 mt-auto">
            <Link
              href={`/${locale}/admin/cms/branding`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 hover:bg-[#0F5244] hover:text-white text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer border border-slate-200 hover:border-[#0F5244] shadow-2xs"
            >
              <span>{t("overview.brandingCard.btn")}</span>
            </Link>
          </div>
        </motion.div>

        {/* Module 2: Landing Page Sections */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 ease-out group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200/80 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-300 transition-all duration-200 ease-out shrink-0">
                <FileText className="w-6 h-6 text-[#0F5244]" />
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${
                  hasDraft
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hasDraft ? "bg-amber-600" : "bg-emerald-600"}`} />
                <span>{hasDraft ? t("overview.draftPending") : t("overview.published")}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0F5244] transition-colors">
                {t("overview.landingCard.title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                {t("overview.landingCard.desc")}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {t("overview.lastUpdated")}
                {landingDoc?.updatedAt
                  ? new Date(landingDoc.updatedAt).toLocaleString(isAr ? "ar-EG" : "en-US")
                  : t("overview.recently")}
              </span>
            </div>
          </div>

          <div className="pt-5 mt-auto">
            <Link
              href={`/${locale}/admin/cms/landing`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 hover:bg-[#0F5244] hover:text-white text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer border border-slate-200 hover:border-[#0F5244] shadow-2xs"
            >
              <span>{t("overview.landingCard.btn")}</span>
            </Link>
          </div>
        </motion.div>

        {/* Module 3: Legal & Static Pages (Privacy Policy, Terms of Service) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 ease-out group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200/80 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-300 transition-all duration-200 ease-out shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#0F5244]" />
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${
                  hasLegalDraft
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hasLegalDraft ? "bg-amber-600" : "bg-emerald-600"}`} />
                <span>{hasLegalDraft ? t("overview.draftPending") : t("overview.published")}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0F5244] transition-colors">
                {t("overview.legalCard.title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                {t("overview.legalCard.desc")}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {t("overview.lastUpdated")}
                {legalDoc?.updatedAt
                  ? new Date(legalDoc.updatedAt).toLocaleString(isAr ? "ar-EG" : "en-US")
                  : t("overview.recently")}
              </span>
            </div>
          </div>

          <div className="pt-5 mt-auto">
            <Link
              href={`/${locale}/admin/cms/pages`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 hover:bg-[#0F5244] hover:text-white text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer border border-slate-200 hover:border-[#0F5244] shadow-2xs"
            >
              <span>{t("overview.legalCard.btn")}</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

