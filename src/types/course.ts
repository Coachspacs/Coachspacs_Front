export type CourseStatus = "published" | "pending_review" | "rejected" | "archived" | "draft";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Lesson {
  id: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  titleKey?: string;
  duration?: string;
  duration_minutes?: number;
  videoUrl?: string;
  video_url?: string;
  video_public_id?: string;
  isFreePreview?: boolean;
  is_preview?: boolean;
  order?: number;
  warning?: string;
}

export interface Section {
  id: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  titleKey?: string;
  order?: number;
  warning?: string;
  lessons: Lesson[];
}

export interface VideoUploadSignatureResponse {
  cloud_name: string;
  api_key: string;
  timestamp: number | string;
  folder: string;
  signature: string;
  resource_type?: string;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format?: string;
  bytes?: number;
  duration?: number;
  resource_type?: string;
  url?: string;
  [key: string]: any;
}

export interface CreateLessonRequest {
  title_ar: string;
  title_en: string;
  duration_minutes?: number;
  is_preview?: boolean;
  video_public_id?: string;
  video_url?: string;
}

export interface UpdateLessonRequest {
  title_ar?: string;
  title_en?: string;
  duration_minutes?: number;
  is_preview?: boolean;
  video_public_id?: string;
  video_url?: string;
}

export interface CreateSectionRequest {
  title_ar: string;
  title_en: string;
  order?: number;
}

export interface ReorderSectionItem {
  id: number | string;
  lesson_ids?: Array<number | string>;
}

export interface ReorderCurriculumRequest {
  sections: ReorderSectionItem[];
}

export interface Course {
  id: string;
  title?: string;
  titleAr?: string;
  titleEn?: string;
  titleKey?: string;
  slug?: string;
  category: string;
  categoryAr?: string;
  categoryKey?: string;
  instructor?: any;
  instructorName?: string;
  instructorNameAr?: string;
  instructorNameEn?: string;
  instructorNameKey?: string;
  instructorAvatar?: string;
  instructorRole?: string;
  instructorRoleAr?: string;
  rating: number;
  reviewsCount?: number;
  reviewsCountFormatted?: string;
  studentsCount?: number;
  price: number;
  priceFormatted?: string;
  originalPrice?: number;
  image?: string;
  coverImage?: string;
  thumbnail?: string;
  badge?: string;
  badgeAr?: string;
  badgeKey?: string;
  level: CourseLevel | string;
  levelKey?: string;
  language?: string;
  duration?: string;
  durationHours?: number;
  durationFormatted?: string;
  lessonsCount?: number;
  status?: CourseStatus;
  isPublished?: boolean;
  rejectionReasonAr?: string;
  rejectionReasonEn?: string;
  rejectionReasonKey?: string;
  sections?: Section[];
  modules?: any[];
  description?: string;
  descriptionAr?: string;
  shortDescription?: string;
  whatYouWillLearn?: string[];
  whatYouWillLearnAr?: string[];
  is_enrolled?: boolean;
  is_free?: boolean;
  total_lessons?: number;
  total_duration_minutes?: number;
  isSaved?: boolean;
  isRealBackend?: boolean;
  updatedAt?: string;
}
