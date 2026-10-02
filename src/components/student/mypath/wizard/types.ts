import { LucideIcon } from "lucide-react";
import {
  MyPathPreferences,
  GeneratedRoadmap,
  LearningGoal,
  PriorKnowledge,
  SkillLevel,
  LearningTrack,
} from "@/types/mypath";

export interface BenefitItem {
  id: string;
  icon: LucideIcon;
  titleKey: "personalizedTitle" | "coursesTitle" | "flexibleTitle";
  descKey: "personalizedDesc" | "coursesDesc" | "flexibleDesc";
}

export interface GoalOptionItem {
  id: LearningGoal;
  icon: LucideIcon;
}

export interface LevelOptionItem {
  id: PriorKnowledge;
  skillLevel: SkillLevel;
  icon: LucideIcon;
  hasRecommended?: boolean;
}

export interface TrackItem {
  id: LearningTrack;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
