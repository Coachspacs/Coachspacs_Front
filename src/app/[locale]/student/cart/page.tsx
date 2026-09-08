'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { removeFromCart, clearCart, setCartItems, syncCartFromStorage } from '@/features/cart/cartSlice';
import { CartView, CartItem } from '@/components/cart/CartView';
import { cartService } from '@/services/cartService';

export default function CartPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === 'ar';
  const router = useRouter();
  const dispatch = useDispatch();

  const reduxCartItems = useSelector((state: RootState) => state.cart.items || []);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    dispatch(syncCartFromStorage());

    async function fetchLiveCart() {
      try {
        const cart = await cartService.getCart();
        if (cart?.items && Array.isArray(cart.items) && cart.items.length > 0) {
          const mapped = cart.items.map((item: any) => {
            const courseObj = item.course || {};
            const courseId = String(courseObj.id || item.id);
            return {
              id: courseId,
              cartItemId: String(item.id),
              courseId: courseId,
              course: courseObj,
              title: isAr ? courseObj.title_ar || courseObj.title : courseObj.title_en || courseObj.title,
              price: typeof courseObj.price === "number" ? courseObj.price : parseFloat(courseObj.price || "0"),
              image: courseObj.cover_image || "/images/courses/course-leadership.png",
              addedAt: item.added_at || new Date().toISOString(),
            };
          });
          dispatch(setCartItems(mapped));
        } else if (reduxCartItems.length > 0) {
          // If server cart is empty but local Redux has items, sync them to server
          const courseIds = reduxCartItems
            .map((i: any) => i.courseId || i.course?.id || i.id)
            .filter(Boolean);
          if (courseIds.length > 0) {
            await cartService.syncItemsToServer(courseIds);
          }
        }
      } catch (err) {
        // Fallback to local Redux cart
      }
    }

    fetchLiveCart();
  }, [dispatch, isAr]);

  const formattedItems: CartItem[] = reduxCartItems.map((item: any) => {
    const c = item.course || item;
    const courseId = String(c.id || item.courseId || item.id);
    return {
      id: courseId,
      courseId: courseId,
      cartItemId: (item as any).cartItemId,
      title: isAr ? (c.titleAr || c.title) : (c.titleEn || c.title),
      instructor: isAr ? (c.instructorNameAr || c.instructor?.name || "مدرب المساحة") : (c.instructorName || c.instructor?.name || "Coach Space Instructor"),
      instructorName: isAr ? (c.instructorNameAr || c.instructor?.name || "مدرب المساحة") : (c.instructorName || c.instructor?.name || "Coach Space Instructor"),
      price: typeof c.price === "number" ? c.price : parseFloat(c.price || "0"),
      image: c.coverImage || c.image || c.thumbnail || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    };
  });

  const handleRemove = async (id: string) => {
    const target = reduxCartItems.find(
      (i: any) =>
        String(i.id) === String(id) ||
        String(i.courseId) === String(id) ||
        String(i.course?.id) === String(id)
    );
    const cartItemId = (target as any)?.cartItemId || (target as any)?.id || id;
    const courseId = target?.courseId || target?.course?.id || target?.id || id;

    dispatch(removeFromCart(courseId));
    dispatch(removeFromCart(id));

    // If this was the last item, explicitly clear the cart so no ghost items remain
    if (reduxCartItems.length <= 1) {
      dispatch(clearCart());
    }

    try {
      await cartService.removeFromCart(cartItemId);
      if (String(cartItemId) !== String(id)) {
        await cartService.removeFromCart(id);
      }
    } catch {
      // Ignored
    }
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  const handleCheckout = async () => {
    if (reduxCartItems.length === 0) return;

    setIsSyncing(true);
    try {
      // Ensure all items in cart are synced to backend server before navigating to checkout
      const courseIds = reduxCartItems
        .map((i: any) => i.courseId || i.course?.id || i.id)
        .filter(Boolean);

      if (courseIds.length > 0) {
        await cartService.syncItemsToServer(courseIds);
      }
    } catch (err) {
      console.warn("[CartPage] Pre-checkout sync warning:", err);
    } finally {
      setIsSyncing(false);
      router.push(`/${locale}/student/checkout`);
    }
  };

  return (
    <div className="w-full">
      <CartView
        items={formattedItems}
        onRemoveItem={handleRemove}
        onClearCart={handleClear}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
