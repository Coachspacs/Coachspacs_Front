import { apiSlice } from '@/features/api/apiSlice';
import { CategoryItem } from '@/types/catalog';
import { CourseListParams, PaginatedCourseResponse } from '@/services/courseService';

export const catalogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryItem[], string | void>({
      query: (locale) => ({
        url: '/catalog/categories',
        method: 'GET',
        headers: locale ? { 'Accept-Language': locale } : undefined,
      }),
    }),
    getCourses: builder.query<PaginatedCourseResponse, { params?: CourseListParams; locale?: string } | void>({
      query: (args) => ({
        url: '/catalog/courses',
        method: 'GET',
        params: args?.params,
        headers: args?.locale ? { 'Accept-Language': args.locale } : undefined,
      }),
      providesTags: ['Course'],
    }),
    getCourseById: builder.query<any, { id: string | number; locale?: string }>({
      query: ({ id, locale }) => ({
        url: `/catalog/courses/${id}`,
        method: 'GET',
        headers: locale ? { 'Accept-Language': locale } : undefined,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Course', id }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCoursesQuery,
  useGetCourseByIdQuery,
} = catalogApi;

