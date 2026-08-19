import { apiSlice } from '@/features/api/apiSlice';
import { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  access?: string;
  refresh?: string;
  refreshToken?: string;
  role?: 'student' | 'instructor' | string;
  approval_status?: 'pending' | 'approved' | 'rejected' | string;
  message?: string;
  detail?: string | string[];
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
        url: '/auth/verify-email/resend',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/password/forgot',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { uid?: string; token: string; password: string }>({
      query: (body) => ({
        url: '/auth/password/reset',
        method: 'POST',
        body: {
          uid: body.uid,
          token: body.token,
          new_password: body.password,
          password: body.password,
        },
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
