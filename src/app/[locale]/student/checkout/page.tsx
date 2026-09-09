"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { clearCart, removeFromCart } from "@/features/cart/cartSlice";
import { orderService } from "@/services/orderService";
import { cartService } from "@/services/cartService";
import { tokenManager } from "@/lib/tokenManager";
import {
  ShieldCheck,
  Lock,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
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
  CheckCircle2,
  ChevronRight,
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

  const queryOrderId = searchParams?.get("orderId") || searchParams?.get("order_id");
  const isSuccessQuery =
    searchParams?.get("success") === "true" ||
    searchParams?.get("status") === "success" ||
    Boolean(searchParams?.get("order_id"));

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

  // Guards to prevent deleted courses from resurrecting from background fetches or pending orders
  const deletedCourseIdsRef = useRef<Set<string>>(new Set());
  const userHasModifiedCartRef = useRef<boolean>(false);
  const hasLoadedInitialCartRef = useRef<boolean>(false);

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

  // Load items: from query order, current cart, or server cart on initial mount
  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      // If user has explicitly removed items from this checkout session and cart is empty, stay empty!
      if (userHasModifiedCartRef.current && cartItems.length === 0) {
        if (isMounted) setCheckoutItems([]);
        return;
      }

      // 1. If an orderId is explicitly specified in URL, fetch that order's items
      if (queryOrderId) {
        try {
          const res = await orderService.getOrders(1, 10);
          if (res?.results && isMounted) {
            const matched = res.results.find((o) => String(o.id) === String(queryOrderId));
            if (matched && matched.items?.length > 0) {
              setActiveOrderId(matched.id);
              setCompletedOrderNumber(`#ORD-${matched.id}`);
              const mapped: CheckoutDisplayItem[] = matched.items
                .filter((it) => !deletedCourseIdsRef.current.has(String(it.course?.id || it.id)))
                .map((it) => ({
                  id: it.course?.id || it.id,
                  title: it.course?.title || t("trainingCourseFallback"),
                  price:
                    typeof it.price_at_purchase === "number"
                      ? it.price_at_purchase
                      : parseFloat(it.price_at_purchase || "0"),
                  image: it.course?.cover_image || "/images/placeholder.jpg",
                }));
              if (mapped.length > 0 && isMounted) {
                setCheckoutItems(mapped);
                return;
              }
            }
          }
        } catch {
          // Fallback to cart
        }
      }

      // 2. If cart has items in Redux, use cart (filtering out any user-deleted items)
      if (cartItems && cartItems.length > 0) {
        const filtered = cartItems.filter(
          (c: any) => !deletedCourseIdsRef.current.has(String(c.courseId || c.course?.id || c.id))
        );
        if (filtered.length > 0) {
          const mapped: CheckoutDisplayItem[] = filtered.map((c: any) => ({
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
        } else if (userHasModifiedCartRef.current) {
          if (isMounted) setCheckoutItems([]);
          return;
        }
      }

      // 3. Fallback only on initial page load if Redux hasn't hydrated yet and user hasn't deleted items
      if (!hasLoadedInitialCartRef.current && !userHasModifiedCartRef.current) {
        hasLoadedInitialCartRef.current = true;
        try {
          const serverCart = await cartService.getCart();
          if (
            serverCart?.items &&
            Array.isArray(serverCart.items) &&
            serverCart.items.length > 0 &&
            !userHasModifiedCartRef.current
          ) {
            const mapped: CheckoutDisplayItem[] = serverCart.items
              .filter(
                (it: any) =>
                  !deletedCourseIdsRef.current.has(String(it.course?.id || it.id))
              )
              .map((it: any) => ({
                id: it.course?.id || it.id,
                title: isAr
                  ? it.course?.title_ar || it.course?.title
                  : it.course?.title_en || it.course?.title || t("trainingCourseFallback"),
                price:
                  typeof it.course?.price === "number"
                    ? it.course.price
                    : parseFloat(it.course?.price || "0"),
                image: it.course?.cover_image || "/images/placeholder.jpg",
                instructor:
                  it.course?.instructor?.full_name || t("defaultCoach"),
              }));
            if (mapped.length > 0 && isMounted && !userHasModifiedCartRef.current) {
              setCheckoutItems(mapped);
              return;
            }
          }
        } catch {
          // Fallback
        }
      }
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [queryOrderId, cartItems, t, isAr]);

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
   * Remove a single course directly from checkout summary
   */
  const handleRemoveCourse = async (courseId: string | number) => {
    const strId = String(courseId);
    userHasModifiedCartRef.current = true;
    deletedCourseIdsRef.current.add(strId);

    // 1. Remove from Redux immediately
    dispatch(removeFromCart(courseId));
    dispatch(removeFromCart(strId));

    // 2. Remove from local state immediately
    setCheckoutItems((prev) => {
      const updated = prev.filter((it) => String(it.id) !== strId);
      if (updated.length === 0) {
        setCheckoutWarningType("empty_cart");
        dispatch(clearCart());
      }
      return updated;
    });

    // 3. Clear active order ID so we don't attempt to pay for a stale/abandoned order
    setActiveOrderId(null);

    // 4. Remove from backend cart
    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(courseId);
      } catch {
        // Ignore
      }
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
    const hasToken = tokenManager.hasSession();
    if (!isAuthenticated && !hasToken) {
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

  const getCourseCountLabel = (count: number) => {
    if (!isAr) return `${count} ${count === 1 ? "Course" : "Courses"}`;
    if (count === 1) return "دورة واحدة";
    if (count === 2) return "دورتان";
    if (count >= 3 && count <= 10) return `${count} دورات`;
    return `${count} دورة`;
  };

  // ==========================================
  // MAIN CHECKOUT VIEW - ULTRA-PREMIUM FINTECH DESIGN
  // ==========================================
  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-5rem)] flex flex-col justify-center bg-slate-50/50 py-4 sm:py-8 px-4 sm:px-6 font-sans text-slate-800"
    >
      <div className="w-full max-w-md sm:max-w-lg mx-auto space-y-2.5 sm:space-y-3 animate-in fade-in duration-200">
        
        {/* Sleek Minimal Header */}
        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {t("pageTitle")}
          </h1>
        </div>

        {/* Error Message & Recovery Banners */}
        {errorMessage && (
          <div className="space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50/80 border border-rose-200/60 text-rose-700 text-xs leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>

            {checkoutWarningType === "already_enrolled" && (
              <Link
                href={`/${locale}/student/learn/${checkoutItems[0]?.id || ""}`}
                className="w-full py-2 px-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t("goToLessons")}</span>
              </Link>
            )}

            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href={`/${locale}/student/orders`}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Receipt className="h-3 w-3 text-slate-400" />
                <span>{t("reviewOrders")}</span>
              </Link>

              <button
                type="button"
                onClick={handleResetCart}
                className="flex-1 py-1.5 px-3 rounded-lg border border-rose-200/70 bg-rose-50/40 hover:bg-rose-50 text-rose-600 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>{t("resetCart")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Refined Checkout Card with Strong Hierarchy & Breathing Room */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-3.5 sm:space-y-4">
          
          {/* Card Header: Crisp, Unified & Zero Redundancy */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-100/60">
                <ShoppingBag className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-black text-slate-950 leading-tight">
                {t("orderSummaryTitle")}
              </h2>
            </div>

            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
              {getCourseCountLabel(checkoutItems.length)}
            </span>
          </div>

          {/* Courses List: Darker, High-Contrast Typography */}
          <div className="space-y-3 divide-y divide-slate-100 max-h-[150px] sm:max-h-[170px] overflow-y-auto pr-0.5">
            {checkoutItems.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                <div className="w-13 h-11 sm:w-14 sm:h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 relative shadow-2xs">
                  <Image
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-950 truncate leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                    {item.instructor || t("defaultCoach")}
                  </p>
                </div>
                <div className="text-right rtl:text-left shrink-0">
                  <div className="font-black text-xs sm:text-sm text-slate-950">
                    ${item.price.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(item.id)}
                    className="text-[10.5px] font-medium text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-0.5 cursor-pointer mt-0.5"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    <span>{t("removeItem")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method Card */}
          <div className="pt-2.5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-xs font-bold text-slate-900">
                {t("paymentMethodTitle")}
              </span>
              <span className="text-[10px] sm:text-[11px] text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/50">
                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                <span>{t("secureBadge")}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl border-2 border-[#0F5244] bg-[#0F5244]/[0.02] flex items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-4 h-4 rounded-full border-2 border-[#0F5244] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#0F5244]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-950 truncate">
                    {t("cardOptionTitle")}
                  </p>
                  <p className="text-[10.5px] text-slate-500 font-medium truncate">
                    {t("paymentMethodsSupported")}
                  </p>
                </div>
              </div>

              {/* Crisp Card Badges */}
              <div dir="ltr" className="flex items-center gap-1.5 shrink-0">
                <span className="h-5 px-1.5 rounded bg-[#0A2540] text-white text-[9px] font-black tracking-wider flex items-center shadow-2xs">
                  VISA
                </span>
                <span className="h-5 px-1.5 rounded bg-slate-800 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EB001B]" />
                  <span className="w-1.5 h-1.5 -ml-0.5 rounded-full bg-[#F79E1B]" />
                  <span className="text-[8px] ml-0.5">MC</span>
                </span>
                <span className="h-5 px-1.5 rounded bg-black text-white text-[9px] font-medium flex items-center gap-0.5 shadow-2xs">
                  <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.8-11.98-14.28-5.99-9.04-10.74-19.53-14.26-31.47-3.52-11.94-5.28-23.2-5.28-33.78 0-14.6 3.63-26.69 10.89-36.27 7.26-9.58 16.27-14.48 27.04-14.69 5.37 0 11.13 1.43 17.29 4.3 6.16 2.87 10.05 4.35 11.66 4.44 1.25-.09 5.36-1.63 12.33-4.63 6.96-2.99 12.82-4.32 17.58-3.99 13.06.74 23.36 5.66 30.9 14.77-11.58 7.02-17.25 16.59-17.02 28.71.23 9.47 3.82 17.39 10.77 23.75 6.96 6.36 15.11 10.03 24.47 11.02-2.34 7.28-5.24 14.38-8.71 21.32zM119.22 33.71c0-7.3 2.66-14.07 7.98-20.31 5.32-6.24 11.83-10.06 19.53-11.46.23 1.13.35 2.12.35 2.97 0 7.2-2.78 14.07-8.34 20.61-5.56 6.54-12.21 10.37-19.95 11.49-.24-1.02-.37-2.12-.37-3.3z" />
                  </svg>
                  Pay
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown: Clean & Delicate */}
          <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>{t("subtotal")}</span>
              <span className="font-bold text-slate-800">${totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>{t("taxes")}</span>
              <span className="font-bold text-emerald-700">{t("free")}</span>
            </div>

            {/* Total Due: Dominant & High Contrast */}
            <div className="pt-3 pb-0.5 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-black text-slate-950">
                {t("totalDue")}
              </span>
              <span className="text-2xl sm:text-[28px] font-black text-[#0F5244] tracking-tight">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action CTA Button: Clear Primary Anchor */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handlePayWithStripe}
              disabled={isProcessing || checkoutItems.length === 0}
              className="w-full h-12 sm:h-[52px] rounded-xl bg-[#0F5244] hover:bg-[#0a3d33] disabled:bg-slate-300 text-white text-xs sm:text-sm font-black transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#0F5244]/20 hover:shadow-lg hover:shadow-[#0F5244]/30 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed group"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{t("redirecting")}</span>
                </div>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span className="text-sm sm:text-[15px] font-black tracking-tight">
                    {t("paySecurely", { amount: `$${totalAmount.toFixed(2)}` })}
                  </span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform shrink-0" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 font-medium leading-relaxed">
              {t("redirectNote")}
            </p>
          </div>

          {/* Simplified Trust Badges: Harmonious & Subdued */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{t("sslEncryption")}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 hidden sm:inline-block" />
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{t("verifiedCert")}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 hidden sm:inline-block" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{t("lifetimeAccess")}</span>
            </span>
          </div>

          {/* Secondary Action: Modify Cart (Inside Card) */}
          <div className="pt-2 flex justify-center">
            <Link
              href={`/${locale}/student/cart`}
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-[#0F5244]/40 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
              <span>{t("modifyCart")}</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
