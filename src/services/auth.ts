import axiosInstance from '@/lib/axios';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';

export type UserRoleType = 'student' | 'instructor';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRoleType;
}

export interface VerifyEmailRequest {
  uid: string;
  token: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  uid?: string;
}

export interface AuthApiResponse<T = any> {
  success?: boolean;
  message?: string;
  detail?: string;
  data?: T;
  token?: string;
  access?: string;
  accessToken?: string;
  refresh?: string;
  refreshToken?: string;
  approval_status?: 'pending' | 'approved' | 'rejected' | string;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | string;
  user?: any;
}

/**
 * Log in an existing user
 * POST /auth/login
 */
export async function login(data: LoginRequest): Promise<AuthApiResponse> {
  const endpoint = '/auth/login';
  console.log(`[authService.login] Initiating POST request to ${axiosInstance.defaults.baseURL}${endpoint}`, {
    email: data.email,
  });

  try {
    const response = await axiosInstance.post<AuthApiResponse>(endpoint, {
      email: data.email,
      password: data.password,
    });
    console.log('[authService.login] Login successful:', response.data);
    return response.data;
  } catch (err: any) {
    console.warn('[authService.login] Error during login request:', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: err?.config?.url,
      code: err?.code,
    });
    throw err;
  }
}

/**
 * Register a new student or instructor user
 * POST /auth/register
 */
export async function register(data: RegisterRequest): Promise<AuthApiResponse> {
  const endpoint = '/auth/register';
  console.log(`[authService.register] Initiating POST request to ${axiosInstance.defaults.baseURL}${endpoint}`, {
    full_name: data.full_name,
    email: data.email,
    role: data.role,
  });

  try {
    const response = await axiosInstance.post<AuthApiResponse>(endpoint, {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: data.role,
    });
    console.log('[authService.register] Registration successful:', response.data);
    return response.data;
  } catch (err: any) {
    console.warn('[authService.register] Error during register request:', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: err?.config?.url,
      code: err?.code,
    });
    throw err;
  }
}

/**
 * Send forgot password email
 * POST /auth/forgot-password (with fallback endpoints)
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<AuthApiResponse> {
  const endpoints = ['/auth/forgot-password', '/auth/password-reset', '/auth/password/reset', '/auth/forgot-password/'];
  let lastErr: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await axiosInstance.post<AuthApiResponse>(endpoint, {
        email: data.email,
      });
      return response.data;
    } catch (err: any) {
      lastErr = err;
      if (err?.response?.status !== 404) {
        throw err;
      }
    }
  }
  throw lastErr;
}

/**
 * Reset password with token
 * POST /auth/reset-password (with fallback endpoints)
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<AuthApiResponse> {
  const endpoints = ['/auth/reset-password', '/auth/password-reset/confirm', '/auth/password/reset/confirm', '/auth/reset-password/'];
  let lastErr: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await axiosInstance.post<AuthApiResponse>(endpoint, {
        token: data.token,
        password: data.password,
        ...(data.uid ? { uid: data.uid } : {}),
      });
      return response.data;
    } catch (err: any) {
      lastErr = err;
      if (err?.response?.status !== 404) {
        throw err;
      }
    }
  }
  throw lastErr;
}

/**
 * Verify user email address with uid and token
 * GET /auth/verify-email?uid={uid}&token={token}
 */
export async function verifyEmail(params: VerifyEmailRequest): Promise<AuthApiResponse> {
  const response = await axiosInstance.get<AuthApiResponse>('/auth/verify-email', {
    params: {
      uid: params.uid,
      token: params.token,
    },
  });
  return response.data;
}

/**
 * Resend verification email link/code
 * POST /auth/verify-email/resend
 */
export async function resendVerificationEmail(
  data: ResendVerificationEmailRequest
): Promise<AuthApiResponse> {
  const response = await axiosInstance.post<AuthApiResponse>('/auth/verify-email/resend', {
    email: data.email,
  });
  return response.data;
}

/**
 * Refresh JWT access token
 * POST /auth/login/refresh
 */
export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const response = await axiosInstance.post<{ access: string }>('/auth/login/refresh', {
    refresh,
  });
  return response.data;
}

/**
 * Get Instructor Dashboard (Access check for approved/pending instructors)
 * GET /auth/instructor/dashboard
 */
export async function getInstructorDashboard(): Promise<any> {
  const response = await axiosInstance.get('/auth/instructor/dashboard');
  return response.data;
}

/**
 * Fetch current user profile
 * GET /auth/profile
 */
export async function getProfile(): Promise<AuthApiResponse> {
  const response = await axiosInstance.get<AuthApiResponse>('/auth/profile');
  return response.data;
}

export { getApiErrorMessage };

export const authService = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
  getInstructorDashboard,
  getProfile,
  getApiErrorMessage,
};

export default authService;

