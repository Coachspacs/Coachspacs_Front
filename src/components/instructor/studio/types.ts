export interface Lesson {
  id: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  titleEn?: string;
  titleAr?: string;
  duration: string;
  duration_minutes?: number;
  video_url?: string;
  videoUrl?: string;
  video_public_id?: string;
  is_preview?: boolean;
  isPreview?: boolean;
  isFreePreview?: boolean;
  isCompleted?: boolean;
  warning?: string;
}

export interface Section {
  id: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  titleEn?: string;
  titleAr?: string;
  lessons: Lesson[];
  warning?: string;
}

export type StudioStep = "info" | "curriculum" | "review";

export interface CreateCourseStudioProps {
  initialId?: string;
}

export interface EditingLessonInfo {
  sectionId: string;
  lesson: Lesson;
  isNew?: boolean;
}
