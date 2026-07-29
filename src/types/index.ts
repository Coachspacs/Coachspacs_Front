export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  title?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
