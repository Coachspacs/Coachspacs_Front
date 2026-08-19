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
    addToCart: (state, action: PayloadAction<any>) => {
      const course = action.payload.course || action.payload;
      const courseId = course.id || action.payload.courseId;
      const exists = state.items.some((item: any) => (item.course?.id || item.courseId || item.id) === courseId);
      if (!exists) {
        state.items.push({
          id: courseId,
          courseId: courseId,
          course: course,
          title: course.title || course.titleEn || course.titleAr || "",
          price: course.price || 0,
          image: course.image || course.coverImage || course.thumbnail || "",
          addedAt: new Date().toISOString(),
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item: any) => (item.course?.id || item.courseId || item.id) !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
