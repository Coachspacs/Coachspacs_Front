import axiosInstance from '@/lib/axios';
import { tokenManager } from '@/lib/tokenManager';
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
export async function refreshToken(refresh?: string): Promise<{ access: string }> {
  const tokenToUse = refresh || tokenManager.getRefreshToken();
  if (!tokenToUse) {
    throw new Error('No refresh token available');
  }
  const response = await axiosInstance.post<{ access: string }>('/auth/refresh', {
    refresh: tokenToUse,
  });
  if (response.data?.access) {
    tokenManager.setAccessToken(response.data.access);
  }
  return response.data;
}

/**
 * Logout user and blacklist refresh token
 * POST /api/auth/logout
 */
export async function logout(refresh?: string): Promise<AuthApiResponse> {
  try {
    const tokenToBlacklist = refresh || tokenManager.getRefreshToken();
    if (tokenToBlacklist) {
      await axiosInstance.post<AuthApiResponse>('/auth/logout', {
        refresh: tokenToBlacklist,
      });
    }
  } catch (err: any) {
    // Silent catch so client-side logout completes cleanly
  } finally {
    tokenManager.clearTokens();
  }
  return { success: true };
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
 * Safely decodes JWT payload claims from a Bearer token.
 */
export function decodeJwt<T = any>(token?: string | null): T | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
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
 * Fetch current user profile with automatic fallback
 * GET /api/auth/profile
 */
export async function getProfile(): Promise<AuthApiResponse> {
  try {
    const response = await axiosInstance.get<AuthApiResponse>('/auth/profile');
    return response.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      try {
        const instRes = await axiosInstance.get<AuthApiResponse>('/instructor/profile');
        return { ...instRes.data, role: 'instructor' };
      } catch (iErr) {
        try {
          const studRes = await axiosInstance.get<AuthApiResponse>('/student/profile');
          return { ...studRes.data, role: 'student' };
        } catch (sErr) {
          throw err;
        }
      }
    }
    throw err;
  }
}

/**
 * Synchronizes and normalizes the current user's profile and approval status
 * directly from backend database API & JWT claims.
 */
export async function syncCurrentUserProfile(
  token?: string | null,
  loginResponse?: AuthApiResponse,
  loginEmail?: string
): Promise<{ user: any; approval_status: 'approved' | 'pending' | 'rejected' }> {
  const activeToken = token || tokenManager.getAccessToken();
  const decoded = decodeJwt<any>(activeToken);

  let rawUser: any = loginResponse?.user || (loginResponse?.data && loginResponse.data.user) || (typeof loginResponse?.data === 'object' ? loginResponse.data : {}) || {};
  let dbProfile: any = null;
  let instructorAccessOk: boolean | null = null;

  // 1. Fetch live user profile from database
  try {
    const profileRes = await getProfile();
    dbProfile = profileRes.user || profileRes.data || profileRes;
    if (dbProfile && typeof dbProfile === 'object') {
      rawUser = { ...rawUser, ...dbProfile };
    }
  } catch (err: any) {
    console.warn('[authService.syncCurrentUserProfile] Profile fetch info:', err?.message);
  }

  // 2. Check candidate role indications
  const candidateRole = (
    rawUser.role ||
    rawUser.role_name ||
    rawUser.user_type ||
    rawUser.account_type ||
    decoded?.role ||
    decoded?.role_name ||
    decoded?.user_type ||
    (loginResponse?.role ? loginResponse.role : undefined) ||
    ''
  ).toLowerCase();

  const isExplicitStudent =
    candidateRole === 'student' ||
    candidateRole.startsWith('student') ||
    rawUser.is_student === true ||
    decoded?.is_student === true;

  const isExplicitInstructor =
    candidateRole.includes('instructor') ||
    candidateRole.includes('coach') ||
    candidateRole.includes('teacher') ||
    rawUser.is_instructor === true ||
    decoded?.is_instructor === true;

  // 3. Determine final normalized role
  let role: 'student' | 'instructor' = 'student';
  if (isExplicitStudent && !isExplicitInstructor) {
    role = 'student';
  } else if (isExplicitInstructor) {
    role = 'instructor';
  } else {
    role = 'student';
  }

  // 4. If instructor, verify approval status and live dashboard access
  let approval_status: 'approved' | 'pending' | 'rejected' = 'approved';
  if (role === 'instructor') {
    try {
      const dashRes = await getInstructorDashboard();
      if (dashRes) {
        instructorAccessOk = true;
      }
    } catch (dErr: any) {
      if (dErr?.response?.status === 403 || dErr?.response?.status === 401) {
        instructorAccessOk = false;
      }
    }

    const candidateStatus = (
      rawUser.approval_status ||
      rawUser.approvalStatus ||
      rawUser.status ||
      decoded?.approval_status ||
      decoded?.approvalStatus ||
      loginResponse?.approval_status ||
      loginResponse?.approvalStatus ||
      ''
    ).toLowerCase();

    if (candidateStatus === 'rejected') {
      approval_status = 'rejected';
    } else if (candidateStatus === 'approved' || instructorAccessOk === true) {
      approval_status = 'approved';
    } else if (candidateStatus === 'pending' || instructorAccessOk === false) {
      approval_status = 'pending';
    } else {
      approval_status = 'pending';
    }
  }

  const email =
    rawUser.email ||
    decoded?.email ||
    (loginResponse as any)?.email ||
    loginEmail ||
    (typeof window !== 'undefined' ? localStorage.getItem('loginEmail') : '') ||
    '';

  if (email && typeof window !== 'undefined') {
    localStorage.setItem('loginEmail', email);
  }

  const emailPrefix = email ? email.split('@')[0] : '';
  const formattedPrefix = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'User';

  const fullName =
    rawUser.fullName ||
    rawUser.full_name ||
    rawUser.name ||
    decoded?.name ||
    decoded?.full_name ||
    decoded?.username ||
    formattedPrefix;

  const normalizedUser = {
    id: String(rawUser.id || rawUser.pk || decoded?.user_id || decoded?.id || decoded?.sub || '1'),
    email,
    fullName,
    name: fullName,
    role,
    avatar: rawUser.avatar || rawUser.profile_picture || rawUser.image || null,
    headline: rawUser.headline || rawUser.title || (role === 'instructor' ? 'Certified Instructor' : 'Student & Lifelong Learner'),
    bio: rawUser.bio || rawUser.description || '',
    phone: rawUser.phone || rawUser.phone_number || '',
    specialization: rawUser.specialization || '',
    approval_status,
    approvalStatus: approval_status,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  }

  return {
    user: normalizedUser,
    approval_status,
  };
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
  decodeJwt,
  syncCurrentUserProfile,
  getApiErrorMessage,
};

export default authService;
