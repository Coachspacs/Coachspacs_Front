import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/slice';
import cartReducer from '@/features/cart/cartSlice';
import { apiSlice } from '@/features/api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
