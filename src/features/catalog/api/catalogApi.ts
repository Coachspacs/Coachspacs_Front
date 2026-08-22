import { apiSlice } from '@/features/api/apiSlice';
import { CategoryItem } from '@/types/catalog';

export const catalogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryItem[], string | void>({
      query: (locale) => ({
        url: '/catalog/categories',
        method: 'GET',
        headers: locale ? { 'Accept-Language': locale } : undefined,
      }),
    }),
  }),
});

export const { useGetCategoriesQuery } = catalogApi;
