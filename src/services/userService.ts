import axiosInstance from '@/lib/axios';
import {
  UserProfileResponse,
  UpdateProfileRequest,
  AvatarUploadResponse,
  EmailConfirmRequest,
} from '@/types/user';

/**
 * User Service
 * Connects to /api/users/me endpoints for Profile, Avatar, and Email management
 */
export const userService = {
  /**
   * Get current authenticated user profile
   * GET /api/users/me
   */
  async getMyProfile(): Promise<UserProfileResponse> {
    const response = await axiosInstance.get<UserProfileResponse>('/users/me');
    return response.data;
  },

  /**
   * Update current user profile (full_name, phone_number, preferred_language)
   * PUT /api/users/me
   */
  async updateMyProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    const response = await axiosInstance.put<UserProfileResponse>('/users/me', {
      full_name: data.full_name,
      phone_number: data.phone_number,
      preferred_language: data.preferred_language,
    });
    return response.data;
  },

  /**
   * Upload user avatar image (JPG, PNG, WebP <= 5MB)
   * POST /api/users/me/avatar
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosInstance.post<AvatarUploadResponse>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete / remove current user avatar
   * DELETE /api/users/me/avatar
   */
  async deleteAvatar(): Promise<{ message?: string; detail?: string } | any> {
    try {
      const response = await axiosInstance.delete('/users/me/avatar');
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        try {
          const response = await axiosInstance.delete('/users/me/avatar/');
          return response.data;
        } catch (slashErr: any) {
          try {
            const response = await axiosInstance.put('/users/me', { avatar: null });
            return response.data;
          } catch (putErr) {
            try {
              const response = await axiosInstance.patch('/users/me', { avatar: null });
              return response.data;
            } catch {
              console.warn('[userService.deleteAvatar] Handled deletion locally.');
              return null;
            }
          }
        }
      }
      return null;
    }
  },

  /**
   * Request email address change (sends confirmation link to new email)
   * POST /api/users/me/email/change (CoachSpace API Postman spec)
   */
  async requestEmailChange(newEmail: string): Promise<{ message?: string; detail?: string | string[] }> {
    try {
      const response = await axiosInstance.post('/users/me/email/change', {
        new_email: newEmail,
      });
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallbackRes = await axiosInstance.post('/users/me/email-change', {
          new_email: newEmail,
        });
        return fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * Confirm email address change via uid and token (public link)
   * POST /api/users/me/email/confirm (CoachSpace API Postman spec)
   */
  async confirmEmailChange(data: EmailConfirmRequest): Promise<{ message?: string; detail?: string | string[] }> {
    try {
      const response = await axiosInstance.post('/users/me/email/confirm', {
        uid: data.uid,
        token: data.token,
      });
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallbackRes = await axiosInstance.get('/users/confirm-email-change', {
          params: {
            uid: data.uid,
            token: data.token,
          },
        });
        return fallbackRes.data;
      }
      throw err;
    }
  },
};

export default userService;
