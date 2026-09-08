'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { removeFromCart, clearCart, setCartItems, syncCartFromStorage } from '@/features/cart/cartSlice';
import { CartView, CartItem } from '@/components/cart/CartView';
import { cartService } from '@/services/cartService';

export default function PublicCartPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isAr = locale === 'ar';
  const router = useRouter();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const reduxCartItems = useSelector((state: RootState) => state.cart?.items || []);

  useEffect(() => {
    dispatch(syncCartFromStorage());
    if (!isAuthenticated) return;
    async function fetchLiveCart() {
      try {
        const cart = await cartService.getCart();
        if (cart?.items && Array.isArray(cart.items)) {
          const mapped = cart.items.map((item: any) => {
            const courseObj = item.course || {};
            return {
              id: String(item.id),
              courseId: String(courseObj.id || item.id),
              course: courseObj,
              title: isAr ? courseObj.title_ar || courseObj.title : courseObj.title_en || courseObj.title,
              price: typeof courseObj.price === "number" ? courseObj.price : parseFloat(courseObj.price || "0"),
              image: courseObj.cover_image || "/images/courses/course-leadership.png",
              addedAt: item.added_at || new Date().toISOString(),
            };
          });
          dispatch(setCartItems(mapped));
        }
      } catch (err) {
        // Fallback to local Redux cart
      }
    }
    fetchLiveCart();
  }, [isAuthenticated, dispatch, isAr]);

  const formattedItems: CartItem[] = reduxCartItems.map((item: any) => {
    const c = item.course || item;
    return {
      id: String(c.id || item.courseId || item.id),
      courseId: String(c.id || item.courseId || item.id),
      title: isAr ? (c.titleAr || c.title) : (c.titleEn || c.title),
      instructor: isAr ? (c.instructorNameAr || c.instructor?.name || c.instructor?.full_name || "مدرب المساحة") : (c.instructorName || c.instructor?.name || c.instructor?.full_name || "Coach Space Instructor"),
      instructorName: isAr ? (c.instructorNameAr || c.instructor?.name || c.instructor?.full_name || "مدرب المساحة") : (c.instructorName || c.instructor?.name || c.instructor?.full_name || "Coach Space Instructor"),
      price: typeof c.price === "number" ? c.price : parseFloat(c.price || "0"),
      image: c.coverImage || c.cover_image || c.image || c.thumbnail || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    };
  });

  const handleRemove = async (id: string) => {
    dispatch(removeFromCart(id));
    if (reduxCartItems.length <= 1) {
      dispatch(clearCart());
    }
    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(id);
      } catch {
        // Ignored
      }
    }
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    router.push(`/${locale}/student/checkout`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <CartView
          items={formattedItems}
          onRemoveItem={handleRemove}
          onClearCart={handleClear}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
