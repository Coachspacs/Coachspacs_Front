import type React from "react";
import type { Course } from "./course";

export type UserRole = "student" | "instructor" | "admin" | "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  pendingEmail?: string | null;
  pending_email?: string | null;
  role: UserRole;
  avatar?: string | null;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  headline?: string;
  bio?: string;
  specialization?: string;
  hourlyRate?: number;
  preferredLanguage?: string;
  preferred_language?: string;
  approval_status?: 'pending' | 'approved' | 'rejected' | string;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | string;
  instructorStatus?: string;
  createdAt?: string;
}

export interface UserProfileResponse {
  id: number | string;
  full_name: string;
  email: string;
  pending_email?: string | null;
  phone_number?: string | null;
  preferred_language?: string;
  avatar?: string | null;
  role: 'student' | 'instructor' | string;
  approval_status?: 'pending' | 'approved' | 'rejected' | string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone_number?: string;
  preferred_language?: string;
}

export interface AvatarUploadResponse {
  avatar: string;
}

export interface EmailChangeRequest {
  new_email: string;
}

export interface EmailConfirmRequest {
  uid: string;
  token: string;
}

export interface CategoryItem {
  id: number | string;
  name: string;
  icon?: string | null;
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

export interface CertificationItem {
  id: string;
  title: string;
  titleAr?: string;
  provider: string;
  providerAr?: string;
  date?: string;
  dateAr?: string;
  url?: string;
  credentialId?: string;
}

export interface EmploymentHistoryItem {
  id: string;
  role: string;
  roleAr?: string;
  company: string;
  companyAr?: string;
  period: string;
  periodAr?: string;
  description?: string;
  descriptionAr?: string;
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
  skills?: string[];
  skillsAr?: string[];
  certifications?: CertificationItem[];
  employmentHistory?: EmploymentHistoryItem[];
  introVideoUrl: string;
  website: string;
  linkedin: string;
  twitter?: string;
  github?: string;
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
