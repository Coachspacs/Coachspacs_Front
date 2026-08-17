import React from "react";
import { Course } from "./course";

export type UserRole = "student" | "instructor" | "admin" | "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string;
  headline?: string;
  bio?: string;
  specialization?: string;
  hourlyRate?: number;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CartItem {
  id: string;
  courseId: string;
  course?: Course;
  title: string;
  titleAr?: string;
  titleEn?: string;
  price: number;
  image: string;
  instructor?: string;
  instructorName?: string;
  category?: string;
  addedAt?: string;
}

export interface NavigationItem {
  id?: string;
  key?: string;
  label?: string;
  href: string;
  icon?: any;
}

export interface FooterLinkGroup {
  title?: string;
  key?: string;
  links: { label?: string; key?: string; href: string }[];
}

export interface Certificate {
  id: string;
  courseId?: string;
  courseTitle: string;
  studentName?: string;
  certificateCode?: string;
  instructorName?: string;
  issueDate: string;
  downloadUrl?: string;
}

export interface InstructorStats {
  totalRevenue: number;
  totalStudents: number;
  totalCourses?: number;
  activeCourses?: number;
  monthlyEarnings?: any[];
  averageRating: number;
}

export interface EnrolledStudent {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  email: string;
  avatar?: string;
  course?: string;
  courseTitle?: string;
  date?: string;
  enrolledAt?: string;
  progress: number;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  learningGoal: string;
  preferredLanguage: string;
  bio: string;
  avatarUrl: string | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
  twoFactorAuth: boolean;
}

export interface InstructorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  specialization: string;
  experienceYears: number;
  hourlyRate: number;
  bio: string;
  introVideoUrl: string;
  website: string;
  linkedin: string;
  payoutMethod: "bank" | "paypal";
  bankIban: string;
  paypalEmail: string;
  autoPayout: boolean;
}

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}
