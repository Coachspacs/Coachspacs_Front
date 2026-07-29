import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Course>) => {
      const exists = state.items.some((item) => item.course.id === action.payload.id);
      if (!exists) {
        state.items.push({
          course: action.payload,
          addedAt: new Date().toISOString(),
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.course.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
