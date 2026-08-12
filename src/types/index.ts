import type { InputHTMLAttributes, ReactNode } from "react";

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type RoleType = "student" | "coach";

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: UserRole | RoleType;
  avatar?: string;
  bio?: string;
  title?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NavigationItem {
  key: string;
  href: string;
}

export interface FooterLinkGroup {
  key: string;
  links: {
    key: string;
    href: string;
  }[];
}

export interface RegisterFormData {
  role: RoleType;
  fullName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string>;
}

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g. "12:45"
  videoUrl?: string;
  content?: string;
  isCompleted?: boolean;
  isPreview?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio?: string;
  totalStudents?: number;
  totalCourses?: number;
  rating?: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  duration: string;
  instructor: Instructor;
  modules?: Module[];
  updatedAt: string;
  isPublished?: boolean;
}

export interface CartItem {
  course: Course;
  addedAt: string;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  studentName: string;
  issueDate: string;
  instructorName: string;
  certificateCode: string;
}

export interface InstructorStats {
  totalRevenue: number;
  totalStudents: number;
  activeCourses: number;
  averageRating: number;
  monthlyEarnings: { month: string; earnings: number }[];
}

export interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
  avatar?: string;
}
