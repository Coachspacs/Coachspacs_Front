import { userService } from "./userService";
import { UserProfileResponse, UpdateProfileRequest } from "@/types/user";

export const instructorService = {
  async getProfile(): Promise<UserProfileResponse> {
    return userService.getMyProfile();
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    return userService.updateMyProfile(data);
  },
};

export default instructorService;
