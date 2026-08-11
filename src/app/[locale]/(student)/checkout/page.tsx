'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { clearCart } from '@/features/cart/cartSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.course.price, 0) || 89.99;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      dispatch(clearCart());
      setTimeout(() => {
        router.push(`/${locale}/account`);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold text-white text-center md:text-left">{t('title')}</h1>

      {isSuccess ? (
        <Card className="p-12 text-center space-y-4 max-w-lg mx-auto bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Enrollment Successful!</h2>
          <p className="text-sm text-slate-300">{t('success')}</p>
        </Card>
      ) : (
        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-400" />
                {t('paymentMethod')}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  {t('creditCard')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  {t('payPal')}
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 pt-2">
                  <Input label="Card Number" placeholder="4532 •••• •••• 8890" required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry Date" placeholder="MM/YY" required />
                    <Input label="CVC / CVV" placeholder="123" type="password" required />
                  </div>
                  <Input label="Cardholder Name" placeholder="Mohammed Katanani" required />
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary & Submit */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-white pb-4 border-b border-slate-800">
                {t('orderSummary')}
              </h2>

              <div className="space-y-2 text-xs text-slate-300">
                {cartItems.length > 0 ? (
                  cartItems.map(({ course }) => (
                    <div key={course.id} className="flex justify-between">
                      <span className="line-clamp-1">{course.title}</span>
                      <span className="font-bold">${course.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between">
                    <span>Next.js 15 & React 19 Masterclass</span>
                    <span className="font-bold">$89.99</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-lg font-extrabold text-white">
                <span>Total</span>
                <span className="text-brand-400">${totalPrice.toFixed(2)}</span>
              </div>

              <Button type="submit" isLoading={isProcessing} className="w-full py-3">
                {t('completeOrder')}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-bit SSL Encrypted Payment</span>
              </div>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}
