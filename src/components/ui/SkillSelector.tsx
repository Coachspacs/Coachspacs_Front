"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, X, Search, Sparkles, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export interface SkillSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  maxSuggestions?: number;
  suggestedSkills?: string[];
  isAr?: boolean;
  className?: string;
  label?: string;
}

// 45 Curated Standard Skills (English & Arabic equivalents / domains)
export const DEFAULT_45_SKILLS: string[] = [
  "Next.js",
  "React.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "System Design",
  "Cloud Architecture",
  "AWS",
  "Google Cloud (GCP)",
  "DevOps & CI/CD",
  "Docker & Kubernetes",
  "Artificial Intelligence (AI)",
  "Machine Learning",
  "Data Science & Analytics",
  "Cyber Security",
  "UI/UX Design",
  "Figma",
  "Product Management",
  "Executive Leadership",
  "Agile & Scrum Coaching",
  "Full-Stack Web Development",
  "Mobile App Development",
  "Flutter",
  "React Native",
  "Clean Code & Architecture",
  "Database Engineering",
  "PostgreSQL",
  "MongoDB",
  "GraphQL & REST APIs",
  "Tailwind CSS",
  "Microservices",
  "Career Mentorship",
  "Public Speaking",
  "Problem Solving & Algorithms",
  "SEO & Digital Marketing",
  "Business Strategy",
  "Finance & Accounting",
  "إدارة المشاريع الاحترافية",
  "الذكاء الاصطناعي",
  "الأمن السيبراني",
  "القيادة التنفيذية",
  "تصميم تجربة المستخدم (UI/UX)",
  "علم البيانات وتحليل الأعمال",
  "التسويق الرقمي",
];

