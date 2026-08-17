/**
 * Standardized API Error Parser for LMS Frontend
 * Handles:
 * - Network Errors & Server Offline
 * - 500 Internal Server Errors
 * - 404 Not Found & HTML Error responses
 * - Django REST Framework validation errors (field errors, non_field_errors, detail, message)
 * - Bilingual Arabic & English messages
 */
export function getApiErrorMessage(
  error: any,
  fallbackMessage: string = 'An error occurred',
  isAr: boolean = false
): string {
  if (!error) return fallbackMessage;

  // 1. Network / Connection Errors
  if (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.message === 'Network Error' ||
    (typeof error?.message === 'string' && error.message.toLowerCase().includes('network error'))
  ) {
    return isAr
      ? 'تعذر الاتصال بالسيرفر. يرجى التحقق من اتصال الإنترنِت أو التأكد من استجابة السيرفر.'
      : 'Network Error: Unable to connect to the server. Please check your internet connection or server status.';
  }

  // 2. Server 500 Errors
  if (error?.response?.status === 500) {
    return isAr
      ? 'حدث خطأ داخلي في السيرفر (500). يرجى المحاولة مرة أخرى لاحقاً.'
      : 'Internal Server Error (500): The server encountered an unexpected issue. Please try again later.';
  }

  // 3. Server 404 Errors
  if (error?.response?.status === 404) {
    return isAr
      ? 'مسار الخدمة المطلوب غير متوفر حالياً على السيرفر (404 Not Found).'
      : 'The requested endpoint was not found on the server (404 Not Found).';
  }

  // 4. Parse Structured Response Data
  if (error?.response?.data) {
    const data = error.response.data;

    // Check if the response returned an HTML string (e.g. default Nginx/Express/Django 404 page)
    if (typeof data === 'string') {
      const lower = data.toLowerCase();
      if (lower.includes('<!doctype') || lower.includes('<html') || lower.includes('<body') || lower.includes('<title>')) {
        return isAr
          ? 'تعذر الوصول للمسار المطلوب على السيرفر (404 Not Found).'
          : 'The requested resource was not found on this server (404 Not Found).';
      }
      return data;
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof data.detail === 'string' && data.detail.trim() && data.detail !== 'Internal Server Error') {
      return data.detail;
    }

    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((e: any) => (typeof e === 'string' ? e : e?.msg || e?.message || JSON.stringify(e)))
        .join(', ');
    }

    // Django REST Framework dictionary validation errors:
    // e.g. { password: ["This password is too common."], email: ["User already exists."] }
    if (typeof data === 'object' && data !== null) {
      const messages: string[] = [];
      for (const [key, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          const strVal = val.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ');
          messages.push(key === 'non_field_errors' || key === 'detail' || key === 'message' ? strVal : `${key}: ${strVal}`);
        } else if (typeof val === 'string') {
          messages.push(key === 'non_field_errors' || key === 'detail' || key === 'message' ? val : `${key}: ${val}`);
        }
      }
      if (messages.length > 0) {
        return messages.join(' | ');
      }
    }
  }

  // 5. Generic Error Message
  if (error?.message && typeof error.message === 'string' && !error.message.includes('status code')) {
    return error.message;
  }

  return fallbackMessage;
}
