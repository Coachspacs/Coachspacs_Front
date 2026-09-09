import axiosInstance from "@/lib/axios";
import { userService } from "./userService";
import { UserProfileResponse, UpdateProfileRequest } from "@/types/user";

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
};

export default instructorService;
