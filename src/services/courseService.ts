import axiosInstance from "@/lib/axios";
import { Course, ApiResponse, PaginatedResponse } from "@/types";

export const courseService = {
  async getCourses(params?: { category?: string | number; level?: string; search?: string; page?: number }): Promise<any> {
    const response = await axiosInstance.get("/catalog/courses", { params });
    return response.data;
  },

  async getCourseById(id: string | number): Promise<any> {
    const response = await axiosInstance.get(`/catalog/courses/${id}`);
    return response.data;
  },

  async createCourse(courseData: Partial<Course>): Promise<any> {
    const response = await axiosInstance.post("/instructor/courses", courseData);
    return response.data;
  },
};

export default courseService;
