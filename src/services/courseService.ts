import axiosInstance from "@/lib/axios";
import { Course, ApiResponse, PaginatedResponse } from "@/types";

export interface CourseListParams {
  category?: string | number;
  level?: "beginner" | "intermediate" | "advanced" | string;
  language?: "ar" | "en" | string;
  price_min?: number | string;
  price_max?: number | string;
  is_free?: boolean | string;
  ordering?: "-created_at" | "price" | "-price" | "-rating" | string;
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
    const headers: Record<string, string> = {};
    if (locale) {
      headers["Accept-Language"] = locale;
    }

    const queryParams: any = { ...(params || {}) };

    // Standardize sort to CoachSpace Postman spec: 'newest' | 'price' | 'popular'
    if (queryParams.sort) {
      if (queryParams.sort === "newest") {
        queryParams.sort = "newest";
        queryParams.ordering = "-created_at";
      } else if (queryParams.sort === "price" || queryParams.sort === "price_low_to_high") {
        queryParams.sort = "price";
        queryParams.ordering = "price";
      } else if (queryParams.sort === "price_high_to_low") {
        queryParams.sort = "-price";
        queryParams.ordering = "-price";
      } else if (
        queryParams.sort === "popular" ||
        queryParams.sort === "highest_rated" ||
        queryParams.sort === "most_popular"
      ) {
        queryParams.sort = "popular";
        queryParams.ordering = "-rating";
      }
    } else if (queryParams.ordering) {
      if (queryParams.ordering === "-created_at") queryParams.sort = "newest";
      else if (queryParams.ordering === "price") queryParams.sort = "price";
      else if (queryParams.ordering === "-rating") queryParams.sort = "popular";
    }

    const response = await axiosInstance.get<PaginatedCourseResponse>("/catalog/courses", {
      params: queryParams,
      headers,
    });
    return response.data;
  },

  /**
   * Get course details with full outline & preview video access
   * GET /api/catalog/courses/:id
   */
  async getCourseById(id: string | number, locale?: string): Promise<any> {
    const headers: Record<string, string> = {};
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
