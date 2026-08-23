import arMessages from '../../messages/ar.json';
import enMessages from '../../messages/en.json';

/**
 * Standardized API Error Parser for LMS Frontend
 * All translations and error messages are loaded dynamically from JSON translation files:
 * - messages/ar.json -> apiErrors
 * - messages/en.json -> apiErrors
 */
export function getApiErrorMessage(
  error: any,
  fallbackMessage?: string,
  isAr: boolean = false
): string {
  const dictionary = (isAr ? arMessages?.apiErrors : enMessages?.apiErrors) || {};
  const rawTranslations = (dictionary as any)?.translations;
  const defaultFallback = fallbackMessage || dictionary?.fallback || '';

  if (!error) return defaultFallback;

  const translateMsg = (msg: string): string => {
    if (!msg || typeof msg !== 'string') return '';
    const trimmed = msg.trim();
    const trimmedLower = trimmed.toLowerCase();

    // 1. Array of { pattern, message }
    if (Array.isArray(rawTranslations)) {
      for (const item of rawTranslations) {
        if (item?.pattern && trimmedLower.includes(item.pattern.toLowerCase())) {
          return item.message;
        }
      }
    } else if (typeof rawTranslations === 'object' && rawTranslations !== null) {
      // 2. Direct / substring match in key-value map
      if (rawTranslations[trimmed]) {
        return rawTranslations[trimmed];
      }
      const trimmedWithoutDot = trimmed.replace(/\.+$/, '');
      if (rawTranslations[trimmedWithoutDot]) {
        return rawTranslations[trimmedWithoutDot];
      }
      for (const [enPattern, translated] of Object.entries(rawTranslations)) {
        if (trimmedLower.includes(enPattern.toLowerCase())) {
          return translated as string;
        }
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
