import { apiClient } from "@/api/client";
import { StudentProfile, ApiResponse } from "@/types";

export const studentService = {
  async getProfile(): Promise<ApiResponse<StudentProfile>> {
    const response = await apiClient.get<ApiResponse<StudentProfile>>("/student/profile");
    return response.data;
  },

  async updateProfile(data: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> {
    const response = await apiClient.put<ApiResponse<StudentProfile>>("/student/profile", data);
    return response.data;
  },
};
