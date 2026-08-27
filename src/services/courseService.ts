import axiosInstance from "@/lib/axios";
import { Course, ApiResponse, PaginatedResponse } from "@/types";

export interface CourseListParams {
  category?: string | number;
  level?: "beginner" | "intermediate" | "advanced" | string;
  language?: "ar" | "en" | string;
  price_min?: number | string;
  price_max?: number | string;
  search?: string;
  sort?: "newest" | "price" | "popular" | string;
  page?: number;
  page_size?: number;
}

export interface PaginatedCourseResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export const courseService = {
  /**
   * List courses with filtering, search, sorting, and pagination
   * GET /api/catalog/courses
   */
  async getCourses(params?: CourseListParams, locale?: string): Promise<PaginatedCourseResponse> {
    const headers: Record<string, string> = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    };
    if (locale) {
      headers["Accept-Language"] = locale;
    }
    const response = await axiosInstance.get<PaginatedCourseResponse>("/catalog/courses", {
      params,
      headers,
    });
    return response.data;
  },

  /**
   * Get course details with full outline & preview video access
   * GET /api/catalog/courses/:id
   */
  async getCourseById(id: string | number, locale?: string): Promise<any> {
    const headers: Record<string, string> = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    };
    if (locale) {
      headers["Accept-Language"] = locale;
    }
    const response = await axiosInstance.get(`/catalog/courses/${id}`, {
      headers,
    });
    return response.data;
  },

  /**
   * Create instructor course draft
   * POST /api/instructor/courses
   */
  async createCourse(courseData: Partial<Course>): Promise<any> {
    const response = await axiosInstance.post("/instructor/courses", courseData);
    return response.data;
  },
};

export default courseService;
