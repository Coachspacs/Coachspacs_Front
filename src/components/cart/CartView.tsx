"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Trash2, ArrowRight, ShoppingBag, Search, Loader2, AlertCircle } from "lucide-react";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";

export interface CartItem {
  id: string;
  courseId?: string;
  title: string;
  instructor: string;
  price: number;
  image: string;
}

export interface CartViewProps {
  items?: CartItem[];
  onRemoveItem?: (id: string) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
}

export function CartView({ items, onRemoveItem, onCheckout }: CartViewProps) {
  const t = useTranslations("cart");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();

  const [localItems, setLocalItems] = useState<CartItem[]>(items || []);

  // Synchronize localItems whenever the items prop updates
  useEffect(() => {
    if (items !== undefined) {
      setLocalItems(items);
    }
  }, [items]);

  const displayItems = items !== undefined ? items : localItems;

  const handleRemove = async (id: string) => {
    // Optimistic immediate removal from local view
    setLocalItems((prev) =>
      prev.filter(
        (item) =>
          String(item.id) !== String(id) &&
          String(item.courseId) !== String(id)
      )
    );

    if (onRemoveItem) {
      onRemoveItem(id);
    }
    try {
      await cartService.removeFromCart(id);
    } catch {
      // Ignored: removed locally
    }
  };

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckoutClick = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=/${locale}/student/cart`);
      return;
    }

    if (displayItems.length === 0) return;

    if (onCheckout) {
      onCheckout();
      return;
    }

    setIsProcessingCheckout(true);
    setCheckoutError(null);

    try {
      let response;
      try {
        response = await orderService.createCheckoutSession();
      } catch (initialErr: any) {
        // If backend cart is empty or missing items, sync display items to backend and retry
        const errDetail = String(
          initialErr?.response?.data?.detail ||
          initialErr?.response?.data?.message ||
          ""
        ).toLowerCase();
        const status = initialErr?.response?.status;

        if (status === 400 || errDetail.includes("empty") || errDetail.includes("cart") || errDetail.includes("item")) {
          let addedCount = 0;
          for (const itm of displayItems) {
            const rawId = itm.courseId || itm.id;
            const cId = Number(rawId);
            if (cId && !isNaN(cId)) {
              try {
                const addRes = await cartService.addToCart(cId);
                if (addRes && !addRes.already_enrolled) {
                  addedCount++;
                }
              } catch {
                // Ignore if already in cart
              }
            }
          }
          if (addedCount > 0) {
            // Retry checkout after sync
            response = await orderService.createCheckoutSession();
          } else {
            throw new Error(
              initialErr?.response?.data?.detail ||
              (isAr
                ? "سلة التسوق فارغة أو أنك مسجل بالفعل في هذه الدورات."
                : "Your cart is empty or you are already enrolled in these courses.")
            );
          }
        } else {
          throw initialErr;
        }
      }

      if (response?.checkout_url) {
        if (typeof window !== "undefined") {
          localStorage.setItem("coachspace_last_checkout_url", response.checkout_url);
          for (const itm of displayItems) {
            const rawId = itm.courseId || itm.id;
            if (rawId) {
              localStorage.setItem(`coachspace_checkout_url_course_${rawId}`, response.checkout_url);
            }
          }
          if (response.order?.id) {
            localStorage.setItem(`coachspace_checkout_url_order_${response.order.id}`, response.checkout_url);
          }
        }
        window.location.href = response.checkout_url;
      } else {
        throw new Error(
          isAr ? "لم نتمكن من الحصول على رابط بوابة الدفع" : "No checkout URL returned"
        );
      }
    } catch (err: any) {
      console.warn("[CartView] Checkout error:", err?.message || err);
      setIsProcessingCheckout(false);
      const data = err?.response?.data;
      const skipped = Array.isArray(data?.skipped_items) ? data.skipped_items : [];

      if (skipped.some((s: any) => s.reason === "checkout_in_progress")) {
        const savedUrl = typeof window !== "undefined" ? localStorage.getItem("coachspace_last_checkout_url") : null;
        if (savedUrl) {
          window.location.href = savedUrl;
          return;
        }
      }

      const msg =
        data?.detail ||
        data?.message ||
        err?.message ||
        (isAr
          ? "تعذر إطلاق جلسة الدفع عبر Stripe. يرجى التحقق من اتصالك والمحاولة لاحقاً."
          : "Failed to initiate payment session with Stripe. Please try again.");
      setCheckoutError(msg);
    }
  };

  const totalPrice = displayItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="w-full space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* Title & Count Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-400">
          {t("itemsCount", { count: displayItems.length })}
        </p>
      </div>

      {displayItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center space-y-6 shadow-2xs max-w-2xl mx-auto">
          {/* Centered Mint Green Shopping Bag Image */}
          <div className="flex justify-center">
            <Image
              src="/images/empty-cart-bag.png"
              alt="Empty Cart Bag"
              width={224}
              height={176}
              className="w-44 h-36 sm:w-56 sm:h-44 object-contain shrink-0"
            />
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t("emptyTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              {t("emptySubtitle")}
            </p>
          </div>

          {/* Browse Courses Button */}
          <div className="pt-2">
            <Link
              href={`/${locale}/courses`}
              className="px-6 py-3.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md active:scale-98 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>{t("browseCatalog")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Cart Items List (Left Column) */}
          <div className="lg:col-span-2 space-y-4">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 hover:border-slate-300/90 transition-all group"
              >
                {/* Course Image & Metadata */}
                <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={128}
                    height={80}
                    className="w-24 h-16 sm:w-32 sm:h-20 rounded-2xl object-cover border border-slate-100 shrink-0 shadow-2xs"
                  />
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1 tracking-tight group-hover:text-[#0F5244] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-400">
                      {t("instructor")}{" "}
                      <span className="text-slate-500 font-semibold">{item.instructor}</span>
                    </p>
                  </div>
                </div>

                {/* Price & Delete Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#0F5244]">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    title={t("remove")}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card (Right Column) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs space-y-6">
              
              <h3 className="text-base sm:text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
                {t("orderSummary")}
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500">
                  <span>{t("subtotal")}</span>
                  <span className="font-extrabold text-slate-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>{t("taxesNote")}</span>
                  <span>--</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {t("total")}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0F5244]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {checkoutError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 text-start">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  disabled={isProcessingCheckout || displayItems.length === 0}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] active:scale-98 text-white text-xs sm:text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? "جاري تحويلك لبوابة الدفع..." : "Redirecting to Payment..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("checkout")}</span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] font-bold text-slate-400 pt-1 tracking-tight">
                  {t("guarantee")}
                </p>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
