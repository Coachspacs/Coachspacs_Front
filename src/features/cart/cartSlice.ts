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
  items: [],
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
      const targetId = String(action.payload);
      state.items = state.items.filter((item: any) => {
        const cId = item.course?.id !== undefined ? String(item.course.id) : "";
        const itemId = item.id !== undefined ? String(item.id) : "";
        const courseId = item.courseId !== undefined ? String(item.courseId) : "";
        const cartItemId = (item as any).cartItemId !== undefined ? String((item as any).cartItemId) : "";
        return (
          cId !== targetId &&
          itemId !== targetId &&
          courseId !== targetId &&
          cartItemId !== targetId
        );
      });
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, clearCart, syncCartFromStorage, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
