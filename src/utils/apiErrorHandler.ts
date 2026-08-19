import arMessages from '../../messages/ar.json';
import enMessages from '../../messages/en.json';

const DJANGO_ARABIC_TRANSLATIONS: Record<string, string> = {
  'No active account found with the given credentials.':
    'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم تفعيل الحساب بعد.',
  'This verification link is invalid or has expired.':
    'رابط التحقق غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.',
  'This password is too common.':
    'كلمة المرور هذه شائعة وسهلة التخمين، يرجى اختيار كلمة مرور أقوى.',
  'This password is too short. It must contain at least 8 characters.':
    'كلمة المرور قصيرة جداً، يجب أن تتكون من 8 خانات على الأقل.',
  'This password is too similar to the email.':
    'كلمة المرور مطابقة أو شديدة الشبه بالبريد الإلكتروني، يرجى تغييرها.',
  'A user with that email already exists.':
    'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.',
  'user with this email already exists.':
    'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.',
  'Custom user with this email already exists.':
    'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.',
  'Token is invalid or expired':
    'الرمز غير صالح أو انتهت صلاحيته.',
  'Invalid token':
    'رمز غير صالح أو منتهي الصلاحية.',
  'Given token not valid for any token type':
    'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.',
};

/**
 * Standardized API Error Parser for LMS Frontend
 * Handles:
 * - Network Errors & Server Offline (sourced from JSON translations)
 * - 500 Internal Server Errors (sourced from JSON translations)
 * - 404 Not Found & HTML Error responses (sourced from JSON translations)
 * - Django REST Framework validation errors (field errors, non_field_errors, detail, message)
 * - Bilingual Arabic & English messages loaded from messages/*.json
 */
export function getApiErrorMessage(
  error: any,
  fallbackMessage?: string,
  isAr: boolean = false
): string {
  const dictionary = isAr ? arMessages?.apiErrors : enMessages?.apiErrors;
  const defaultFallback = fallbackMessage || dictionary?.fallback || '';

  if (!error) return defaultFallback;

  const translateMsg = (msg: string): string => {
    if (!isAr || !msg) return msg;
    const trimmed = msg.trim();
    if (DJANGO_ARABIC_TRANSLATIONS[trimmed]) {
      return DJANGO_ARABIC_TRANSLATIONS[trimmed];
    }
    for (const [enPattern, arTranslation] of Object.entries(DJANGO_ARABIC_TRANSLATIONS)) {
      if (trimmed.toLowerCase().includes(enPattern.toLowerCase())) {
        return arTranslation;
      }
    }
    return msg;
  };

  // 1. Network / Connection Errors
  if (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.message === 'Network Error' ||
    (typeof error?.message === 'string' && error.message.toLowerCase().includes('network error'))
  ) {
    return dictionary?.networkError || defaultFallback;
  }

  // 2. Server 5xx Errors (500, 502, 503, 504)
  if (error?.response?.status >= 500) {
    const status = error.response.status;
    const template = dictionary?.serverError || defaultFallback;
    return template.replace('{status}', String(status));
  }

  // 3. Server 404 Errors
  if (error?.response?.status === 404) {
    return dictionary?.notFound || defaultFallback;
  }

  // 4. Parse Structured Response Data
  if (error?.response?.data) {
    const data = error.response.data;

    // Check if the response returned an HTML string (e.g. default Nginx/Express/Django 404 page)
    if (typeof data === 'string') {
      const lower = data.toLowerCase();
      if (
        lower.includes('<!doctype') ||
        lower.includes('<html') ||
        lower.includes('<body') ||
        lower.includes('<title>')
      ) {
        return dictionary?.resourceNotFound || dictionary?.notFound || defaultFallback;
      }
      return translateMsg(data);
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return translateMsg(data.message);
    }

    if (typeof data.detail === 'string' && data.detail.trim() && data.detail !== 'Internal Server Error') {
      return translateMsg(data.detail);
    }

    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail.map((d: any) => translateMsg(typeof d === 'string' ? d : JSON.stringify(d))).join(' ');
    }

    if (typeof data.error === 'string' && data.error.trim()) {
      return translateMsg(data.error);
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((e: any) => translateMsg(typeof e === 'string' ? e : e?.msg || e?.message || JSON.stringify(e)))
        .join(', ');
    }

    // Django REST Framework dictionary validation errors:
    // e.g. { password: ["This password is too common."], email: ["User already exists."] }
    if (typeof data === 'object' && data !== null) {
      const messages: string[] = [];
      for (const [key, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          const strVal = val.map((item) => translateMsg(typeof item === 'string' ? item : JSON.stringify(item))).join(' ');
          messages.push(key === 'non_field_errors' || key === 'detail' || key === 'message' ? strVal : `${key}: ${strVal}`);
        } else if (typeof val === 'string') {
          const strVal = translateMsg(val);
          messages.push(key === 'non_field_errors' || key === 'detail' || key === 'message' ? strVal : `${key}: ${strVal}`);
        }
      }
      if (messages.length > 0) {
        return messages.join(' | ');
      }
    }
  }

  // 5. Generic Error Message
  if (error?.message && typeof error.message === 'string' && !error.message.includes('status code')) {
    return translateMsg(error.message);
  }

  return defaultFallback;
}
