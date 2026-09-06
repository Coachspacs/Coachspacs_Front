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
      const exists = state.items.some(
        (item: any) => String(item.course?.id || item.courseId || item.id) === String(courseId)
      );
      if (!exists) {
        state.items.push({
          id: String(courseId),
          courseId: String(courseId),
          course: course,
          title: course.title || course.titleEn || course.titleAr || "",
          price: typeof course.price === "number" ? course.price : parseFloat(course.price || 0),
          image: course.image || course.coverImage || course.thumbnail || "",
          addedAt: new Date().toISOString(),
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter(
        (item: any) => String(item.course?.id || item.courseId || item.id) !== String(action.payload)
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
