"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { MyPathPreferences } from "@/types/mypath";
import { RobotJourneyBanner } from "../RobotJourneyBanner";

interface WizardExperienceStepProps {
  t: (key: string) => string;
  isAr: boolean;
  preferences: MyPathPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<MyPathPreferences>>;
  onGenerate: () => void;
  onPrev: () => void;
}

export function WizardExperienceStep({
  t,
  isAr,
  preferences,
  setPreferences,
  onGenerate,
  onPrev,
}: WizardExperienceStepProps) {
  return (
    <div className="space-y-6 relative z-10">
      {/* Animated Interactive Scenic Journey Banner with Moving Robot */}
      <RobotJourneyBanner
        currentStepIndex={4}
        totalSteps={4}
        stepBadge={isAr ? "الخطوة 4 من 4 • تقييم الخبرة" : "Step 4 of 4 • Experience Assessment"}
        stepCategory={isAr ? "الخبرة السابقة" : "Prior Experience"}
        isAr={isAr}
      />

      {/* Step Header */}
      <div className="text-center max-w-xl mx-auto pt-3 sm:pt-5 pb-1 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {isAr ? "أخبرنا عن خبرتك العملية ومشاريعك السابقة" : "Tell us about your prior experience and background"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {isAr
            ? "تساعدنا هذه الإجابات في تحديد نقطة انطلاقك الدقيقة وتخطي المواضيع التي تتقنها مسبقاً لتوفير وقتك."
            : "These details allow the AI to pinpoint your exact starting point and bypass concepts you already know."}
        </p>
      </div>

      {/* Question 1 & Question 2 Cards */}
      <div className="space-y-5 pt-1 max-w-2xl mx-auto">
        {/* Question 1 Card: Previous Experience & Projects */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300/90 shadow-[0_6px_24px_-4px_rgba(15,82,68,0.06)] hover:shadow-[0_12px_32px_-6px_rgba(15,82,68,0.12)] p-5 sm:p-6 space-y-4 transition-all duration-300 text-start group"
        >
          <div className="flex items-baseline gap-2 text-start">
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              <span className="text-emerald-700 font-black me-2 text-base sm:text-lg inline-block">1.</span>
              {isAr
                ? "ما هي خبرتك السابقة أو المشاريع التي قمت ببنائها في هذا التخصص؟"
                : "What is your prior experience or projects built in this field?"}
            </h3>
          </div>

          {/* Textarea */}
          <div className="relative group/input">
            <textarea
              rows={3}
              maxLength={500}
              value={preferences.previousExperience || preferences.targetProjectOutcome || ""}
              onChange={(e) => {
                const val = e.target.value;
                setPreferences({
                  ...preferences,
                  previousExperience: val,
                  targetProjectOutcome: val,
                });
              }}
              placeholder={
                isAr
                  ? "مثال: بنيت مواقع شخصية بسيطة، طبّقت مشاريع دورات تدريبية، أو ليس لدي أي خبرة أو مشاريع سابقة بعد..."
                  : "e.g., Built personal landing pages, completed tutorial practice projects, or no prior projects yet..."
              }
              className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all resize-none font-medium leading-relaxed shadow-2xs"
            />
            <div className="flex items-center justify-between pt-1.5 px-1">
              <span className="text-[10px] text-slate-400 font-medium">
                {isAr ? "كلما كان وصفك واضحاً، كانت نقطة البداية أكثر ملاءمة" : "Precise answers help AI set your exact starting milestone"}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                {(preferences.previousExperience || preferences.targetProjectOutcome || "").length} / 500
              </span>
            </div>
          </div>
        </motion.div>

        {/* Question 2 Card: Tech Stack & Tools Used */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300/90 shadow-[0_6px_24px_-4px_rgba(15,82,68,0.06)] hover:shadow-[0_12px_32px_-6px_rgba(15,82,68,0.12)] p-5 sm:p-6 space-y-4 transition-all duration-300 text-start group"
        >
          <div className="flex items-baseline gap-2 text-start">
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              <span className="text-emerald-700 font-black me-2 text-base sm:text-lg inline-block">2.</span>
              {isAr
                ? "ما هي الأدوات، اللغات، أو التقنيات (Tech Stack) التي تجيدها أو استخدمتها سابقاً؟"
                : "What tools, programming languages, or tech stacks have you used?"}
            </h3>
          </div>

          {/* Textarea */}
          <div className="relative group/input">
            <textarea
              rows={3}
              maxLength={500}
              value={preferences.toolsAndTechStack || preferences.learningChallenges || ""}
              onChange={(e) => {
                const val = e.target.value;
                setPreferences({
                  ...preferences,
                  toolsAndTechStack: val,
                  learningChallenges: val,
                });
              }}
              placeholder={
                isAr
                  ? "مثال: أساسيات HTML/CSS، لغة JavaScript، تصاميم Figma، مكتبة React، أو لا توجد أدوات سابقة..."
                  : "e.g., HTML/CSS basics, JavaScript, React, Figma UI, Git, or Python..."
              }
              className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all resize-none font-medium leading-relaxed shadow-2xs"
            />
            <div className="flex items-center justify-between pt-1.5 px-1">
              <span className="text-[10px] text-slate-400 font-medium">
                {isAr ? "يساعد الذكاء الاصطناعي على بناء تطبيقات ومشاريع تناسب خبرتك التقنية" : "Helps AI recommend appropriate toolchains and exercises"}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                {(preferences.toolsAndTechStack || preferences.learningChallenges || "").length} / 500
              </span>
            </div>
          </div>
        </motion.div>

        {/* Security & Privacy AI Guarantee Note */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/80 p-3.5 sm:p-4 flex items-center gap-3.5 shadow-xs text-start">
          <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200/80 text-[#0F5244] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <p className="text-xs text-emerald-950 font-bold leading-relaxed">
            {isAr
              ? "كافة بياناتك وخبرتك السابقة تُستخدم حصرياً لمعايرة مسارك التعليمي الذكي وتخطي الأساسيات المكررة."
              : "Your experience inputs are strictly encrypted and used exclusively by AI to calibrate your custom curriculum."}
          </p>
        </div>
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
          onClick={onGenerate}
          className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <span>{t("wizard.generateRoadmapBtn")}</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default WizardExperienceStep;
