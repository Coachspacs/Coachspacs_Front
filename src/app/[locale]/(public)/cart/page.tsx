'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { removeFromCart, clearCart } from '@/features/cart/cartSlice';
import { CartView, CartItem } from '@/components/cart/CartView';

export default function PublicCartPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isAr = locale === 'ar';
  const router = useRouter();
  const dispatch = useDispatch();

  const reduxCartItems = useSelector((state: RootState) => state.cart?.items || []);

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

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
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
          items={reduxCartItems.length > 0 ? formattedItems : []}
          onRemoveItem={handleRemove}
          onClearCart={handleClear}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
