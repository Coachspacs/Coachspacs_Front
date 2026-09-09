"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { clearCart } from "@/features/cart/cartSlice";
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Receipt,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();

  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  const orderId =
    searchParams?.get("order_id") ||
    searchParams?.get("orderId") ||
    searchParams?.get("session_id") ||
    "";

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 1. Clear cart in Redux & LocalStorage on successful payment return
    dispatch(clearCart());

    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (
            k &&
            (k.includes("checkout_url") ||
              k.includes("last_checkout_url") ||
              k.startsWith("coachspace_order_status_"))
          ) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }
  }, [dispatch]);

  // Seamless auto-redirect to student checkout success screen or student courses
  useEffect(() => {
    if (countdown <= 0) {
      const targetUrl = orderId
        ? `/${locale}/student/checkout?orderId=${orderId}&status=success`
        : `/${locale}/student/courses`;
      router.replace(targetUrl);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, locale, orderId, router]);

  const targetSuccessUrl = orderId
    ? `/${locale}/student/checkout?orderId=${orderId}&status=success`
    : `/${locale}/student/courses`;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 font-sans bg-[#F8FAFC]"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Success Badge */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
        </div>

        {/* Title & Order info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? "دفع مؤكد بنجاح" : "Payment Confirmed"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isAr ? "تم الدفع بنجاح! مبروك!" : "Payment Successful!"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            {isAr
              ? "تم استلام دفعتك وتفعيل الكورس في حسابك فوراً. يمكنك البدء بالدراسة الآن."
              : "Your payment was processed successfully and your enrollment is active. You can start learning right now."}
          </p>
        </div>

        {/* Order Details Mini Card */}
        {orderId && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 space-y-2 text-start">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400">
                {isAr ? "رقم الطلب:" : "Order Number:"}
              </span>
              <span className="font-extrabold text-[#0F5244]">
                #ORD-{orderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                {isAr ? "حالة الكورس:" : "Course Access:"}
              </span>
              <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {isAr ? "متاح للتعلم فوراً" : "Instant Access Enabled"}
              </span>
            </div>
          </div>
        )}

        {/* Countdown notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F5244]" />
          <span>
            {isAr
              ? `سيتم تحويلك إلى لوحة التحكم تلقائياً خلال ${countdown} ثوانٍ...`
              : `Redirecting to your course workspace in ${countdown}s...`}
          </span>
        </div>

        {/* Direct Action Buttons */}
        <div className="pt-2 space-y-3">
          <Link
            href={targetSuccessUrl}
            className="w-full py-4 px-6 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-98"
          >
            <BookOpen className="h-5 w-5" />
            <span>{isAr ? "الانتقال إلى الكورس الآن" : "Go to Course Now"}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>

          <Link
            href={`/${locale}/student/orders`}
            className="w-full py-3 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Receipt className="h-4 w-4 text-slate-500" />
            <span>{isAr ? "عرض سجل الطلبات والفواتير" : "View Order History"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
