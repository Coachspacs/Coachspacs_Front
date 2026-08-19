import axiosInstance from "@/lib/axios";

/**
 * Unified API Client
 * Re-exports the configured axiosInstance from @/lib/axios to ensure
 * single source of truth for BaseURL, Interceptors, and Token management.
 */
export const apiClient = axiosInstance;
export default apiClient;
