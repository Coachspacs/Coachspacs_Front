"use client";

import { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/soundEffects";
import { generateRoadmapFromPreferences } from "@/lib/myPathGenerator";
import {
  MyPathPreferences,
  GeneratedRoadmap,
  RoadmapMilestone,
} from "@/types/mypath";
import { WizardStep } from "../types";

export function useMyPathWizard(t: (key: string) => string) {
  // Step 1: Landing Overview
  // Step 2: Wizard 1/4 - Goal Assessment
  // Step 3: Wizard 2/4 - Skill Focus & Track Selection
  // Step 4: Wizard 3/4 - Prior Knowledge & Level
  // Step 5: Wizard 4/4 - Practical Experience & Tech Stack
  // Step 6: AI Generation Loading
  // Step 7: Final Interactive Roadmap
  const [step, setStep] = useState<WizardStep>(1);

  const [preferences, setPreferences] = useState<MyPathPreferences>({
    goal: "job",
    priorKnowledge: "intermediate",
    track: "frontend",
    customTrackName: "",
    level: "intermediate",
    hoursPerWeek: "3-5",
    targetMonths: "3",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [isCustomSkillOpen, setIsCustomSkillOpen] = useState(false);
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(null);
  const [bookmarkedSteps, setBookmarkedSteps] = useState<Record<string, boolean>>({});

  const [isHydrated, setIsHydrated] = useState(false);

  // Restore saved state (preferences, roadmap, and exact active step) on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("coachspace_mypath_preferences");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed) setPreferences((prev) => ({ ...prev, ...parsed }));
      }

      const savedRoadmap = localStorage.getItem("coachspace_student_roadmap");
      if (savedRoadmap) {
        const parsedRoadmap = JSON.parse(savedRoadmap);
        if (parsedRoadmap?.milestones?.length > 0) {
          setRoadmap(parsedRoadmap);
        }
      }

      const savedStep = localStorage.getItem("coachspace_mypath_current_step");
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum >= 1 && stepNum <= 7) {
          setStep(stepNum === 6 ? 5 : (stepNum as WizardStep));
        }
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // Persist current step whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("coachspace_mypath_current_step", String(step));
    } catch {}
  }, [step, isHydrated]);

  // Persist preferences whenever they change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("coachspace_mypath_preferences", JSON.stringify(preferences));
    } catch {}
  }, [preferences, isHydrated]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#0F5244", "#10B981", "#38E09D", "#D1FAE5", "#07382E"],
      });
    } catch {}
  };

  const handleGenerationComplete = () => {
    const generated = generateRoadmapFromPreferences(preferences);
    setRoadmap(generated);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(generated));
    } catch {}
    soundFx.playCelebration();
    setStep(7);
    triggerConfetti();
  };

  const goToNextStep = (next: WizardStep) => {
    if (next >= 2 && next <= 5) {
      const milestoneIndex = next - 1; // 1, 2, 3, 4
      soundFx.playRobotTravel(milestoneIndex);
    } else {
      soundFx.playStepTransition("forward");
    }
    setStep(next);
  };

  const goToPrevStep = (prev: WizardStep) => {
    if (prev >= 2 && prev <= 5) {
      const milestoneIndex = prev - 1; // 1, 2, 3, 4
      soundFx.playRobotTravel(milestoneIndex);
    } else {
      soundFx.playStepTransition("backward");
    }
    setStep(prev);
  };

  const handleStartAssessment = () => goToNextStep(2);

  const handleMilestoneToggle = (milestoneId: string) => {
    if (!roadmap) return;
    const updatedMilestones = roadmap.milestones.map((m) => {
      if (m.id === milestoneId) {
        const nextStatus: RoadmapMilestone["status"] =
          m.status === "completed" ? "in_progress" : "completed";
        return { ...m, status: nextStatus };
      }
      return m;
    });

    const updatedRoadmap = { ...roadmap, milestones: updatedMilestones };
    setRoadmap(updatedRoadmap);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(updatedRoadmap));
    } catch {}

    const allCompleted = updatedMilestones.every((m) => m.status === "completed");
    if (allCompleted) {
      soundFx.playCelebration();
      triggerConfetti();
    } else {
      soundFx.playOptionSelect();
    }
  };

  const handleReorderMilestones = (newMilestones: RoadmapMilestone[]) => {
    if (!roadmap) return;
    const updatedRoadmap = { ...roadmap, milestones: newMilestones };
    setRoadmap(updatedRoadmap);
    try {
      localStorage.setItem("coachspace_student_roadmap", JSON.stringify(updatedRoadmap));
    } catch {}
  };

  const handleRegenerate = () => {
    goToPrevStep(2);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    soundFx.playOptionSelect();
    setPreferences({
      ...preferences,
      track: "custom",
      customTrackName: customSkillInput.trim(),
    });
    setIsCustomSkillOpen(false);
  };

  return {
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
    toggleBookmark,
    handleSelectCustomSkill,
  };
}
