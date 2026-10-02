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
  goalText?: string;
  categoryId?: number;
  categoryName?: string;
  categoryNameAr?: string;
  priorKnowledge?: PriorKnowledge;
  track: LearningTrack;
  customTrackName?: string;
  level: SkillLevel;
  hoursPerWeek: WeeklyCommitment;
  weeklyHours?: number;
  targetMonths?: TargetDuration;
  targetProjectOutcome?: string;
  learningChallenges?: string;
  previousExperience?: string;
  toolsAndTechStack?: string;
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
  price?: number;
  isEnrolled?: boolean;
  isFree?: boolean;
  currency?: string;
}

export interface RoadmapMilestone {
  id: string;
  stepNumber: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  durationWeeks: number;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  skills: string[];
  skillsAr: string[];
  courses: RoadmapMilestoneCourse[];
  projectTitle: string;
  projectTitleAr: string;
  aiReason?: string;
  aiReasonAr?: string;
}

export interface GeneratedRoadmap {
  id: string;
  createdAt: string;
  preferences: MyPathPreferences;
  estimatedWeeks: number;
  hoursPerWeek: number;
  milestones: RoadmapMilestone[];
  source?: 'ai' | 'fallback';
}

// ==========================================
// Backend API Contracts (US-18 - AI Roadmap)
// ==========================================

export type BackendStepStatus = 'pending' | 'in_progress' | 'done' | 'completed' | 'skipped';

export interface BackendRoadmapCourse {
  id: number | string;
  title: string;
  slug?: string;
  thumbnail?: string;
  cover_image?: string;
  image?: string;
  instructor?: string | { id?: number; full_name?: string; name?: string };
  duration?: number;
  duration_hours?: number;
  level?: string;
  price?: number;
  is_enrolled?: boolean;
  is_free?: boolean;
  currency?: string;
  description?: string;
}

export interface BackendRoadmapStep {
  id: number | string;
  order: number;
  status: BackendStepStatus;
  reason?: string;
  course?: BackendRoadmapCourse;
  course_id?: number | string;
  course_title?: string;
  course_slug?: string;
  course_cover?: string;
  duration_hours?: number;
}

