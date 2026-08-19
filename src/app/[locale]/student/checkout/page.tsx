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
  const totalPrice = cartItems.reduce((acc, item: any) => acc + (item.price || item.course?.price || 0), 0) || 89.99;

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
        router.push(`/${locale}/student/profile`);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 text-center md:text-left">{t('title')}</h1>

      {isSuccess ? (
        <Card className="p-12 text-center space-y-4 max-w-lg mx-auto bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-900">Enrollment Successful!</h2>
          <p className="text-sm text-slate-600">{t('success')}</p>
        </Card>
      ) : (
        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 space-y-6 bg-white border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0F5244]" />
                {t('paymentMethod')}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#0F5244] bg-emerald-50 text-[#0F5244]'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {t('creditCard')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'border-[#0F5244] bg-emerald-50 text-[#0F5244]'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
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
            <Card className="p-6 space-y-4 bg-white border border-slate-200">
              <h2 className="text-base font-bold text-slate-900">{t('orderSummary')}</h2>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Items ({cartItems.length || 1}):</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total:</span>
                <span className="text-[#0F5244]">${totalPrice.toFixed(2)}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isProcessing}
                className="w-full py-3 bg-[#0F5244] hover:bg-[#07382E] text-white font-bold rounded-2xl cursor-pointer"
              >
                {isProcessing ? t('processing') : t('payNow')}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}
