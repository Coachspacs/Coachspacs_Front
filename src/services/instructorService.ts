import { apiClient } from "@/api/client";
import { InstructorProfile, ApiResponse } from "@/types";

export const instructorService = {
  async getProfile(): Promise<ApiResponse<InstructorProfile>> {
    const response = await apiClient.get<ApiResponse<InstructorProfile>>("/instructor/profile");
    return response.data;
  },

  async updateProfile(data: Partial<InstructorProfile>): Promise<ApiResponse<InstructorProfile>> {
    const response = await apiClient.put<ApiResponse<InstructorProfile>>("/instructor/profile", data);
    return response.data;
  },
};
