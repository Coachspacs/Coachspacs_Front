import axiosInstance from '@/lib/axios';
import { CategoryItem } from '@/types/catalog';

/**
 * Category Service
 * Connects to /api/catalog/categories endpoint (bilingual)
 */
export const categoryService = {
  /**
   * Fetch all categories
   * GET /api/catalog/categories
   * Header Accept-Language: 'ar' | 'en' determines the localized name returned
   */
  async getCategories(locale?: string): Promise<CategoryItem[]> {
    const headers: Record<string, string> = {};
    if (locale) {
      headers['Accept-Language'] = locale;
    }
    const response = await axiosInstance.get<CategoryItem[]>('/catalog/categories', {
      headers,
    });
    return response.data;
  },
};

export default categoryService;
