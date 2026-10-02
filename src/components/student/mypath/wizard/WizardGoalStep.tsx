"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Check,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";
import { MyPathPreferences, LearningGoal } from "@/types/mypath";
import { RobotJourneyBanner } from "../RobotJourneyBanner";

interface WizardGoalStepProps {
  t: (key: string) => string;
  isAr: boolean;
  preferences: MyPathPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<MyPathPreferences>>;
  onNext: () => void;
  onPrev: () => void;
}

export function WizardGoalStep({
  t,
  isAr,
  preferences,
  setPreferences,
  onNext,
  onPrev,
}: WizardGoalStepProps) {
  // Dynamic suggestions tailored to the student's chosen category
  const categorySuggestions = useMemo(() => {
    switch (preferences.categoryId) {
      case 1: // Programming
        return isAr
          ? [
              "أريد أن أصبح مبرمج بايثون محترف وبناء أنظمة متكاملة",
              "إتقان كتابة الكود وبناء مشاريع برمجية حقيقية",
              "الاستعداد لسوق العمل البرمجي والوظائف التقنية",
            ]
          : [
              "I want to become a professional Python backend engineer",
              "Master coding and build real-world software applications",
              "Prepare for software engineering roles in the tech industry",
            ];
      case 4: // Business Coaching
        return isAr
          ? [
              "إطلاق مشروعي التجاري الخاص وإدارته باحترافية",
              "بناء خطة عمل واستراتيجية نمو قابلة للتوسع",
              "تطوير مهارات القيادة وإدارة فرق العمل",
            ]
          : [
              "Launch and scale my own successful coaching business",
              "Develop a viable strategic business plan and sales growth",
              "Master leadership and organizational management",
            ];
      case 5: // Career Coaching
        return isAr
          ? [
              "اجتياز المقابلات الوظيفية بنجاح والحصول على عرض عمل",
              "تسريع ترقيتي المهنية وتطوير مهاراتي القيادية",
              "بناء مسار وظيفي واضح والانتقال لمجال جديد",
            ]
          : [
              "Ace job interviews and secure top employment offers",
              "Accelerate my promotion and executive leadership presence",
              "Pivot my career path into a high-growth domain",
            ];
      case 7: // Public Speaking
        return isAr
          ? [
              "التحدث بثقة أمام الجمهور وإلقاء عروض تقديمية مؤثرة",
              "التغلب على رهبة المسرح وبناء نبرة صوت احترافية",
            ]
          : [
              "Speak with unshakable confidence in front of large audiences",
              "Master stage presence and articulate compelling presentations",
            ];
      case 2: // Fitness Coaching
        return isAr
          ? [
              "بناء جدول تمارين منزلية لزيادة القوة واللياقة",
              "تحسين اللياقة البدنية والوصول إلى أفضل مستوى صحي",
            ]
          : [
              "Establish a structured home workout routine to build strength",
              "Optimize cardiovascular fitness and holistic physical wellness",
            ];
      case 3: // Nutrition
        return isAr
          ? [
              "إتقان أسس التغذية الصحية السليمة وتصميم وجبات متوازنة",
              "فهم المبادئ الغذائية للوصول لنمط حياة صحي مستدام",
            ]
          : [
              "Master balanced meal nutrition and dietary fundamentals",
              "Adopt a sustainable healthy lifestyle and nutritional wellness",
            ];
      case 6: // Life & Mindfulness
        return isAr
          ? [
              "بناء عادات يومية إيجابية وإدارة الضغوط بفاعلية",
              "تعزيز التركيز واليقظة الذهنية وجودة الحياة",
            ]
          : [
              "Build daily mindfulness habits and master stress regulation",
              "Enhance life focus, clarity, and overall peace of mind",
            ];
      default:
        return isAr
          ? [
              "أريد بناء مهارات متقدمة والوصول إلى أهدافي المهنية",
              "إتقان هذا المجال وبناء مشاريع عملية متكاملة",
            ]
          : [
              "I want to build in-depth skills and achieve my career objectives",
              "Master this field and complete high-impact projects",
            ];
    }
  }, [preferences.categoryId, isAr]);

  const currentGoalText = preferences.goalText || "";

  const handleSelectSuggestion = (text: string) => {
    soundFx.playOptionSelect();
    setPreferences((prev) => ({
      ...prev,
      goalText: text,
      toolsAndTechStack: text,
      customTrackName: text,
    }));
  };

  const handleContinue = () => {
    // Ensure goalText is not empty before moving forward
    if (!currentGoalText.trim()) {
      const defaultText = categorySuggestions[0] || (isAr ? "أريد بناء مسار تعليمي متكامل" : "I want to build a comprehensive learning roadmap");
      setPreferences((prev) => ({
        ...prev,
        goalText: defaultText,
        toolsAndTechStack: defaultText,
        customTrackName: defaultText,
      }));
    }
    onNext();
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* 1. Animated Interactive Scenic Journey Banner with Moving Robot */}
      <RobotJourneyBanner
        currentStepIndex={2}
        totalSteps={4}
        stepBadge={isAr ? "الخطوة 2 من 4 • تحديد الهدف" : "Step 2 of 4 • Set Goal"}
        stepCategory={isAr ? "الهدف المنشود" : "Target Goal"}
        isAr={isAr}
      />

      {/* 2. Step Header (Centered) */}
      <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isAr ? "ما هو هدفك التعليمي من هذا المسار؟" : "What is your main goal for this roadmap?"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          {isAr
            ? "اكتب طموحك بكلماتك أو اختر من المقترحات الذكية، ليقوم الذكاء الاصطناعي بمطابقة الكورسات وبناء الخارطة الأنسب."
            : "Describe your ambition in your own words or click a recommendation so the AI can precisely formulate your journey."}
        </p>
      </div>

      {/* 3. Goal Text Input Area */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 shadow-xs p-5 sm:p-6 space-y-3.5 transition-all text-start">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "هدفـك المخصص (goal_text):" : "Your specific goal:"}</span>
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              {currentGoalText.length} / 300
            </span>
          </div>

          <textarea
            rows={3}
            maxLength={300}
            value={currentGoalText}
            onChange={(e) => {
              const val = e.target.value;
              setPreferences((prev) => ({
                ...prev,
                goalText: val,
                toolsAndTechStack: val,
                customTrackName: val,
              }));
            }}
            placeholder={
              isAr
                ? "مثال: أريد أن أصبح مبرمج بايثون محترف، أو إطلاق مشروعي التجاري، أو الاستعداد للمقابلات الوظيفية..."
                : "e.g., I want to master Python programming, launch my coaching business, or ace job interviews..."
            }
            className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all resize-none font-medium leading-relaxed"
          />

          {/* Smart Category Suggestions */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAr ? "مقترحات سريعة بنقرة واحدة:" : "Quick suggestions (click to apply):"}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {categorySuggestions.map((suggestion, idx) => {
                const isSelected = currentGoalText === suggestion;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`text-xs px-3.5 py-2 rounded-xl border text-start transition-all cursor-pointer font-medium ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                        : "bg-slate-50 hover:bg-white border-slate-200/90 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. High-level Purpose Pills */}
        <div className="space-y-2 text-start">
          <label className="text-xs font-bold text-slate-600 px-1">
            {isAr ? "طبيعة الهدف العام:" : "High-level objective category:"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: "job", icon: Briefcase, labelAr: "الحصول على وظيفة", labelEn: "Land a Job" },
              { id: "skills", icon: TrendingUp, labelAr: "إتقان مهارات عملية", labelEn: "Practical Skills" },
              { id: "exam", icon: GraduationCap, labelAr: "الاستعداد للشهادات", labelEn: "Certifications" },
              { id: "growth", icon: Sparkles, labelAr: "الارتقاء المهني", labelEn: "Career Growth" },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = preferences.goal === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundFx.playOptionSelect();
                    setPreferences((prev) => ({ ...prev, goal: item.id as LearningGoal }));
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-50 border-2 border-emerald-400 text-[#0F5244] font-bold shadow-xs"
                      : "bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold leading-tight">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Navigation Buttons */}
      <div
        className={`flex items-center justify-between pt-6 max-w-2xl mx-auto ${
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
          onClick={handleContinue}
          className="inline-flex items-center gap-2 bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold px-7 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <span>{t("continue")}</span>
          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default WizardGoalStep;
