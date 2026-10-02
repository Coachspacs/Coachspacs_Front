"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Briefcase,
  Target,
  Dumbbell,
  Apple,
  Mic,
  Leaf,
  Compass,
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";
import { MyPathPreferences } from "@/types/mypath";
import { RobotJourneyBanner } from "../RobotJourneyBanner";
import { categoryService } from "@/services/categoryService";

interface WizardTrackStepProps {
  t: (key: string) => string;
  isAr: boolean;
  preferences: MyPathPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<MyPathPreferences>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  customSkillInput?: string;
  setCustomSkillInput?: (input: string) => void;
  isCustomSkillOpen?: boolean;
  setIsCustomSkillOpen?: (open: boolean) => void;
  onSelectCustomSkill?: () => void;
  onNext: () => void;
  onPrev: () => void;
}

interface AvailableCategoryItem {
  id: number;
  name: string;
  nameAr: string;
  icon: any;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  badgeColor?: string;
}

const AVAILABLE_PLATFORM_CATEGORIES: AvailableCategoryItem[] = [
  {
    id: 1,
    name: "Programming",
    nameAr: "البرمجة وتطوير البرمجيات",
    icon: Code2,
    descAr: "لغات البرمجة، بايثون، وبناء تطبيقات وأنظمة الويب",
    descEn: "Python programming, software development, and web systems",
    badgeAr: "دورات منشورة",
    badgeEn: "Published Courses",
    badgeColor: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  {
    id: 4,
    name: "Business Coaching",
    nameAr: "إدارة وتطوير الأعمال",
    icon: Briefcase,
    descAr: "إطلاق المشاريع، التخطيط الاستراتيجي، ونمو الشركات",
    descEn: "Startup launch, strategic growth, and business leadership",
    badgeAr: "دورات منشورة",
    badgeEn: "Published Courses",
    badgeColor: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  {
    id: 5,
    name: "Career Coaching",
    nameAr: "التدريب المهني وتطوير المسار",
    icon: Target,
    descAr: "اجتياز المقابلات، الترقية الوظيفية، وبناء السيرة الذاتية",
    descEn: "Job interview mastery, career transition, and promotions",
    badgeAr: "دورات منشورة",
    badgeEn: "Published Courses",
    badgeColor: "bg-purple-100 text-purple-800 border border-purple-200",
  },
  {
    id: 7,
    name: "Public Speaking",
    nameAr: "التحدث والإلقاء أمام الجمهور",
    icon: Mic,
    descAr: "الخطابة الاحترافية، العروض التقديمية، وبناء ثقة الصوت",
    descEn: "Public speaking, executive presentations, and confident delivery",
    badgeAr: "دورات منشورة",
    badgeEn: "Published Courses",
    badgeColor: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  {
    id: 2,
    name: "Fitness Coaching",
    nameAr: "اللياقة البدنية والتدريب الرياضي",
    icon: Dumbbell,
    descAr: "بناء القوة، برامج التدريب المنزلي، واللياقة المتكاملة",
    descEn: "Strength training, home workouts, and physical wellness",
    badgeAr: "دورات منشورة",
    badgeEn: "Published Courses",
    badgeColor: "bg-teal-100 text-teal-800 border border-teal-200",
  },
  {
    id: 3,
    name: "Nutrition",
    nameAr: "التغذية العلاجية والصحية",
    icon: Apple,
    descAr: "أساسيات التغذية السليمة، برامج الحمية، ونمط الحياة المتوازن",
    descEn: "Nutrition fundamentals, dietary planning, and healthy lifestyle",
    badgeAr: "دورات منشورة",
    badgeEn: "Published Courses",
    badgeColor: "bg-green-100 text-green-800 border border-green-200",
  },
  {
    id: 6,
    name: "Life & Mindfulness",
    nameAr: "تطوير الذات وجودة الحياة",
    icon: Leaf,
    descAr: "اليقظة الذهنية، عادات النجاح اليومية، والتحكم بالضغوط",
    descEn: "Mindfulness routines, stress management, and daily habits",
    badgeAr: "دورات منشورة",
    badgeEn: "Published Courses",
    badgeColor: "bg-lime-100 text-lime-800 border border-lime-200",
  },
];

export function WizardTrackStep({
  t,
  isAr,
  preferences,
  setPreferences,
  searchQuery,
  setSearchQuery,
  onNext,
  onPrev,
}: WizardTrackStepProps) {
  const [categories, setCategories] = useState<AvailableCategoryItem[]>(AVAILABLE_PLATFORM_CATEGORIES);

  // Sync with live categories from backend API
  useEffect(() => {
    let isCancelled = false;
    categoryService
      .getCategories(isAr ? "ar" : "en")
      .then((liveCats) => {
        if (!isCancelled && liveCats && liveCats.length > 0) {
          // Merge live categories with meta icons & descriptions
          const merged = liveCats.map((cat) => {
            const catId = Number(cat.id);
            const found = AVAILABLE_PLATFORM_CATEGORIES.find((c) => c.id === catId);
            if (found) {
              return {
                ...found,
                name: cat.name || found.name,
                nameAr: isAr ? cat.name : found.nameAr,
              };
            }
            return {
              id: catId,
              name: cat.name,
              nameAr: cat.name,
              icon: Compass,
              descAr: "مسار تعليمي متخصص متوفر على المنصة",
              descEn: "Specialized learning track available on the platform",
              badgeAr: "متوفر حالياً",
              badgeEn: "Active",
              badgeColor: "bg-slate-100 text-slate-800 border border-slate-200",
            };
          });
          setCategories(merged);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [isAr]);

  // Set default category if none chosen
  useEffect(() => {
    if (!preferences.categoryId && categories.length > 0) {
      const first = categories[0];
      setPreferences((prev) => ({
        ...prev,
        categoryId: first.id,
        categoryName: isAr ? first.nameAr : first.name,
        categoryNameAr: first.nameAr,
        track: first.name,
      }));
    }
  }, [categories, preferences.categoryId, isAr, setPreferences]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q) || c.nameAr.toLowerCase().includes(q);
      const descMatch = c.descAr.toLowerCase().includes(q) || c.descEn.toLowerCase().includes(q);
      return nameMatch || descMatch;
    });
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6 relative z-10">
      {/* 1. Animated Interactive Scenic Journey Banner with Moving Robot */}
      <RobotJourneyBanner
        currentStepIndex={1}
        totalSteps={4}
        stepBadge={isAr ? "الخطوة 1 من 4 • اختيار المسار المتاح" : "Step 1 of 4 • Select Available Track"}
        stepCategory={isAr ? "المسارات المنشورة" : "Published Tracks"}
        isAr={isAr}
      />

      {/* 2. Step Header (Centered) */}
      <div className="text-center max-w-xl mx-auto pt-4 sm:pt-6 pb-1 space-y-2.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isAr ? "اختر المسار المتاح الذي ترغب بتعلمه" : "Choose an Available Track on Coach Space"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          {isAr
            ? "نعرض لك فقط المسارات والتخصصات التي تحتوي على دورات منشورة ومتاحة فعلياً على المنصة لبناء مسارك الذكي بنجاح."
            : "We display only published tracks that have active courses on the platform, ensuring your AI roadmap maps to real learning."}
        </p>
      </div>

      {/* 3. Search Filter Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? "ابحث في المسارات المنشورة المتاحة..." : "Search available platform tracks..."}
          className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-2xl py-3 ps-10 pe-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-medium"
        />
        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-200/70 text-slate-600 uppercase tracking-wider">
            {isAr ? "مسارات نشطة" : "Active"}
          </span>
        </div>
      </div>

      {/* 4. Active Tracks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 max-w-2xl mx-auto" role="radiogroup">
        {filteredCategories.map((cat, idx) => {
          const Icon = cat.icon;
          const isSelected = preferences.categoryId === cat.id;

          return (
            <motion.button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                soundFx.playOptionSelect();
                setPreferences({
                  ...preferences,
                  categoryId: cat.id,
                  categoryName: isAr ? cat.nameAr : cat.name,
                  categoryNameAr: cat.nameAr,
                  track: cat.name,
                  customTrackName: "",
                });
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
                      ? "bg-[#0F5244] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      cat.badgeColor || "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {isAr ? cat.badgeAr : cat.badgeEn}
                  </span>
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
                  {isAr ? cat.nameAr : cat.name}
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                  {isAr ? cat.descAr : cat.descEn}
                </p>
              </div>
            </motion.button>
          );
        })}
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
