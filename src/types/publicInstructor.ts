import type { Course } from "./catalog";

export interface InstructorReview {
  id: string;
  studentName: string;
  studentNameAr: string;
  avatar?: string;
  rating: number;
  date: string;
  dateAr: string;
  comment: string;
  commentAr: string;
  courseTitle: string;
  courseTitleAr: string;
}

export interface InstructorHighlight {
  id: string;
  iconName: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
}

export interface PublicInstructor {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  headline: string;
  headlineAr: string;
  avatar?: string;
  coverImage?: string;
  bio: string;
  bioAr: string;
  aboutParagraphs: string[];
  aboutParagraphsAr: string[];
  specialization: string;
  specializationAr: string;
  rating?: number;
  reviewsCount?: number;
  reviewsCountFormatted?: string;
  totalStudents?: number;
  totalStudentsFormatted?: string;
  totalCourses?: number;
  experienceYears?: number;
  socials?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    github?: string;
    email?: string;
  };
  skills?: string[];
  skillsAr?: string[];
  highlights?: InstructorHighlight[];
  reviews?: InstructorReview[];
  ratingBreakdown?: {
    stars5: number;
    stars4: number;
    stars3: number;
    stars2: number;
    stars1: number;
  };
  courses?: Course[];
  hourlyRate?: string;
  hourlyRateAr?: string;
  location?: string;
  locationAr?: string;
  successRate?: number;
}
