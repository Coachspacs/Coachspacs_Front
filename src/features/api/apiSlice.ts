import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/lib/store';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.coachspace.example.com';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Course', 'User', 'Cart', 'Certificate'],
  endpoints: () => ({}),
});
