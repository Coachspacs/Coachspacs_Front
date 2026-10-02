import axiosInstance from '@/lib/axios';
import { CategoryItem } from '@/types/catalog';

interface CacheEntry {
  data: CategoryItem[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const categoryCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<CategoryItem[]>>();

/**
 * Category Service
 * Connects to /api/catalog/categories endpoint (bilingual) with smart TTL caching and deduplication
 */
export const categoryService = {
  /**
   * Fetch all categories
   * GET /api/catalog/categories
   * Header Accept-Language: 'ar' | 'en' determines the localized name returned
   */
  async getCategories(locale?: string, forceFresh = false): Promise<CategoryItem[]> {
    const key = locale || 'en';

    if (!forceFresh) {
      const cached = categoryCache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }

    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)!;
    }

    const headers: Record<string, string> = {};
    if (locale) {
      headers['Accept-Language'] = locale;
    }

    const fetchPromise = axiosInstance
      .get<CategoryItem[]>('/catalog/categories', { headers })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        categoryCache.set(key, { data, timestamp: Date.now() });
        return data;
      })
      .finally(() => {
        pendingRequests.delete(key);
      });

    pendingRequests.set(key, fetchPromise);
    return fetchPromise;
  },

  /**
   * Clears the in-memory categories cache
   */
  clearCache(): void {
    categoryCache.clear();
    pendingRequests.clear();
  },
};

export default categoryService;

