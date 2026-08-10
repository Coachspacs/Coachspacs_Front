'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { removeFromCart, clearCart } from '@/features/cart/cartSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const t = useTranslations('cart');
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === 'ar';
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.course.price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-brand-400" />
        {t('title')}
      </h1>

      {cartItems.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-md mx-auto">
          <p className="text-slate-400">{t('empty')}</p>
          <Link href={`/${locale}/catalog`}>
            <Button variant="primary" className="gap-2">
              <span>{t('browseCatalog')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(({ course }) => {
              const c = course as any;
              const imgUrl = c.coverImage || c.thumbnail || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80";
              const instructorName = isAr ? (c.instructorNameAr || c.instructor?.name) : (c.instructorName || c.instructor?.name || "Coach Space Instructor");
              const displayTitle = isAr ? (c.titleAr || c.title) : c.title;
              const displayPrice = c.priceFormatted || `$${c.price}`;

              return (
                <Card key={course.id} className="p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-32 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={imgUrl} alt={displayTitle} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow space-y-1 text-center sm:text-left rtl:sm:text-right">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{displayTitle}</h3>
                    <p className="text-xs text-slate-400">{t('by')} {instructorName}</p>
                    <span className="text-base font-extrabold text-brand-400">{displayPrice}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(removeFromCart(course.id))}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              );
            })}

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => dispatch(clearCart())} className="text-slate-400 text-xs">
                {t('clearCart')}
              </Button>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-white pb-4 border-b border-slate-800">
                {t('orderSummary')}
              </h2>
              <div className="flex justify-between items-center text-lg font-extrabold text-white">
                <span>{t('total')}</span>
                <span className="text-brand-400">${totalPrice.toFixed(2)}</span>
              </div>
              <Button onClick={() => router.push(`/${locale}/checkout`)} className="w-full gap-2 py-3">
                <span>{t('checkout')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
