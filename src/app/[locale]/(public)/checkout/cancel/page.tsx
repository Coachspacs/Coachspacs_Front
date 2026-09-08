"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";

export default function CheckoutCancelPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 font-sans bg-[#F8FAFC]"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Warning Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
          <AlertCircle className="w-10 h-10 stroke-[2]" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isAr ? "تم إلغاء عملية الدفع" : "Payment Cancelled"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {isAr
              ? "لم يتم خصم أي مبالغ من بطاقتك. الكورسات ما زالت محفوظة في سلة التسوق الخاصة بك ويمكنك إتمام الشراء في أي وقت."
              : "No charges were made to your account. Your selected courses are still safely in your cart whenever you are ready."}
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-2 space-y-3">
          <Link
            href={`/${locale}/cart`}
            className="w-full py-4 px-6 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-98"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isAr ? "العودة إلى سلة التسوق" : "Return to Cart"}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>

          <Link
            href={`/${locale}/courses`}
            className="w-full py-3 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180 text-slate-400" />
            <span>{isAr ? "تصفح الكورسات الأخرى" : "Browse Other Courses"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
