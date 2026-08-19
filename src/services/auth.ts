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
  new_password?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthApiResponse<T = any> {
  success?: boolean;
  message?: string;
  detail?: string | string[];
  data?: T;
  token?: string;
  access?: string;
  accessToken?: string;
  refresh?: string;
  refreshToken?: string;
  role?: 'student' | 'instructor' | string;
  approval_status?: 'pending' | 'approved' | 'rejected' | string;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | string;
  user?: any;
}

/**
 * Log in an existing user
 * POST /api/auth/login
 */
export async function login(data: LoginRequest): Promise<AuthApiResponse> {
  const endpoint = '/auth/login';
  console.log(`[authService.login] POST -> ${endpoint}`, { email: data.email });

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
    });
    throw err;
  }
}

/**
 * Register a new student or instructor user
 * POST /api/auth/register
 */
export async function register(data: RegisterRequest): Promise<AuthApiResponse> {
  const endpoint = '/auth/register';
  console.log(`[authService.register] POST -> ${endpoint}`, {
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
    console.warn('[authService.register] Error during registration request:', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}

/**
 * Verify user email address with uid and token
 * GET /api/auth/verify-email?uid={uid}&token={token}
 */
export async function verifyEmail(params: VerifyEmailRequest): Promise<AuthApiResponse> {
  const endpoint = '/auth/verify-email';
  console.log(`[authService.verifyEmail] GET -> ${endpoint}`, {
    uid: params.uid,
    token: params.token ? '***' : undefined,
  });

  try {
    const response = await axiosInstance.get<AuthApiResponse>(endpoint, {
      params: {
        uid: params.uid,
        token: params.token,
      },
    });
    console.log('[authService.verifyEmail] Verification successful:', response.data);
    return response.data;
  } catch (err: any) {
    console.warn('[authService.verifyEmail] Verification error:', {
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}

/**
 * Resend verification email link
 * POST /api/auth/verify-email/resend
 */
export async function resendVerificationEmail(
  data: ResendVerificationEmailRequest
): Promise<AuthApiResponse> {
  const endpoint = '/auth/verify-email/resend';
  console.log(`[authService.resendVerificationEmail] POST -> ${endpoint}`, { email: data.email });

  try {
    const response = await axiosInstance.post<AuthApiResponse>(endpoint, {
      email: data.email,
    });
    return response.data;
  } catch (err: any) {
    console.warn('[authService.resendVerificationEmail] Resend error:', {
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}

/**
 * Send forgot password email
 * POST /api/auth/password/forgot
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<AuthApiResponse> {
  const endpoint = '/auth/password/forgot';
  console.log(`[authService.forgotPassword] POST -> ${endpoint}`, { email: data.email });

  try {
    const response = await axiosInstance.post<AuthApiResponse>(endpoint, {
      email: data.email,
    });
    return response.data;
  } catch (err: any) {
    console.warn('[authService.forgotPassword] Forgot password error:', {
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}

/**
 * Reset password with token and uid
 * POST /api/auth/password/reset
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<AuthApiResponse> {
  const endpoint = '/auth/password/reset';
  console.log(`[authService.resetPassword] POST -> ${endpoint}`, {
    uid: data.uid,
    token: data.token ? '***' : undefined,
  });

  const payload: any = {
    token: data.token,
    new_password: data.password || data.new_password,
    password: data.password || data.new_password,
  };
  if (data.uid) {
    payload.uid = data.uid;
  }

  try {
    const response = await axiosInstance.post<AuthApiResponse>(endpoint, payload);
    return response.data;
  } catch (err: any) {
    console.warn('[authService.resetPassword] Reset password error:', {
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}

/**
 * Refresh JWT access token
 * POST /api/auth/refresh
 */
export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const response = await axiosInstance.post<{ access: string }>('/auth/refresh', {
    refresh,
  });
  return response.data;
}

/**
 * Logout user and blacklist refresh token
 * POST /api/auth/logout
 */
export async function logout(refresh?: string): Promise<AuthApiResponse> {
  try {
    const tokenToBlacklist = refresh || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
    if (tokenToBlacklist) {
      const response = await axiosInstance.post<AuthApiResponse>('/auth/logout', {
        refresh: tokenToBlacklist,
      });
      return response.data;
    }
    return { success: true };
  } catch (err: any) {
    // Logout shouldn't block local clearing even if backend returns an error
    return { success: true };
  }
}

/**
 * Change password for authenticated user
 * PUT /api/auth/password/change
 */
export async function changePassword(data: ChangePasswordRequest): Promise<AuthApiResponse> {
  const response = await axiosInstance.put<AuthApiResponse>('/auth/password/change', {
    current_password: data.current_password,
    new_password: data.new_password,
  });
  return response.data;
}

/**
 * Get Instructor Dashboard (Access check for approved/pending instructors)
 * GET /api/auth/instructor/dashboard
 */
export async function getInstructorDashboard(): Promise<any> {
  const response = await axiosInstance.get('/auth/instructor/dashboard');
  return response.data;
}

/**
 * Fetch current user profile
 * GET /api/auth/profile
 */
export async function getProfile(): Promise<AuthApiResponse> {
  const response = await axiosInstance.get<AuthApiResponse>('/auth/profile');
  return response.data;
}

/**
 * Request changing account email address
 * POST /api/auth/change-email (or profile update)
 */
export async function requestEmailChange(newEmail: string): Promise<AuthApiResponse> {
  try {
    const response = await axiosInstance.post<AuthApiResponse>('/auth/change-email', {
      email: newEmail,
      new_email: newEmail,
    });
    return response.data;
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      const fallbackRes = await axiosInstance.put<AuthApiResponse>('/auth/profile', {
        email: newEmail,
      });
      return fallbackRes.data;
    }
    throw err;
  }
}

export { getApiErrorMessage };

export const authService = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  requestEmailChange,
  refreshToken,
  logout,
  changePassword,
  getInstructorDashboard,
  getProfile,
  getApiErrorMessage,
};

export default authService;
