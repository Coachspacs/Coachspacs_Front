import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';
import { getCurrentLocale } from '@/lib/axios';
import { tokenManager } from '@/lib/tokenManager';

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
const baseURL = rawBaseURL.replace(/\/+$/, '');

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept-Language', getCurrentLocale());
      const token = (getState() as RootState).auth.token || tokenManager.getAccessToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Course', 'User', 'Cart', 'Certificate'],
  endpoints: () => ({}),
});
