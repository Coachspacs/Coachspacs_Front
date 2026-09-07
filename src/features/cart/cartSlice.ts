import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
}

const loadInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('coachspace_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
  }
  return [];
};

const saveCart = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('coachspace_cart', JSON.stringify(items));
    } catch {}
  }
};

const initialState: CartState = {
  items: loadInitialCart(),
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    syncCartFromStorage: (state) => {
      state.items = loadInitialCart();
    },
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
        saveCart(state.items);
      }
    },
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter(
        (item: any) => String(item.course?.id || item.courseId || item.id) !== String(action.payload)
      );
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
  },
});

export const { addToCart, removeFromCart, clearCart, syncCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
