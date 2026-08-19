export type CourseStatus = "published" | "pending_review" | "rejected" | "archived" | "draft";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Lesson {
  id: string;
  title: string;
  titleKey?: string;
  duration: string;
  videoUrl?: string;
  isFreePreview?: boolean;
}

export interface Section {
  id: string;
  title: string;
  titleKey?: string;
  warning?: string;
  lessons: Lesson[];
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
  isSaved?: boolean;
  updatedAt?: string;
}
