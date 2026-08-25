import axios from "axios";
import { tokenManager } from "./tokenManager";

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || "/api";
const baseURL = rawBaseURL.replace(/\/+$/, "");

export const axiosInstance = axios.create({
  baseURL,
  timeout: 60000, // Accommodates Render free-tier cold starts
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper to detect current active locale dynamically
export function getCurrentLocale(): string {
  if (typeof window !== 'undefined') {
    // 1. Prioritize active URL locale prefix: /ar/... or /en/...
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0].toLowerCase();
      if (firstSegment === 'ar' || firstSegment === 'en') {
        return firstSegment;
      }
    }

    // 2. Check localized container lang attribute
    const containerLang = document.querySelector('[lang]')?.getAttribute('lang');
    if (containerLang && (containerLang === 'ar' || containerLang === 'en')) {
      return containerLang;
    }

    // 3. Check document.documentElement lang
    const htmlLang = document.documentElement?.lang;
    if (htmlLang && (htmlLang === 'ar' || htmlLang === 'en')) {
      return htmlLang;
    }

    // 4. Check cookies (e.g. NEXT_LOCALE)
    const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:NEXT_LOCALE|locale)=([^;]+)/);
    if (cookieMatch && (cookieMatch[1] === 'ar' || cookieMatch[1] === 'en')) {
      return cookieMatch[1];
    }
  }
  return 'en';
}

// ----------------------------------------------------
// Request Interceptor: Attach Bearer Token & Accept-Language
// ----------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // Do not set application/json for FormData so browser can set boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/json';
    }

    // Dynamically and explicitly attach Accept-Language header based on current active locale
    const currentLocale = getCurrentLocale();
    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Accept-Language', currentLocale);
    } else {
      config.headers['Accept-Language'] = currentLocale;
    }

    const token = tokenManager.getAccessToken();
    if (token && !config.headers.Authorization) {
      if (typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const fullUrl = (config.baseURL || '').replace(/\/+$/, '') + (config.url || '');
    console.log(`[Axios Request] ${config.method?.toUpperCase()} -> ${fullUrl}`, {
      locale: currentLocale,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// Response Interceptor: Automatic Silent Token Refresh
// ----------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    // If 401 Unauthorized occurs on a non-auth endpoint, attempt silent token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentRefreshToken = tokenManager.getRefreshToken();
        if (!currentRefreshToken) {
          throw new Error("No refresh token available");
        }

        let res;
        try {
          res = await axios.post(
            `${baseURL}/auth/refresh`,
            { refresh: currentRefreshToken },
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (rErr: any) {
          if (rErr?.response?.status === 404) {
            res = await axios.post(
              `${baseURL}/auth/login/refresh`,
              { refresh: currentRefreshToken },
              { headers: { "Content-Type": "application/json" } }
            );
          } else {
            throw rErr;
          }
        }

        const newAccessToken = res.data?.access || res.data?.token || res.data?.accessToken;
        const newRefreshToken = res.data?.refresh || res.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error("Token refresh response missing access token");
        }

        // Store new access token in memory
        tokenManager.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          tokenManager.setRefreshToken(newRefreshToken);
        }

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        tokenManager.clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