export interface BackendRoadmapPath {
  id: number | string;
  source?: 'ai' | 'fallback';
  status?: string;
  goal_text?: string;
  category?: number | { id: number; name: string };
  current_level?: string;
  weekly_hours?: number;
  steps: BackendRoadmapStep[];
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapApiResponse {
  status?: 'ready' | 'unavailable' | string;
  path: BackendRoadmapPath | null;
  detail?: string;
}

export interface GenerateRoadmapPayload {
  category?: number;
  goal_text?: string;
  current_level?: string;
  weekly_hours?: number;
}

export interface RegenerateRoadmapPayload {
  category?: number;
  goal_text?: string;
  current_level?: string;
  weekly_hours?: number;
}

/**
 * Normalizes backend roadmap path response into the visual GeneratedRoadmap format
 * consumed by interactive curriculum map components.
 */
export function normalizeBackendRoadmap(
  path: BackendRoadmapPath,
  locale = 'en'
): GeneratedRoadmap {
  const isAr = locale === 'ar';
  const steps = Array.isArray(path.steps) ? [...path.steps] : [];
  steps.sort((a, b) => (a.order || 0) - (b.order || 0));

  const milestones: RoadmapMilestone[] = steps.map((step, idx) => {
    const rawCourse = step.course;
    const courseId = String(rawCourse?.id || step.course_id || `course-${step.id}`);
    const courseTitle = rawCourse?.title || step.course_title || (isAr ? `دورة المرحلة ${step.order || idx + 1}` : `Stage ${step.order || idx + 1} Course`);
    const durationHours = Number(rawCourse?.duration_hours || rawCourse?.duration || step.duration_hours || 8);
    const weeklyHours = Number(path.weekly_hours || 6);
    const durationWeeks = Math.max(Math.round(durationHours / Math.max(weeklyHours, 2)), 1);

    const stepStatus: RoadmapMilestone['status'] =
      step.status === 'done' || step.status === 'completed'
        ? 'completed'
        : step.status === 'in_progress'
        ? 'in_progress'
        : step.status === 'skipped'
        ? 'skipped'
        : 'planned';

    let instructorName = isAr ? 'مدرب معتمد' : 'Certified Instructor';
    if (typeof rawCourse?.instructor === 'string') {
      instructorName = rawCourse.instructor;
    } else if (rawCourse?.instructor && typeof rawCourse.instructor === 'object') {
      instructorName = rawCourse.instructor.full_name || rawCourse.instructor.name || instructorName;
    }

    const milestoneCourse: RoadmapMilestoneCourse = {
      id: courseId,
      title: courseTitle,
      titleAr: courseTitle,
      instructor: instructorName,
      durationHours,
      level: (rawCourse?.level as SkillLevel) || (path.current_level as SkillLevel) || 'beginner',
      slug: rawCourse?.slug || step.course_slug,
      image: rawCourse?.cover_image || rawCourse?.thumbnail || rawCourse?.image || step.course_cover || '/images/course-placeholder.jpg',
      price: rawCourse?.price ?? 0,
      isEnrolled: Boolean(rawCourse?.is_enrolled),
      isFree: Boolean(rawCourse?.is_free || rawCourse?.price === 0),
      currency: rawCourse?.currency || '$',
    };

    const reason = step.reason || (isAr ? 'تم اختيار هذه الدورة الذكية لبناء المهارات الأساسية المطلوبة.' : 'Selected by AI to build your core target competencies.');

    return {
      id: String(step.id),
      stepNumber: step.order || idx + 1,
      title: courseTitle,
      titleAr: courseTitle,
      description: reason,
      descriptionAr: reason,
      durationWeeks,
      status: stepStatus,
      skills: [rawCourse?.level || path.current_level || 'Core Skill'],
      skillsAr: [rawCourse?.level || path.current_level || 'مهارة أساسية'],
      courses: [milestoneCourse],
      projectTitle: isAr ? `مشروع المرحلة ${step.order || idx + 1}` : `Milestone Project #${step.order || idx + 1}`,
      projectTitleAr: `مشروع المرحلة ${step.order || idx + 1}`,
      aiReason: reason,
      aiReasonAr: reason,
    };
  });

  const categoryId = typeof path.category === 'number' ? path.category : (path.category as any)?.id;

  return {
    id: String(path.id),
    createdAt: path.created_at || new Date().toISOString(),
    source: path.source || 'ai',
    preferences: {
      track: (path as any).track || 'custom',
      goal: 'job',
      level: (path.current_level as SkillLevel) || 'beginner',
      hoursPerWeek: String(path.weekly_hours || 6) as any,
      targetMonths: '3',
      toolsAndTechStack: path.goal_text || '',
      customTrackName: path.goal_text || '',
    },
    estimatedWeeks: milestones.reduce((sum, m) => sum + m.durationWeeks, 0) || 12,
    hoursPerWeek: Number(path.weekly_hours || 6),
    milestones,
  };
}

/**
 * Parses user weekly commitment string (e.g. '1-2', '3-5', '6-10', '10+') into a numeric hour value.
 */
export function parseWeeklyHours(hoursStr?: string | number): number {
  if (typeof hoursStr === 'number') return hoursStr;
  if (!hoursStr) return 6;
  if (hoursStr === '1-2') return 2;
  if (hoursStr === '3-5') return 5;
  if (hoursStr === '6-10') return 8;
  if (hoursStr === '10+') return 12;
  const parsed = parseInt(String(hoursStr), 10);
  return isNaN(parsed) ? 6 : parsed;
}

/**
 * Builds a natural goal_text from student preferences for the AI generator.
 */
export function buildGoalText(preferences: MyPathPreferences, isAr = false): string {
  if (preferences.goalText && preferences.goalText.trim().length > 0) {
    return preferences.goalText.trim();
  }

  if (preferences.customTrackName && preferences.customTrackName.trim().length > 0) {
    return preferences.customTrackName.trim();
  }

  const parts: string[] = [];
  if (preferences.track && preferences.track !== 'custom') {
    const trackNames: Record<string, { en: string; ar: string }> = {
      frontend: { en: 'Frontend Web Development', ar: 'تطوير واجهات المستخدم والويب' },
      backend: { en: 'Backend & Cloud Architecture', ar: 'تطوير البنية الخلفية والسحابية' },
      fullstack: { en: 'Full-Stack Software Development', ar: 'تطوير الويب الشامل المتكامل' },
      ai: { en: 'Artificial Intelligence & Machine Learning', ar: 'الذكاء الاصطناعي وتعلّم الآلة' },
      uiux: { en: 'UI/UX Product Design', ar: 'تصميم واجهات وتجربة المستخدم' },
      data: { en: 'Data Science & Analytics', ar: 'علم وتحليل البيانات' },
      mobile: { en: 'Mobile App Development', ar: 'تطوير تطبيقات الموبايل' },
      cloud: { en: 'Cloud & DevOps Engineering', ar: 'الحوسبة السحابية وDevOps' },
      business: { en: 'Tech Business & Product Strategy', ar: 'إدارة الأعمال واستراتيجية المنتجات التقنية' },
    };

    const localizedTrack = trackNames[preferences.track];
    if (localizedTrack) {
      parts.push(isAr ? localizedTrack.ar : localizedTrack.en);
    } else {
      parts.push(preferences.track);
    }
  }

  if (preferences.toolsAndTechStack && preferences.toolsAndTechStack.trim().length > 0) {
    parts.push(preferences.toolsAndTechStack.trim());
  }

  if (preferences.goal) {
    const goalLabels: Record<string, { en: string; ar: string }> = {
      job: { en: 'Land a professional software role', ar: 'الحصول على وظيفة تقنية متقدمة' },
      skills: { en: 'Master practical project skills', ar: 'إتقان مهارات عملية وبناء مشاريع' },
      exam: { en: 'Prepare for certifications', ar: 'التحضير لشهادات مهنية معتمدة' },
      growth: { en: 'Career growth & promotions', ar: 'الارتقاء الوظيفي والتطور المهني' },
    };
    const goalObj = goalLabels[preferences.goal];
    if (goalObj) {
      parts.push(isAr ? goalObj.ar : goalObj.en);
    }
  }

  return parts.length > 0
    ? parts.join(isAr ? ' • ' : ' - ')
    : (isAr ? 'أريد بناء مسار تعليمي متكامل للارتقاء بمهاراتي' : 'I want to build a comprehensive learning path to advance my tech skills');
}

/**
 * Creates a valid GeneratedRoadmap from actual published courses in Coach Space catalog.
 * Guarantees that if the platform has courses, the student always receives a roadmap with real courses.
 */
export function createRoadmapFromCatalogCourses(
  courses: any[],
  preferences: MyPathPreferences,
  locale = 'en'
): GeneratedRoadmap {
  const isAr = locale === 'ar';
  const weeklyHours = preferences.weeklyHours || parseWeeklyHours(preferences.hoursPerWeek);

  const milestones: RoadmapMilestone[] = courses.map((course, idx) => {
    const durationHours = Number(course.duration_hours || course.duration || 8);
    const durationWeeks = Math.max(Math.round(durationHours / Math.max(weeklyHours, 2)), 2);
    const courseTitle = course.title || (isAr ? `دورة المرحلة ${idx + 1}` : `Stage ${idx + 1} Course`);

    let instructorName = isAr ? 'مدرب معتمد' : 'Certified Instructor';
    if (typeof course.instructor === 'string') {
      instructorName = course.instructor;
    } else if (course.instructor && typeof course.instructor === 'object') {
      instructorName = course.instructor.full_name || course.instructor.name || instructorName;
    }

    const milestoneCourse: RoadmapMilestoneCourse = {
      id: String(course.id),
      title: courseTitle,
      titleAr: courseTitle,
      instructor: instructorName,
      durationHours,
      level: (course.level as SkillLevel) || preferences.level || 'beginner',
      slug: course.slug,
      image: course.cover_image || course.thumbnail || '/images/course-placeholder.jpg',
      price: Number(course.price) || 0,
      isEnrolled: Boolean(course.is_enrolled),
      isFree: Boolean(course.is_free || Number(course.price) === 0),
      currency: course.currency || '$',
    };

    const reason =
      course.description ||
      (isAr
        ? `دورة منشورة معتمدة على المنصة في مسار ${preferences.categoryNameAr || preferences.categoryName || 'التخصص'}. تم اختيارها لبناء المهارات الأساسية المطلوبة.`
        : `Published course on Coach Space in ${preferences.categoryName || 'your track'}. Selected to build required competencies for your goal.`);

    return {
      id: String(course.id),
      stepNumber: idx + 1,
      title: courseTitle,
      titleAr: courseTitle,
      description: reason,
      descriptionAr: reason,
      durationWeeks,
      status: 'planned',
      skills: [course.level || preferences.level || 'Core Skill'],
      skillsAr: [course.level || preferences.level || 'مهارة أساسية'],
      courses: [milestoneCourse],
      projectTitle: isAr ? `مشروع المرحلة ${idx + 1}` : `Milestone Project #${idx + 1}`,
      projectTitleAr: `مشروع المرحلة ${idx + 1}`,
      aiReason: reason,
      aiReasonAr: reason,
    };
  });

  return {
    id: `catalog-roadmap-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'ai',
    preferences,
    estimatedWeeks: milestones.reduce((sum, m) => sum + m.durationWeeks, 0) || 12,
    hoursPerWeek: weeklyHours,
    milestones,
  };
}