interface FlyingGhost {
  id: string;
  skill: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export function SkillSelector({
  selectedSkills = [],
  onChange,
  maxSkills = 6,
  maxSuggestions = 6,
  suggestedSkills = DEFAULT_45_SKILLS,
  isAr = false,
  className = "",
  label,
}: SkillSelectorProps) {
  const t = useTranslations("skillSelector");
  const [searchQuery, setSearchQuery] = useState("");
  const [ghosts, setGhosts] = useState<FlyingGhost[]>([]);
  const [limitWarning, setLimitWarning] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedContainerRef = useRef<HTMLDivElement>(null);

  // Filter available suggestions based on search query and already selected skills
  const availableSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return suggestedSkills.filter((skill) => {
      const isAlreadySelected = selectedSkills.includes(skill);
      if (isAlreadySelected) return false;
      if (!query) return true;
      return skill.toLowerCase().includes(query);
    });
  }, [suggestedSkills, selectedSkills, searchQuery]);

  // Limit to only 6 visible suggestions at a time as requested
  const visibleSuggestions = useMemo(() => {
    return availableSuggestions.slice(0, maxSuggestions);
  }, [availableSuggestions, maxSuggestions]);

  const isExactSuggestion = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return false;
    return (
      suggestedSkills.some((s) => s.toLowerCase() === query) ||
      selectedSkills.some((s) => s.toLowerCase() === query)
    );
  }, [suggestedSkills, selectedSkills, searchQuery]);

  // Show a temporary warning if limit is reached
  const triggerLimitWarning = useCallback(() => {
    setLimitWarning(true);
    setTimeout(() => setLimitWarning(false), 2400);
  }, []);

  // Add skill handler with Bezier flying animation
  const handleAddSkill = (skillToAdd: string, sourceElement?: HTMLElement | null) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;

    if (selectedSkills.includes(trimmed)) {
      setSearchQuery("");
      return;
    }

    if (selectedSkills.length >= maxSkills) {
      triggerLimitWarning();
      return;
    }

    // Trigger Bezier Flight effect if source coordinates are available
    if (sourceElement && selectedContainerRef.current) {
      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = selectedContainerRef.current.getBoundingClientRect();

      const ghostId = `ghost-${Date.now()}-${Math.random()}`;
      const newGhost: FlyingGhost = {
        id: ghostId,
        skill: trimmed,
        startX: sourceRect.left,
        startY: sourceRect.top,
        targetX: targetRect.left + Math.min(selectedSkills.length * 90, targetRect.width - 100),
        targetY: targetRect.top + 10,
      };

      setGhosts((prev) => [...prev, newGhost]);

      // Remove ghost after flight
      setTimeout(() => {
        setGhosts((prev) => prev.filter((g) => g.id !== ghostId));
      }, 450);
    }

    // Update selected skills
    const newSkills = [...selectedSkills, trimmed];
    onChange(newSkills);

    // Reset search query
    setSearchQuery("");
  };

  // Remove skill handler
  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter((s) => s !== skillToRemove);
    onChange(newSkills);
  };

  const isMaxReached = selectedSkills.length >= maxSkills;

  return (
    <div className={`space-y-4 font-sans select-none ${className}`} dir={isAr ? "rtl" : "ltr"}>
      {/* Flight Overlay for Bezier Curve animation */}
      <AnimatePresence>
        {ghosts.map((ghost) => (
          <motion.div
            key={ghost.id}
            initial={{
              position: "fixed",
              left: ghost.startX,
              top: ghost.startY,
              opacity: 0.95,
              scale: 0.9,
              zIndex: 9999,
              pointerEvents: "none",
            }}
            animate={{
              left: ghost.targetX,
              top: ghost.targetY,
              opacity: 1,
              scale: 1,
              backgroundColor: "#E6F3EF",
              color: "#0F5244",
              borderColor: "#45D1B4",
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1], // Smooth natural Ease-Out Bezier
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-lg flex items-center gap-1.5"
          >
            <span>{ghost.skill}</span>
            <Check className="h-3 w-3 text-emerald-600" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#0F5244]" />
            <span>
              {label || t("defaultLabel")}
            </span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            {t("chooseUpTo", { max: maxSkills })}
          </span>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border transition-colors ${
              isMaxReached
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-[#0F5244] border-emerald-200/70"
            }`}
          >
            {selectedSkills.length} / {maxSkills}
          </span>
        </div>
      </div>

      {/* Max Limit Warning Banner */}
      <AnimatePresence>
        {limitWarning && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              {t("maxLimitReached", { max: maxSkills })}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP BOX: Selected Skills (Flexbox, Max 6) + Search Input */}
      <LayoutGroup id="selected-skills-group">
        <div
          ref={selectedContainerRef}
          className="p-3.5 rounded-2xl border-2 border-slate-200/90 bg-white min-h-[64px] flex flex-wrap items-center gap-2 shadow-2xs transition-all focus-within:border-[#0F5244] focus-within:ring-4 focus-within:ring-[#0F5244]/10"
        >
          {/* Selected Skills Tags */}
          <AnimatePresence mode="popLayout">
            {selectedSkills.map((skill) => (
              <motion.span
                key={skill}
                layout
                initial={{ opacity: 0, scale: 0.2, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                }}
                transition={{
                  layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.25 },
                  scale: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E6F3EF] text-[#0F5244] border border-[#A7E2D4] text-xs font-bold shadow-2xs group hover:bg-[#D9EFE8] transition-colors"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSkill(skill);
                  }}
                  className="hover:text-rose-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-rose-50 text-[#0F5244]/70"
                  title={t("removeSkill", { skill })}
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Search Input inline */}
          <div className="flex-1 min-w-[180px] flex items-center gap-2 py-1">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    handleAddSkill(searchQuery.trim());
                  }
                }
              }}
              placeholder={
                selectedSkills.length === 0
                  ? t("searchPlaceholderEmpty")
                  : t("searchPlaceholderMore")
              }
              className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </LayoutGroup>

      {/* 2. BOTTOM BOX: Suggested Options Grid (Max 6 visible at a time) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F5244]" />
            <span>
              {searchQuery.trim()
                ? t("matchingResults")
                : t("suggestedOptions")}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-400">
            {t("suggestedCount", { count: visibleSuggestions.length })}
          </span>
        </div>

        {/* Suggested Skills Grid with Fluid Layout Animations (Max 6) */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 min-h-[52px]">
          <LayoutGroup id="suggested-skills-group">
            <motion.div layout className="flex flex-wrap items-center gap-2">
              {/* Custom Add Button if typed query is not an exact match */}
              <AnimatePresence>
                {searchQuery.trim() && !isExactSuggestion && (
                  <motion.button
                    layout
                    key="custom-add-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    type="button"
                    onClick={(e) => handleAddSkill(searchQuery, e.currentTarget)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F5244] text-white text-xs font-bold shadow-xs hover:bg-[#0A3D32] active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-[#45D1B4]" />
                    <span>
                      {t("addCustomSkill", { query: searchQuery.trim() })}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Grid / Tags of Visible Suggestions (Max 6) */}
              <AnimatePresence mode="popLayout">
                {visibleSuggestions.map((skill) => (
                  <motion.button
                    layout
                    key={skill}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                    }}
                    transition={{
                      layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    type="button"
                    onClick={(e) => handleAddSkill(skill, e.currentTarget)}
                    disabled={isMaxReached}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 ${
                      isMaxReached
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                        : "bg-slate-100/90 hover:bg-[#E6F3EF] text-slate-700 hover:text-[#0F5244] border-slate-200/80 hover:border-[#A7E2D4] shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer group"
                    }`}
                  >
                    <Plus
                      className={`h-3 w-3 transition-colors ${
                        isMaxReached
                          ? "text-slate-300"
                          : "text-slate-400 group-hover:text-[#0F5244]"
                      }`}
                    />
                    <span>{skill}</span>
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Empty state when no matching results */}
              {visibleSuggestions.length === 0 && !searchQuery.trim() && (
                <div className="p-3 text-center text-xs text-slate-400 font-medium w-full">
                  {t("allSuggestedSelected")}
                </div>
              )}

              {visibleSuggestions.length === 0 && searchQuery.trim() && isExactSuggestion && (
                <div className="p-3 text-center text-xs text-slate-400 font-medium w-full">
                  {t("alreadySelected")}
                </div>
              )}
            </motion.div>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}
