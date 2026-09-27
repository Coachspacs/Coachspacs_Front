export type LearningGoal = 'job' | 'skills' | 'exam' | 'growth' | 'other';

export type PriorKnowledge = 'none' | 'basic' | 'intermediate' | 'advanced';

export type LearningTrack =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'ai'
  | 'uiux'
  | 'data'
  | 'mobile'
  | 'cloud'
  | 'business'
  | string;

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type WeeklyCommitment = '1-2' | '3-5' | '6-10' | '10+' | '3' | '8' | '15';

export type TargetDuration = '1' | '3' | '6';

export interface MyPathPreferences {
  goal?: LearningGoal;
  priorKnowledge?: PriorKnowledge;
  track: LearningTrack;
  customTrackName?: string;
  level: SkillLevel;
  hoursPerWeek: WeeklyCommitment;
  targetMonths?: TargetDuration;
  targetProjectOutcome?: string;
  learningChallenges?: string;
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
