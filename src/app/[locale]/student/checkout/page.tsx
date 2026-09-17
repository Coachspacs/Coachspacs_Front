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
          (c: any) =>
            !deletedCourseIdsRef.current.has(String(c.id)) &&
            !deletedCourseIdsRef.current.has(String(c.courseId)) &&
            !deletedCourseIdsRef.current.has(String(c.course?.id))
        );

        if (filtered.length > 0) {
          const mapped: CheckoutDisplayItem[] = filtered.map((c: any) => {
            const courseObj = c.course || c;
            return {
              id: courseObj.id || c.courseId || c.id,
              title: isAr
                ? courseObj.titleAr || courseObj.title_ar || courseObj.title
                : courseObj.titleEn || courseObj.title_en || courseObj.title || t("trainingCourseFallback"),
              price:
                typeof courseObj.price === "number"
                  ? courseObj.price
                  : parseFloat(courseObj.price || "0"),
              image:
                courseObj.coverImage ||
                courseObj.cover_image ||
                courseObj.image ||
                courseObj.thumbnail ||
                "/images/placeholder.jpg",
              instructor: isAr
                ? courseObj.instructorNameAr ||
                  courseObj.instructor?.name ||
                  courseObj.instructor?.full_name ||
                  t("defaultCoach")
                : courseObj.instructorName ||
                  courseObj.instructor?.name ||
                  courseObj.instructor?.full_name ||
                  t("defaultCoach"),
            };
          });

          if (isMounted) {
            setCheckoutItems(mapped);
            return;
          }
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
    if (checkoutItems.length === 0) {
      setErrorMessage(t("emptyCartError"));
      setCheckoutWarningType("empty_cart");
      return;
    }

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

      if (
        skipped.some((s: any) => s.reason === "already_enrolled") ||
        detail.includes("already enrolled")
      ) {
        setCheckoutWarningType("already_enrolled");
        setErrorMessage(t("alreadyEnrolled"));
        return;
      }

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
  // MAIN CHECKOUT VIEW - ORDER REVIEW & STRIPE REDIRECT
  // ==========================================
  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[calc(100vh-5rem)] flex flex-col justify-center bg-slate-50/50 py-6 sm:py-10 px-4 sm:px-6 font-sans text-slate-800"
    >
      <div className="w-full max-w-lg mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        
        {/* Header & Step Indicator */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-xs font-extrabold text-[#0F5244] shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t("secureBadge")}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("pageTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Error Message & Recovery Banners */}
        {errorMessage && (
          <div className="space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs leading-relaxed shadow-2xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>

            {checkoutWarningType === "already_enrolled" && (
              <Link
                href={`/${locale}/student/learn/${checkoutItems[0]?.id || ""}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t("goToLessons")}</span>
              </Link>
            )}

            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href={`/${locale}/student/orders`}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Receipt className="h-3.5 w-3.5 text-slate-400" />
                <span>{t("reviewOrders")}</span>
              </Link>

              <button
                type="button"
                onClick={handleResetCart}
                className="flex-1 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t("resetCart")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Review Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-5 sm:p-7 space-y-4 sm:space-y-5">
          
          {/* Card Header: Order Summary */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {t("orderSummaryTitle")}
              </h2>
            </div>

            <span className="text-[11px] font-extrabold text-[#0F5244] bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
              {getCourseCountLabel(checkoutItems.length)}
            </span>
          </div>

          {/* Courses List */}
          <div className="space-y-3 divide-y divide-slate-100 max-h-[190px] overflow-y-auto pr-1">
            {checkoutItems.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3.5 group">
                <div className="w-14 h-12 sm:w-16 sm:h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 relative shadow-2xs">
                  <Image
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {item.instructor || t("defaultCoach")}
                  </p>
                </div>
                <div className="text-right rtl:text-left shrink-0">
                  <div className="font-black text-xs sm:text-sm text-[#0F5244]">
                    ${item.price.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(item.id)}
                    className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer mt-0.5"
                    title={t("removeItem")}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t("removeItem")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stripe Hosted Checkout Notice (Clear message that card details are entered on Stripe) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-50/80 to-emerald-50/30 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF] shrink-0 font-black text-xs">
                  S
                </div>
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  {t("stripeHostedNoticeTitle")}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                PCI-DSS Level 1
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {t("stripeHostedNoticeDesc")}
            </p>

            {/* Supported Payment Badges */}
            <div dir="ltr" className="flex items-center gap-2 pt-1">
              <span className="h-5 px-2 rounded bg-[#0A2540] text-white text-[9px] font-black tracking-wider flex items-center shadow-2xs">
                VISA
              </span>
              <span className="h-5 px-2 rounded bg-slate-800 text-white text-[9px] font-bold flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EB001B]" />
                <span className="w-1.5 h-1.5 -ml-1 rounded-full bg-[#F79E1B]" />
                <span className="text-[8px]">Mastercard</span>
              </span>
              <span className="h-5 px-2 rounded bg-black text-white text-[9px] font-medium flex items-center gap-1 shadow-2xs">
                <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.8-11.98-14.28-5.99-9.04-10.74-19.53-14.26-31.47-3.52-11.94-5.28-23.2-5.28-33.78 0-14.6 3.63-26.69 10.89-36.27 7.26-9.58 16.27-14.48 27.04-14.69 5.37 0 11.13 1.43 17.29 4.3 6.16 2.87 10.05 4.35 11.66 4.44 1.25-.09 5.36-1.63 12.33-4.63 6.96-2.99 12.82-4.32 17.58-3.99 13.06.74 23.36 5.66 30.9 14.77-11.58 7.02-17.25 16.59-17.02 28.71.23 9.47 3.82 17.39 10.77 23.75 6.96 6.36 15.11 10.03 24.47 11.02-2.34 7.28-5.24 14.38-8.71 21.32zM119.22 33.71c0-7.3 2.66-14.07 7.98-20.31 5.32-6.24 11.83-10.06 19.53-11.46.23 1.13.35 2.12.35 2.97 0 7.2-2.78 14.07-8.34 20.61-5.56 6.54-12.21 10.37-19.95 11.49-.24-1.02-.37-2.12-.37-3.3z" />
                </svg>
                Apple Pay
              </span>
              <span className="text-[10px] text-slate-400 font-semibold ml-auto">
                {t("poweredByStripe")}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-500 font-semibold">
              <span>{t("subtotal")}</span>
              <span className="font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-500 font-semibold">
              <span>{t("taxes")}</span>
              <span className="font-bold text-emerald-700">{t("free")}</span>
            </div>

            {/* Total Due */}
            <div className="pt-3 pb-1 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-black text-slate-900">
                {t("totalDue")}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#0F5244] tracking-tight">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Primary Action Button: Continue to Stripe */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handlePayWithStripe}
              disabled={isProcessing || checkoutItems.length === 0}
              className="w-full h-12 sm:h-14 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] active:scale-[0.99] disabled:bg-slate-300 text-white text-sm sm:text-base font-black transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/15 hover:shadow-xl hover:shadow-emerald-950/25 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{t("redirecting")}</span>
                </div>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>{t("continueToStripe")}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0" />
                </>
              )}
            </button>

            {/* Secondary Action: Small Modify Cart Link */}
            <div className="flex justify-center pt-1">
              <Link
                href={`/${locale}/student/cart`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0F5244] transition-colors cursor-pointer group"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F5244] transition-colors" />
                <span className="underline-offset-4 hover:underline">{t("modifyCart")}</span>
              </Link>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 font-medium">
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

        </div>

      </div>
    </div>
  );
}
