export interface CertificateCourse {
  id: number | string;
  title: string;
  title_ar?: string;
  title_en?: string;
  cover_image?: string;
  image?: string;
  thumbnail?: string;
  instructor?: any;
}

export interface CertificateItem {
  id: number | string;
  certificate_code: string;
  course?: CertificateCourse;
  course_title?: string;
  student_name?: string;
  issued_at: string;
  pdf_url?: string;
  [key: string]: any;
}

export interface CertificateListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CertificateItem[];
}

export interface CertificateDownloadResponse {
  status?: "pending" | "ready";
  detail?: string;
  download_url?: string;
  pdf_url?: string;
}

export interface CertificateVerifyResponse {
  student_full_name: string;
  course_title: string;
  issued_at: string;
  certificate_code?: string;
  instructor_name?: string;
  grade?: string | number;
  [key: string]: any;
}

export interface CertificateVerifyError {
  detail: string;
  status: number;
  isRateLimited?: boolean;
}

export interface CourseStudentItem {
  id: number | string;
  student_id?: number | string;
  full_name: string;
  name?: string;
  email: string;
  avatar?: string | null;
  enrolled_at: string;
  progress_percent: number;
  is_completed: boolean;
  completed_at?: string | null;
  certificate_id?: number | string | null;
  [key: string]: any;
}

export interface CourseStudentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourseStudentItem[];
}

export interface InstructorDashboardCourseSummary {
  id: number | string;
  title: string;
  status: string;
  enrollment_count: number;
}

export interface InstructorDashboardResponse {
  total_courses: number;
  total_students: number;
  courses: InstructorDashboardCourseSummary[];
}
