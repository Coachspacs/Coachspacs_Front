import { apiClient } from "@/api/client";
import { Course, ApiResponse, PaginatedResponse } from "@/types";

export const courseService = {
  async getCourses(params?: { category?: string; level?: string; search?: string; page?: number }): Promise<PaginatedResponse<Course>> {
    const response = await apiClient.get<PaginatedResponse<Course>>("/courses", { params });
    return response.data;
  },

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  async createCourse(courseData: Partial<Course>): Promise<ApiResponse<Course>> {
    const response = await apiClient.post<ApiResponse<Course>>("/courses", courseData);
    return response.data;
  },
};
