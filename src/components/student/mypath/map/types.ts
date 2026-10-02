import {
  GeneratedRoadmap,
  RoadmapMilestone,
  MyPathPreferences,
} from "@/types/mypath";

export interface InteractiveCurriculumMapProps {
  roadmap: GeneratedRoadmap;
  preferences: MyPathPreferences;
  isAr?: boolean;
  locale?: string;
  onMilestoneToggle: (id: string) => void;
  onRegenerate: () => void;
  onEditPreferences?: () => void;
  onReorderMilestones?: (newMilestones: RoadmapMilestone[]) => void;
  onRefreshRoadmap?: () => Promise<void>;
}

export interface WaypointNode {
  milestoneIndex: number;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
}

export interface MilestoneCardViewProps {
  milestone: RoadmapMilestone;
  idx: number;
  isExpanded: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  isActive: boolean;
  isEnrolled: boolean;
  firstCourse: any;
  courseTitle: string;
  courseDesc: string;
  isAr: boolean;
  locale: string;
  onToggleExpand: () => void;
  onToggleCompleted: () => void;
  onToggleSkip: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isMobile?: boolean;
}
