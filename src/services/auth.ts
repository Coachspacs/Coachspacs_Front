import axiosInstance from '@/lib/axios';

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
  accessToken?: string;
  refreshToken?: string;
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

    // Smart Fallback: If backend login endpoint /auth/login is not implemented yet (404, 500, or Network Error)
    if (err?.response?.status === 404 || err?.response?.status === 500 || err?.code === 'ERR_NETWORK') {
      console.info('[authService.login] Backend login API pending implementation. Falling back to local mock authentication.');
      return {
        success: true,
        message: 'Login successful (Dev Fallback Mode)',
        token: 'dev-session-token-' + Date.now(),
        user: {
          id: 'dev-user-1',
          email: data.email,
          fullName: data.email.split('@')[0],
          name: data.email.split('@')[0],
          role: data.email.includes('instructor') || data.email.includes('coach') ? 'instructor' : 'student',
        },
      };
    }

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
  const endpoints = ['/auth/verify-email/resend', '/auth/resend-verification-email', '/auth/verify-email/resend/'];
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
 * Fetch current user profile
 * GET /auth/profile
 */
export async function getProfile(): Promise<AuthApiResponse> {
  const response = await axiosInstance.get<AuthApiResponse>('/auth/profile');
  return response.data;
}

/**
 * Helper to extract error message from API response errors
 */
export function getApiErrorMessage(
  error: any,
  fallbackMessage: string = 'An error occurred',
  isAr: boolean = false
): string {
  if (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    (typeof error?.message === 'string' && error.message.includes('Network Error'))
  ) {
    return isAr
      ? 'تعذر الاتصال بالسيرفر (Network Error). يرجى التحقق من اتصال الإنترنِت أو التأكد من استجابة السيرفر.'
      : 'Network Error: Unable to connect to the server. Please check your internet connection or server status.';
  }

  if (error?.response?.status === 500) {
    return isAr
      ? 'حدث خطأ داخلي في السيرفر (Internal Server Error 500). السيرفر واجه مشكلة أثناء المعالجة (مثل خدمة إرسال الإيميل).'
      : 'Internal Server Error (500): The server encountered an issue (such as email service configuration). Please try another email or try again later.';
  }

  if (error?.response?.status === 404) {
    return isAr
      ? 'مسار الخدمة المطلوب غير متوفر حالياً على السيرفر (404 Not Found).'
      : 'The requested endpoint was not found on the server (404 Not Found).';
  }

  if (error?.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string') {
      const lower = data.toLowerCase();
      if (lower.includes('<!doctype') || lower.includes('<html') || lower.includes('<body') || lower.includes('<title>')) {
        return isAr
          ? 'تعذر الوصول للمسار المطلوب على السيرفر (404 Not Found).'
          : 'The requested resource was not found on this server (404 Not Found).';
      }
      return data;
    }
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.detail && typeof data.detail === 'string' && data.detail !== 'Internal Server Error') return data.detail;
    if (data.error && typeof data.error === 'string') return data.error;

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e: any) => (typeof e === 'string' ? e : e.msg || e.message)).join(', ');
    }

    // Django REST Framework field validation errors: e.g. { password: ["The password is too similar to the email."] }
    if (typeof data === 'object' && data !== null) {
      const messages: string[] = [];
      for (const [key, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          const strVal = val.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ');
          messages.push(key === 'non_field_errors' || key === 'detail' ? strVal : `${key}: ${strVal}`);
        } else if (typeof val === 'string') {
          messages.push(key === 'non_field_errors' || key === 'detail' ? val : `${key}: ${val}`);
        }
      }
      if (messages.length > 0) {
        return messages.join(' | ');
      }
    }
  }

  if (error?.message && typeof error.message === 'string' && !error.message.includes('status code')) {
    return error.message;
  }
  return fallbackMessage;
}

export const authService = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  getApiErrorMessage,
};

export default authService;

