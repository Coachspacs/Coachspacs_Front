"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Palette,
  TrendingUp,
  Smartphone,
  Cloud,
  Database,
  Search,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";
import { MyPathPreferences, LearningTrack } from "@/types/mypath";
import { RobotJourneyBanner } from "../RobotJourneyBanner";
import { TrackItem } from "./types";

interface WizardTrackStepProps {
  t: (key: string) => string;
  isAr: boolean;
  preferences: MyPathPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<MyPathPreferences>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  customSkillInput: string;
  setCustomSkillInput: (input: string) => void;
  isCustomSkillOpen: boolean;
  setIsCustomSkillOpen: (open: boolean) => void;
  onSelectCustomSkill: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function WizardTrackStep({
  t,
  isAr,
  preferences,
  setPreferences,
  searchQuery,
  setSearchQuery,
  customSkillInput,
  setCustomSkillInput,
  isCustomSkillOpen,
  setIsCustomSkillOpen,
  onSelectCustomSkill,
  onNext,
  onPrev,
}: WizardTrackStepProps) {
  const skillTracks: TrackItem[] = useMemo(
    () => [
      {
        id: "frontend",
        icon: Code2,
        badge: t("wizard.skills.frontend.badge"),
        badgeColor: "bg-[#0F5244] text-white",
      },
      {
        id: "uiux",
        icon: Palette,
        badge: t("wizard.skills.uiux.badge"),
        badgeColor: "bg-sky-100 text-sky-800 border border-sky-200",
      },
      {
        id: "data",
        icon: TrendingUp,
      },
      {
        id: "mobile",
        icon: Smartphone,
      },
      {
        id: "cloud",
        icon: Cloud,
      },
      {
        id: "backend",
        icon: Database,
      },
    ],
    [t]
  );

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skillTracks;
    const q = searchQuery.toLowerCase();
    return skillTracks.filter((s) => {
      const title = t(`wizard.skills.${s.id}.title`).toLowerCase();
      const desc = t(`wizard.skills.${s.id}.desc`).toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [searchQuery, t, skillTracks]);

  return (
    <div className="space-y-6 relative z-10">
      {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
      <RobotJourneyBanner
        currentStepIndex={2}
        totalSteps={4}
        stepBadge={isAr ? "الخطوة 2 من 4 • اختيار المسار" : "Step 2 of 4 • Select Track"}
        stepCategory={isAr ? "التخصص والمسار" : "Track & Domain"}
        isAr={isAr}
      />

      {/* Step Header (Centered) */}
      <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t("wizard.step4Title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          {isAr
            ? "حدد التخصص أو المجال الذي ترغب بتعلمه لنقوم بطرح أسئلة الخبرة وبناء محطات التعلم المناسبة له."
            : "Select your desired track so AI can calibrate your experience assessment and custom milestones."}
        </p>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("wizard.searchPlaceholder")}
          className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl py-3 ps-10 pe-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-medium"
        />
        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-200/70 text-slate-600 uppercase tracking-wider">
            {t("wizard.quickFilter")}
          </span>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 max-w-2xl mx-auto">
        {filteredSkills.map((trackItem, idx) => {
          const Icon = trackItem.icon;
          const isSelected =
            preferences.track === trackItem.id && !preferences.customTrackName;
          const tagsStr = t(`wizard.skills.${trackItem.id}.tags`);
          const tags = tagsStr ? tagsStr.split(",").map((s) => s.trim()) : [];

          return (
            <motion.button
              key={trackItem.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                soundFx.playOptionSelect();
                setPreferences({
                  ...preferences,
                  track: trackItem.id as LearningTrack,
                  customTrackName: "",
                });
                setIsCustomSkillOpen(false);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                isSelected
                  ? "bg-white border-2 border-emerald-400 shadow-xs"
                  : "bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[#0F5244] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  {trackItem.badge && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        trackItem.badgeColor || "bg-[#0F5244] text-white"
                      }`}
                    >
                      {trackItem.badge}
                    </span>
                  )}
                  {isSelected ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {t(`wizard.skills.${trackItem.id}.title`)}
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                  {t(`wizard.skills.${trackItem.id}.desc`)}
                </p>
              </div>

              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Add Custom Skill or Specialty Bar */}
      <div className="space-y-2 pt-1 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setIsCustomSkillOpen(!isCustomSkillOpen)}
          className={`w-full p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
            preferences.customTrackName
              ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/30"
              : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                {preferences.customTrackName
                  ? `${t("wizard.customSkillTitle")}: ${preferences.customTrackName}`
                  : t("wizard.customSkillTitle")}
              </span>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {t("wizard.customSkillDesc")}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-slate-400">
            {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>

        {isCustomSkillOpen && (
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-2xs">
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              placeholder={t("wizard.customSkillInputPlaceholder")}
              className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-medium"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelectCustomSkill();
              }}
            />
            <button
              type="button"
              onClick={onSelectCustomSkill}
              className="px-4 py-2 rounded-xl bg-[#0F5244] text-white text-xs font-bold hover:bg-[#07382E] transition-colors cursor-pointer shrink-0"
            >
              {t("wizard.customSkillConfirm")}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div
        className={`flex items-center justify-between pt-8 max-w-2xl mx-auto ${
          isAr ? "flex-row-reverse" : ""
        }`}
      >
        <button
          type="button"
          onClick={onPrev}
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <span>{t("continue")}</span>
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default WizardTrackStep;
