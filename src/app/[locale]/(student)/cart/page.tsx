'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { removeFromCart, clearCart } from '@/features/cart/cartSlice';
import { CartView, CartItem } from '@/components/cart/CartView';

export default function CartPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === 'ar';
  const dispatch = useDispatch();

  const reduxCartItems = useSelector((state: RootState) => state.cart.items || []);

  const formattedItems: CartItem[] = reduxCartItems.map(({ course }) => {
    const c = course as any;
    return {
      id: course.id,
      title: isAr ? (c.titleAr || c.title) : c.title,
      instructor: isAr ? (c.instructorNameAr || c.instructor?.name || "مدرب المساحة") : (c.instructorName || c.instructor?.name || "Coach Space Instructor"),
      price: typeof c.price === "number" ? c.price : parseFloat(c.price || "89.99"),
      image: c.coverImage || c.thumbnail || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    };
  });

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CartView
        items={reduxCartItems.length > 0 ? formattedItems : undefined}
        onRemoveItem={handleRemove}
        onClearCart={handleClear}
      />
    </div>
  );
}
