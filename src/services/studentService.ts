import { apiClient } from "@/api/client";
import { StudentProfile, ApiResponse } from "@/types";

export const studentService = {
  async getProfile(): Promise<ApiResponse<StudentProfile>> {
    const response = await apiClient.get<ApiResponse<StudentProfile>>("/users/me");
    return response.data;
  },

  async updateProfile(data: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> {
    const response = await apiClient.put<ApiResponse<StudentProfile>>("/users/me", data);
    return response.data;
  },
};
