import { AttachmentItem } from "@/types/course";

export interface LessonItem {
  id: string | number;
  title: string;
  title_en?: string;
  title_ar?: string;
  duration?: string;
  duration_minutes?: number;
  video_url?: string;
  videoUrl?: string;
  is_preview?: boolean;
  is_locked?: boolean;
  sectionId?: string | number;
  sectionTitle?: string;
  description?: string;
  resources?: { name: string; size: string; url?: string }[];
  attachments?: AttachmentItem[];
}

export interface SectionItem {
  id: string | number;
  title: string;
  title_en?: string;
  title_ar?: string;
  lessons: LessonItem[];
}

export interface InstructorItem {
  id?: string | number;
  name?: string;
  full_name?: string;
  avatar?: string | null;
  slug?: string;
  headline?: string;
  headline_ar?: string;
  role?: string;
  role_ar?: string;
  bio?: string;
  verified?: boolean;
}

export interface LessonViewerLayoutProps {
  courseTitle: string;
  courseSlug?: string;
  courseCover?: string;
  courseDescription?: string;
  whatYouWillLearn?: string[];
  instructor?: InstructorItem;
  sections: SectionItem[];
  allLessons: LessonItem[];
  activeLessonIndex: number;
  completedLessonIds: string[];
  onSelectLesson: (index: number) => void;
  onToggleComplete: (lessonId: string | number) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  onFinishCourse?: () => void;
  progressPercent?: number;
  serverProgressPercent?: number | null;
  courseId?: string | number;
  courseMaterials?: AttachmentItem[];
  locale?: string;
  isAr?: boolean;
  backHref?: string;
  isLoading?: boolean;
}
