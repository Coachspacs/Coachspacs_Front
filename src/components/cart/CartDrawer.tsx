"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import {
  removeFromCart,
  clearCart,
  closeCartDrawer,
  syncCartFromStorage,
} from "@/features/cart/cartSlice";
import { cartService } from "@/services/cartService";
import {
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Search,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const dispatch = useDispatch();

  const isOpen = useSelector((state: RootState) => state.cart?.isDrawerOpen ?? false);
  const rawCartItems = useSelector((state: RootState) => state.cart?.items || []);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    dispatch(syncCartFromStorage());
  }, [dispatch]);

  // Handle Close Drawer with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      dispatch(closeCartDrawer());
      setIsClosing(false);
    }, 250);
  }, [dispatch]);

  // Keyboard Escape and Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Format cart items
  const formattedItems = rawCartItems.map((item: any) => {
    const c = item.course || item;
    const courseId = String(c.id || item.courseId || item.id);
    return {
      id: courseId,
      courseId: courseId,
      cartItemId: (item as any).cartItemId,
      title: isAr ? c.titleAr || c.title : c.titleEn || c.title,
      instructor: isAr
        ? c.instructorNameAr || c.instructor?.name || t("defaultInstructor")
        : c.instructorName || c.instructor?.name || t("defaultInstructor"),
      price:
        typeof c.price === "number"
          ? c.price
          : parseFloat(c.price || "0") || 0,
      image:
        c.coverImage ||
        c.image ||
        c.thumbnail ||
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    };
  });

  const totalPrice = formattedItems.reduce((acc, item) => acc + item.price, 0);

  // Remove Item Handler
  const handleRemoveItem = async (id: string) => {
    setRemovingId(id);
    const target = rawCartItems.find(
      (i: any) =>
        String(i.id) === String(id) ||
        String(i.courseId) === String(id) ||
        String(i.course?.id) === String(id)
    );
    const cartItemId = (target as any)?.cartItemId || (target as any)?.id || id;
    const courseId = target?.courseId || target?.course?.id || target?.id || id;

    dispatch(removeFromCart(courseId));
    dispatch(removeFromCart(id));

    if (rawCartItems.length <= 1) {
      dispatch(clearCart());
    }

    try {
      await cartService.removeFromCart(cartItemId);
      if (String(cartItemId) !== String(id)) {
        await cartService.removeFromCart(id);
      }
    } catch (err) {
      console.warn("[CartDrawer] Remove error:", err);
    } finally {
      setRemovingId(null);
    }
  };

  // Navigate to Browse Courses
  const handleBrowseCourses = () => {
    handleClose();
    router.push(`/${locale}/courses`);
  };

  // Navigate to Full Cart
  const handleViewFullCart = () => {
    handleClose();
    router.push(`/${locale}/student/cart`);
  };

  // Proceed to Checkout
  const handleCheckout = async () => {
    if (formattedItems.length === 0) return;

    if (!isAuthenticated) {
      handleClose();
      router.push(`/${locale}/login?redirect=/${locale}/student/checkout`);
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const courseIds = rawCartItems
        .map((i: any) => i.courseId || i.course?.id || i.id)
        .filter(Boolean);

      if (courseIds.length > 0) {
        await cartService.syncItemsToServer(courseIds);
      }
      handleClose();
      router.push(`/${locale}/student/checkout`);
    } catch (err) {
      console.warn("[CartDrawer] Checkout sync error:", err);
      handleClose();
      router.push(`/${locale}/student/checkout`);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  if (!mounted || !isOpen) {
    return null;
  }

  const isVisible = isOpen && !isClosing;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("drawerTitle")}
      className="fixed inset-0 z-[100] overflow-hidden font-sans"
    >
      {/* Backdrop Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out cursor-pointer ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer Panel (Right Side) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pointer-events-none">
        <div
          ref={drawerRef}
          dir={isAr ? "rtl" : "ltr"}
          className={`pointer-events-auto w-screen max-w-[420px] sm:max-w-[440px] bg-white shadow-2xl flex flex-col h-full border-l rtl:border-l-0 rtl:border-r border-slate-200/90 transform transition-transform duration-300 ease-out ${
            isVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#0F5244]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {t("drawerTitle")}
                </h2>
                {formattedItems.length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#0F5244] text-white tabular-nums shadow-2xs">
                    {formattedItems.length}
                  </span>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer active:scale-95"
              aria-label={t("closeCart")}
              title={t("closeCart")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Items List or Empty State */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {formattedItems.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-12 h-12 text-[#0F5244]/80 stroke-[1.5]" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {t("emptyTitle")}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t("emptySubtitle")}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBrowseCourses}
                    className="px-5 py-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md active:scale-98 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="h-4 w-4 shrink-0" />
                    <span>{t("browseCatalog")}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Items List */
              <div className="space-y-3">
                {formattedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`relative p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs flex gap-3.5 transition-all group ${
                      removingId === item.id ? "opacity-40 scale-95 pointer-events-none" : ""
                    }`}
                  >
                    {/* Course Thumbnail */}
                    <div className="relative w-20 h-16 sm:w-22 sm:h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="88px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Info & Price */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="space-y-0.5 pr-6 rtl:pr-0 rtl:pl-6">
                        <h4
                          className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0F5244] transition-colors"
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {item.instructor}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm sm:text-base font-black text-[#0F5244]">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={t("remove")}
                      aria-label={t("remove")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Order Summary */}
          {formattedItems.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/80 p-5 space-y-4 shrink-0 shadow-lg">
              {/* Order Summary Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{t("subtotal")}</span>
                  <span className="text-slate-900 font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>{t("taxesNote")}</span>
                  <span>--</span>
                </div>
                <div className="border-t border-slate-200/70 pt-2 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">{t("total")}</span>
                  <span className="text-xl sm:text-2xl font-black text-[#0F5244]">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Primary Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] active:scale-98 text-white text-xs sm:text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("processing")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("checkout")}</span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </button>

                {/* Secondary: View Full Cart Link */}
                <button
                  type="button"
                  onClick={handleViewFullCart}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200/90 text-slate-700 hover:text-slate-900 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98"
                >
                  <span>{t("viewFullCart")}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
                </button>
              </div>

              {/* Trust Badge / Guarantee */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t("guarantee")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
