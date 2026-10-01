"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { AiArchitectGenerationScreen } from "./AiArchitectGenerationScreen";
import { InteractiveCurriculumMap } from "./InteractiveCurriculumMap";
import {
  useMyPathWizard,
  WizardLandingOverview,
  WizardGoalStep,
  WizardTrackStep,
  WizardLevelStep,
  WizardExperienceStep,
} from "./wizard";

export function MyPathWizard() {
  const t = useTranslations("myPath");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const {
    step,
    preferences,
    setPreferences,
    searchQuery,
    setSearchQuery,
    customSkillInput,
    setCustomSkillInput,
    isCustomSkillOpen,
    setIsCustomSkillOpen,
    roadmap,
    goToNextStep,
    goToPrevStep,
    handleStartAssessment,
    handleGenerationComplete,
    handleMilestoneToggle,
    handleReorderMilestones,
    handleRegenerate,
    handleSelectCustomSkill,
  } = useMyPathWizard(t);

  return (
    <motion.section
      aria-labelledby="mypath-heading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full font-sans"
    >
      <div
        className={`transition-all relative ${
          step === 7
            ? "bg-transparent border-0 p-0 shadow-none"
            : "bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden p-5 sm:p-7"
        }`}
      >
        {/* Subtle Ambient Background Gradient matching Coach Space emerald tone */}
        {step !== 7 && (
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* STEP 1: WELCOME & OVERVIEW */}
        {step === 1 && (
          <WizardLandingOverview
            t={t}
            isAr={isAr}
            locale={locale}
            onStartAssessment={handleStartAssessment}
          />
        )}

        {/* STEP 2 (WIZARD 1 OF 4): GOAL ASSESSMENT */}
        {step === 2 && (
          <WizardGoalStep
            t={t}
            isAr={isAr}
            preferences={preferences}
            setPreferences={setPreferences}
            onNext={() => goToNextStep(3)}
            onPrev={() => goToPrevStep(1)}
          />
        )}

        {/* STEP 3 (WIZARD 2 OF 4): SKILL FOCUS & TRACK SELECTION */}
        {step === 3 && (
          <WizardTrackStep
            t={t}
            isAr={isAr}
            preferences={preferences}
            setPreferences={setPreferences}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            customSkillInput={customSkillInput}
            setCustomSkillInput={setCustomSkillInput}
            isCustomSkillOpen={isCustomSkillOpen}
            setIsCustomSkillOpen={setIsCustomSkillOpen}
            onSelectCustomSkill={handleSelectCustomSkill}
            onNext={() => goToNextStep(4)}
            onPrev={() => goToPrevStep(2)}
          />
        )}

        {/* STEP 4 (WIZARD 3 OF 4): KNOWLEDGE LEVEL ASSESSMENT */}
        {step === 4 && (
          <WizardLevelStep
            t={t}
            isAr={isAr}
            preferences={preferences}
            setPreferences={setPreferences}
            onNext={() => goToNextStep(5)}
            onPrev={() => goToPrevStep(3)}
          />
        )}

        {/* STEP 5 (WIZARD 4 OF 4): PRACTICAL EXPERIENCE & TECH STACK (FINAL STEP) */}
        {step === 5 && (
          <WizardExperienceStep
            t={t}
            isAr={isAr}
            preferences={preferences}
            setPreferences={setPreferences}
            onGenerate={() => goToNextStep(6)}
            onPrev={() => goToPrevStep(4)}
          />
        )}

        {/* STEP 6: AI GENERATING SIMULATION (AI ARCHITECT SCREEN) */}
        {step === 6 && (
          <AiArchitectGenerationScreen
            preferences={preferences}
            isAr={isAr}
            onComplete={handleGenerationComplete}
            onAdjustPreferences={() => goToPrevStep(5)}
          />
        )}

        {/* STEP 7: CREATIVE INTERACTIVE VISUAL CURRICULUM ROADMAP */}
        {step === 7 && roadmap && (
          <InteractiveCurriculumMap
            roadmap={roadmap}
            preferences={preferences}
            isAr={isAr}
            locale={locale}
            onMilestoneToggle={handleMilestoneToggle}
            onReorderMilestones={handleReorderMilestones}
            onRegenerate={handleRegenerate}
            onEditPreferences={() => goToPrevStep(5)}
          />
        )}
      </div>
    </motion.section>
  );
}

export default MyPathWizard;
