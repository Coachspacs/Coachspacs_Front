import { Course, Certificate, InstructorStats, EnrolledStudent } from '@/types';

export const mockCourses: Course[] = [];

export const mockCertificate: Certificate = {
  id: '',
  courseTitle: '',
  studentName: '',
  issueDate: '',
  instructorName: '',
  certificateCode: '',
};

export const mockInstructorStats: InstructorStats = {
  totalRevenue: 0,
  totalStudents: 0,
  activeCourses: 0,
  averageRating: 0,
  monthlyEarnings: [],
};

export const mockEnrolledStudents: EnrolledStudent[] = [];

export interface InstructorWorkspaceCourse {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  level: string;
  price: number;
  studentsCount: number;
  rating: number;
  status: "published" | "pending_review" | "rejected" | "archived" | "draft";
  image: string;
  rejectionReasonAr?: string;
  rejectionReasonEn?: string;
  sections?: any[];
}

export const mockInstructorWorkspaceCourses: InstructorWorkspaceCourse[] = [];

export interface InstructorWorkspaceStudentData {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  course: string;
  date: string;
  progress: number;
}

export const mockInstructorWorkspaceStudents: InstructorWorkspaceStudentData[] = [];

export interface InstructorWorkspaceProfileData {
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  headlineAr: string;
  headlineEn: string;
  specialization: string;
  experienceYears: string;
  hourlyRate: string;
  bioAr: string;
  bioEn: string;
  payoutMethod: string;
  bankIban: string;
  paypalEmail: string;
  autoPayout: boolean;
  introVideoUrl: string;
  website: string;
  linkedin: string;
}

export const mockInstructorWorkspaceProfile: InstructorWorkspaceProfileData = {
  fullNameAr: "",
  fullNameEn: "",
  email: "",
  phone: "",
  headlineAr: "",
  headlineEn: "",
  specialization: "",
  experienceYears: "0",
  hourlyRate: "0",
  bioAr: "",
  bioEn: "",
  payoutMethod: "bank",
  bankIban: "",
  paypalEmail: "",
  autoPayout: true,
  introVideoUrl: "",
  website: "",
  linkedin: "",
};
