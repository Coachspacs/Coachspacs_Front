import { apiSlice } from '@/features/api/apiSlice';
import {
  UserProfileResponse,
  UpdateProfileRequest,
  AvatarUploadResponse,
  EmailConfirmRequest,
} from '@/types/user';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<UserProfileResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    uploadAvatar: builder.mutation<AvatarUploadResponse, FormData>({
      query: (formData) => ({
        url: '/users/me/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    requestEmailChange: builder.mutation<{ message?: string; detail?: string | string[] }, { new_email: string }>({
      query: (body) => ({
        url: '/users/me/email/change',
        method: 'POST',
        body,
      }),
    }),
    confirmEmailChange: builder.mutation<{ message?: string; detail?: string | string[] }, EmailConfirmRequest>({
      query: (body) => ({
        url: '/users/me/email/confirm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
} = userApi;
