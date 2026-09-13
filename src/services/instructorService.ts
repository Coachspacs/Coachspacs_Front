import axiosInstance from "@/lib/axios";
import { userService } from "./userService";
import { UserProfileResponse, UpdateProfileRequest } from "@/types/user";
import {
  InstructorDashboardResponse,
  CourseStudentsResponse,
} from "@/types/certificate";

export interface PublicInstructor {
  id: string | number;
  name?: string;
  full_name?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
  courses_count?: number;
  total_courses?: number;
  students_count?: number;
  rating?: number;
  reviews_count?: number;
  [key: string]: any;
}

export const instructorService = {
  async getProfile(): Promise<UserProfileResponse> {
    return userService.getMyProfile();
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    return userService.updateMyProfile(data);
  },

  /**
   * List approved instructors
   * GET /api/users/instructors
   */
  async getInstructors(locale?: string): Promise<PublicInstructor[]> {
    const headers: Record<string, string> = {};
    if (locale) {
      headers["Accept-Language"] = locale;
    }
    const response = await axiosInstance.get("/users/instructors", { headers });
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  },

  /**
   * Instructor Dashboard Summary Metrics (US-17)
   * GET /api/instructor/dashboard
   * Returns distinct total_students, total_courses, and per-course enrollment metrics.
   */
  async getDashboard(): Promise<InstructorDashboardResponse> {
    const response = await axiosInstance.get<InstructorDashboardResponse>(
      "/instructor/dashboard"
    );
    return response.data;
  },

  /**
   * Enrolled Students in Instructor's Course (US-17)
   * GET /api/instructor/courses/{id}/students
   * Supports pagination: page, page_size
   */
  async getCourseStudents(
    courseId: number | string,
    page = 1,
    pageSize = 10
  ): Promise<CourseStudentsResponse> {
    try {
      const response = await axiosInstance.get<
        CourseStudentsResponse | any[]
      >(`/instructor/courses/${courseId}/students`, {
        params: {
          page,
          page_size: pageSize,
        },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data,
        };
      }
      return {
        count: data?.count ?? (data?.results?.length || 0),
        next: data?.next ?? null,
        previous: data?.previous ?? null,
        results: Array.isArray(data?.results) ? data.results : [],
      };
    } catch (err: any) {
      if (err?.response?.status === 403) {
        const forbiddenErr: any = new Error(
          err.response?.data?.detail ||
            "You are not authorized to view students for this course."
        );
        forbiddenErr.status = 403;
        forbiddenErr.isForbidden = true;
        throw forbiddenErr;
      }
      throw err;
    }
  },
};

export default instructorService;
