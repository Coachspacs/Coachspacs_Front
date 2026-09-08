"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { clearCart, removeFromCart } from "@/features/cart/cartSlice";
import { orderService } from "@/services/orderService";
import { cartService } from "@/services/cartService";
import {
  ShieldCheck,
  Lock,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Award,
  Sparkles,
  Receipt,
  AlertCircle,
  CreditCard,
  Trash2,
  Check,
  Shield,
  Clock,
  Sparkle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CheckoutDisplayItem {
  id: string | number;
  title: string;
  price: number;
  image?: string;
  instructor?: string;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const dispatch = useDispatch();

  const queryOrderId = searchParams?.get("orderId");
  const isSuccessQuery =
    searchParams?.get("success") === "true" ||
    searchParams?.get("status") === "success";

  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  const [checkoutItems, setCheckoutItems] = useState<CheckoutDisplayItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | number | null>(queryOrderId || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(isSuccessQuery);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>(
    queryOrderId ? `#ORD-${queryOrderId}` : "#ORD-2026"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutWarningType, setCheckoutWarningType] = useState<
    "in_progress" | "already_enrolled" | "empty_cart" | null
  >(null);

  // Clean up any old cached Stripe URLs on mount so expired sessions are never reused
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.includes("checkout_url") || k.includes("last_checkout_url"))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }
  }, []);

  // If user returned from Stripe successfully
  useEffect(() => {
    if (isSuccessQuery) {
      setIsSuccess(true);
      dispatch(clearCart());
    }
  }, [isSuccessQuery, dispatch]);

  // Load items: from query order, current cart, or existing pending order
  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      // 1. If an orderId is explicitly specified in URL, fetch that order's items
      if (queryOrderId) {
        try {
          const res = await orderService.getOrders(1, 10);
          if (res?.results && isMounted) {
            const matched = res.results.find((o) => String(o.id) === String(queryOrderId));
            if (matched && matched.items?.length > 0) {
              setActiveOrderId(matched.id);
              setCompletedOrderNumber(`#ORD-${matched.id}`);
              const mapped: CheckoutDisplayItem[] = matched.items.map((it) => ({
                id: it.course?.id || it.id,
                title: it.course?.title || t("trainingCourseFallback"),
                price:
                  typeof it.price_at_purchase === "number"
                    ? it.price_at_purchase
                    : parseFloat(it.price_at_purchase || "0"),
                image: it.course?.cover_image || "/images/placeholder.jpg",
              }));
              setCheckoutItems(mapped);
              return;
            }
          }
        } catch {
          // Fallback to cart
        }
      }

      // 2. If cart has items, use cart
      if (cartItems && cartItems.length > 0) {
        const mapped: CheckoutDisplayItem[] = cartItems.map((c: any) => ({
          id: c.courseId || c.course?.id || c.id,
          title: c.title || c.course?.title || t("trainingCourseFallback"),
          price: typeof c.price === "number" ? c.price : parseFloat(c.price || "0"),
          image: c.image || c.coverImage || c.course?.cover_image || "/images/placeholder.jpg",
          instructor:
            c.instructor ||
            c.course?.instructor?.full_name ||
            t("defaultCoach"),
        }));
        if (isMounted) setCheckoutItems(mapped);
        return;
      }

      // 3. Fallback: fetch most recent pending order items from backend
      try {
        const res = await orderService.getOrders(1, 5);
        if (res?.results && isMounted) {
          const pending = res.results.find((o) => o.status?.toUpperCase() === "PENDING");
          if (pending && pending.items?.length > 0) {
            setActiveOrderId(pending.id);
            setCompletedOrderNumber(`#ORD-${pending.id}`);
            const mapped: CheckoutDisplayItem[] = pending.items.map((it) => ({
              id: it.course?.id || it.id,
              title: it.course?.title || t("trainingCourseFallback"),
              price:
                typeof it.price_at_purchase === "number"
                  ? it.price_at_purchase
                  : parseFloat(it.price_at_purchase || "0"),
              image: it.course?.cover_image || "/images/placeholder.jpg",
            }));
            setCheckoutItems(mapped);
          }
        }
      } catch {
        // Ignore
      }
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [queryOrderId, cartItems, t]);

  const totalAmount = checkoutItems.reduce((sum, itm) => sum + (itm.price || 0), 0);

  /**
   * Reset the cart and server items to allow student to choose another course cleanly
   */
  const handleResetCart = async () => {
    setIsProcessing(true);
    try {
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((k) => {
          if (k.includes("checkout_url")) {
            localStorage.removeItem(k);
          }
        });
      }
      for (const itm of checkoutItems) {
        dispatch(removeFromCart(itm.id));
      }
      dispatch(clearCart());
      router.push(`/${locale}/courses`);
    } catch {
      router.push(`/${locale}/courses`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Primary Checkout Trigger with full client-side validation
   */
  const handlePayWithStripe = async () => {
    // -------------------------------------------------------------
    // VALIDATION STEP 1: Ensure cart items exist
    // -------------------------------------------------------------
    if (checkoutItems.length === 0) {
      setErrorMessage(t("emptyCartError"));
      setCheckoutWarningType("empty_cart");
      return;
    }

    // -------------------------------------------------------------
    // VALIDATION STEP 2: Ensure valid numeric Course IDs
    // -------------------------------------------------------------
    const validCourseIds = checkoutItems
      .map((item) => Number(item.id))
      .filter((id) => !isNaN(id) && id > 0);

    if (validCourseIds.length === 0) {
      setErrorMessage(t("emptyCartError"));
      setCheckoutWarningType("empty_cart");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setCheckoutWarningType(null);

    try {
      // Clean previous cached URLs to ensure fresh session
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("last_checkout_url");
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("checkout_url_")) localStorage.removeItem(key);
          });
        } catch {}
      }

      // Ensure server cart is synchronized with courses to checkout
      try {
        await cartService.syncItemsToServer(validCourseIds);
      } catch (syncErr) {
        console.warn("[Checkout] Pre-checkout cart sync warning:", syncErr);
      }

      // Call the backend API to create a Stripe checkout session
      const res = await orderService.createCheckoutSession({
        course_ids: validCourseIds,
      });

      const stripeUrl = res?.checkout_url || (res as any)?.url;

      if (stripeUrl && typeof stripeUrl === "string" && stripeUrl.startsWith("http")) {
        // Clear cart in Redux so student does not buy twice
        dispatch(clearCart());
        // Redirect directly to official Stripe portal
        window.location.href = stripeUrl;
        return;
      }

      throw new Error("No valid checkout URL returned from payment service");
    } catch (err: any) {
      console.warn("[Checkout] Stripe session initiation warning:", err?.response?.data || err?.message || err);
      setIsProcessing(false);

      const errorData = err?.response?.data;
      const detail = (errorData?.detail || errorData?.message || "").toLowerCase();
      const skipped = Array.isArray(errorData?.skipped_items) ? errorData.skipped_items : [];

      // Case A: User already owns the course
      if (
        skipped.some((s: any) => s.reason === "already_enrolled") ||
        detail.includes("already enrolled")
      ) {
        setCheckoutWarningType("already_enrolled");
        setErrorMessage(t("alreadyEnrolled"));
        return;
      }

      // Case B: "Nothing in your cart can be checked out right now" or "checkout_in_progress"
      if (
        skipped.some((s: any) => s.reason === "checkout_in_progress") ||
        detail.includes("nothing in your cart") ||
        detail.includes("cannot be checked out") ||
        detail.includes("checkout_in_progress")
      ) {
        setCheckoutWarningType("in_progress");
        setErrorMessage(t("pendingExists"));
        return;
      }

      // Default fallback error message
      const fallbackMsg = errorData?.detail || errorData?.message || t("fallbackError");
      setErrorMessage(fallbackMsg);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=/${locale}/student/checkout`);
    }
  }, [isAuthenticated, authLoading, locale, router]);

  // ==========================================
  // SUCCESS SCREEN (Returned from Stripe)
  // ==========================================
  if (isSuccess) {
    const firstCourseId = checkoutItems[0]?.id || 1;

    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12 font-sans"
      >
        <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in zoom-in-95 fade-in duration-300">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#D1FAF0] animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-full bg-[#D1FAF0] flex items-center justify-center shadow-xs">
              <CheckCircle className="h-10 w-10 text-[#0F5244] stroke-[2]" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#D1FAF0] text-[#0F5244]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("successBadge")}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t("successTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
              {t("successDesc")}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 space-y-2 text-start">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400">{t("orderNumber")}:</span>
              <span className="font-extrabold text-[#0F5244]">{completedOrderNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400">{t("amountPaid")}:</span>
              <span className="font-black text-slate-900">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400">{t("paymentGateway")}:</span>
              <span className="font-extrabold text-[#0F5244]">{t("gatewayValue")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t("statusLabel")}:</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {t("completedStatus")}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href={`/${locale}/student/learn/${firstCourseId}`}
              className="w-full py-4 px-6 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-98"
            >
              <BookOpen className="h-5 w-5" />
              <span>{t("goToCourse")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>

            <Link
              href={`/${locale}/student/orders`}
              className="w-full py-3.5 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Receipt className="h-4 w-4 text-slate-500" />
              <span>{t("viewOrders")}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY STATE
  // ==========================================
  if (checkoutItems.length === 0 && !authLoading) {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 font-sans"
      >
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-[#D1FAF0] flex items-center justify-center mx-auto shadow-2xs">
            <ShoppingBag className="h-9 w-9 text-[#0F5244] stroke-[1.8]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t("emptyCartTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              {t("emptyCartDesc")}
            </p>
          </div>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <span>{t("browseCourses")}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN CHECKOUT VIEW - ULTRA-PREMIUM FINTECH DESIGN
  // ==========================================
  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        
        {/* Top Breadcrumb & Trust Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link href={`/${locale}/courses`} className="hover:text-slate-600 transition-colors">
                {t("breadcrumbCourses")}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#0F5244]">
                {t("breadcrumbCheckout")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t("pageTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t("pageSubtitle")}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-[#0F5244] shrink-0" />
            <span>{t("sslBadge")}</span>
          </div>
        </div>

        {/* Two-Column Modern Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ==========================================
              LEFT (or RIGHT in RTL): Payment Gateway (7 Cols)
          ========================================== */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header: Payment Method */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#0F5244]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    {t("paymentMethodTitle")}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {t("paymentMethodSubtitle")}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-black text-[#0F5244] bg-[#D1FAF0] px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkle className="h-3 w-3" />
                <span>{t("poweredByStripe")}</span>
              </span>
            </div>

            {/* Selected Payment Method: Modern Stripe Card */}
            <div className="rounded-2xl border-2 border-[#0F5244] bg-[#F7FCFA] p-5 sm:p-6 space-y-5 shadow-xs transition-all">
              
              {/* Radio Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full border-2 border-[#0F5244] mt-0.5 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0F5244]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-sm sm:text-base text-slate-900">
                        {t("cardOptionTitle")}
                      </h3>
                      <span className="text-[10px] font-black bg-[#0F5244] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {t("officialBadge")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {t("cardOptionDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Payment Network Badges - Strictly Active Stripe Methods (Visa, Mastercard, Apple Pay, Link) */}
              <div dir="ltr" className="pt-2 border-t border-emerald-100/80 flex flex-wrap items-center gap-2.5">
                {/* Visa Badge */}
                <div dir="ltr" className="h-7 px-3 rounded-lg bg-[#0A2540] text-white flex items-center justify-center font-black text-xs tracking-wider shadow-2xs">
                  VISA
                </div>

                {/* Mastercard Badge */}
                <div dir="ltr" className="h-7 px-2.5 rounded-lg bg-[#1E293B] flex items-center justify-center gap-1.5 shadow-2xs">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-95" />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-tight">Mastercard</span>
                </div>

                {/* Apple Pay Badge with Vector SVG */}
                <div dir="ltr" className="h-7 px-2.5 rounded-lg bg-black text-white flex items-center justify-center font-semibold text-xs shadow-2xs gap-1">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.8-11.98-14.28-5.99-9.04-10.74-19.53-14.26-31.47-3.52-11.94-5.28-23.2-5.28-33.78 0-14.6 3.63-26.69 10.89-36.27 7.26-9.58 16.27-14.48 27.04-14.69 5.37 0 11.13 1.43 17.29 4.3 6.16 2.87 10.05 4.35 11.66 4.44 1.25-.09 5.36-1.63 12.33-4.63 6.96-2.99 12.82-4.32 17.58-3.99 13.06.74 23.36 5.66 30.9 14.77-11.58 7.02-17.25 16.59-17.02 28.71.23 9.47 3.82 17.39 10.77 23.75 6.96 6.36 15.11 10.03 24.47 11.02-2.34 7.28-5.24 14.38-8.71 21.32zM119.22 33.71c0-7.3 2.66-14.07 7.98-20.31 5.32-6.24 11.83-10.06 19.53-11.46.23 1.13.35 2.12.35 2.97 0 7.2-2.78 14.07-8.34 20.61-5.56 6.54-12.21 10.37-19.95 11.49-.24-1.02-.37-2.12-.37-3.3z" />
                  </svg>
                  <span>Pay</span>
                </div>

                {/* Link Badge (Stripe 1-click checkout) */}
                <div dir="ltr" className="h-7 px-2.5 rounded-lg bg-[#00D66F]/10 border border-[#00D66F]/30 text-[#008744] flex items-center justify-center font-bold text-xs shadow-2xs gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00D66F] animate-pulse" />
                  <span className="font-black text-[#0A2540] tracking-tight">link</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{t("linkByStripe")}</span>
                </div>
              </div>

              {/* Key Features Bullet Points */}
              <div className="space-y-2 pt-1 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[#0F5244] shrink-0">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{t("instantAccess")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[#0F5244] shrink-0">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{t("verifiedCertificate")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[#0F5244] shrink-0">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{t("moneyBackGuarantee")}</span>
                </div>
              </div>

            </div>

            {/* Error Message & Warning Banners */}
            {errorMessage && (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold leading-relaxed">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span>{errorMessage}</span>
                  </div>
                </div>

                {/* If already enrolled, provide link to learn */}
                {checkoutWarningType === "already_enrolled" && (
                  <Link
                    href={`/${locale}/student/learn/${checkoutItems[0]?.id || ""}`}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>{t("goToLessons")}</span>
                  </Link>
                )}

                {/* Helpful recovery buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <Link
                    href={`/${locale}/student/orders`}
                    className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="h-3.5 w-3.5 text-slate-500" />
                    <span>{t("reviewOrders")}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleResetCart}
                    className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t("resetCart")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button - Glowing Fintech CTA */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handlePayWithStripe}
                disabled={isProcessing || checkoutItems.length === 0}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0F5244] via-[#116654] to-[#0F5244] hover:shadow-xl hover:shadow-[#0F5244]/25 disabled:bg-slate-300 text-white text-sm sm:text-base font-black transition-all flex items-center justify-between shadow-md cursor-pointer active:scale-98 group"
              >
                {isProcessing ? (
                  <div className="w-full flex items-center justify-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{t("redirecting")}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      <span>{t("proceedButton")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-white/20 text-xs sm:text-sm font-black tracking-tight">
                        ${totalAmount.toFixed(2)}
                      </span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] font-medium text-slate-400">
                {t("redirectNote")}
              </p>
            </div>

            {/* Trust and Guarantee Badges */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#0F5244]" />
                {t("sslEncryption")}
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#0F5244]" />
                {t("verifiedCert")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#0F5244]" />
                {t("lifetimeAccess")}
              </span>
            </div>

          </div>

          {/* ==========================================
              RIGHT (or LEFT in RTL): Order Summary (5 Cols)
          ========================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Elevated Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900">
                  {t("orderSummaryTitle")}
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {t("courseCount", { count: checkoutItems.length })}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 divide-y divide-slate-100">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 relative shadow-2xs">
                      <Image
                        src={item.image || "/images/placeholder.jpg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-900 truncate leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                        {item.instructor || t("defaultCoach")}
                      </p>
                    </div>
                    <div className="font-black text-base text-[#0F5244] shrink-0">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs font-semibold text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{t("subtotal")}</span>
                  <span className="font-bold text-slate-800">${totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{t("taxes")}</span>
                  <span className="font-bold text-emerald-600">{t("free")}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900">{t("totalDue")}</span>
                  <span className="text-2xl font-black text-[#0F5244]">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Guarantee Callout Box */}
              <div className="bg-[#D1FAF0]/40 border border-[#94F3D2]/60 rounded-2xl p-3.5 flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-[#0F5244] shrink-0 mt-0.5" />
                <p className="text-[11px] font-semibold text-[#07382E] leading-relaxed">
                  {t("guaranteeBox")}
                </p>
              </div>

            </div>

            {/* Back to Cart link */}
            <div className="text-center">
              <Link
                href={`/${locale}/student/cart`}
                className="text-xs font-extrabold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-slate-100"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{t("modifyCart")}</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
