export type LearningTrack =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'ai'
  | 'uiux'
  | 'data'
  | 'business';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type WeeklyCommitment = '3' | '8' | '15';

export type TargetDuration = '1' | '3' | '6';

export interface MyPathPreferences {
  track: LearningTrack;
  level: SkillLevel;
  hoursPerWeek: WeeklyCommitment;
  targetMonths: TargetDuration;
}

export interface RoadmapMilestoneCourse {
  id: string;
  title: string;
  titleAr: string;
  instructor: string;
  durationHours: number;
  level: SkillLevel;
  slug?: string;
  image?: string;
}

export interface RoadmapMilestone {
  id: string;
  stepNumber: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  durationWeeks: number;
  status: 'planned' | 'in_progress' | 'completed';
  skills: string[];
  skillsAr: string[];
  courses: RoadmapMilestoneCourse[];
  projectTitle: string;
  projectTitleAr: string;
}

export interface GeneratedRoadmap {
  id: string;
  createdAt: string;
  preferences: MyPathPreferences;
  estimatedWeeks: number;
  hoursPerWeek: number;
  milestones: RoadmapMilestone[];
}
