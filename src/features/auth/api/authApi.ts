import { apiSlice } from '@/features/api/apiSlice';
import { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  refreshToken?: string;
  message?: string;
  detail?: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}

export interface VerifyEmailRequest {
  uid: string;
  token: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    verifyEmail: builder.query<AuthResponse, VerifyEmailRequest>({
      query: ({ uid, token }) => ({
        url: `/auth/verify-email?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),
    resendVerificationEmail: builder.mutation<AuthResponse, ResendVerificationEmailRequest>({
      query: (body) => ({
        url: '/auth/resend-verification-email',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailQuery,
  useResendVerificationEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
