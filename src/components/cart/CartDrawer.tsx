"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    dispatch(syncCartFromStorage());
  }, [dispatch]);

  // Handle Close Drawer
  const handleClose = useCallback(() => {
    dispatch(closeCartDrawer());
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

  if (!mounted) {
    return null;
  }

  // Animation variants
  const panelVariants: Variants = {
    hidden: {
      x: isAr ? "-100%" : "100%",
      boxShadow: "0 0 0 rgba(0,0,0,0)",
    },
    visible: {
      x: 0,
      boxShadow: "-12px 0 40px rgba(15, 82, 68, 0.12), -4px 0 16px rgba(0,0,0,0.08)",
      transition: {
        type: "spring" as const,
        damping: 30,
        stiffness: 220,
        mass: 0.9,
      },
    },
    exit: {
      x: isAr ? "-100%" : "100%",
      transition: {
        type: "spring" as const,
        damping: 32,
        stiffness: 240,
        mass: 0.8,
      },
    },
  };

  const containerListVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.12,
      },
    },
  };

  const itemCardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 18,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 24,
        stiffness: 260,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      x: isAr ? -30 : 30,
      transition: {
        duration: 0.22,
        ease: "easeInOut",
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("drawerTitle")}
          className="fixed inset-0 z-[100] overflow-hidden font-sans"
        >
          {/* Backdrop Overlay with smooth blur and fade */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/45 cursor-pointer"
          />

          {/* Drawer Panel Container */}
          <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pointer-events-none">
            <motion.div
              ref={drawerRef}
              dir={isAr ? "rtl" : "ltr"}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto w-screen max-w-[430px] sm:max-w-[450px] bg-white flex flex-col h-full border-l rtl:border-l-0 rtl:border-r border-slate-200/90 relative"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md shrink-0 relative z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-[#0F5244] shadow-2xs">
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {t("drawerTitle")}
                    </h2>
                    {formattedItems.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 18,
                          delay: 0.25,
                        }}
                        className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black bg-[#0F5244] text-white tabular-nums shadow-sm"
                      >
                        {formattedItems.length}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  aria-label={t("closeCart")}
                  title={t("closeCart")}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Body: Items List or Empty State */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
                {formattedItems.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 200,
                      delay: 0.15,
                    }}
                    className="h-full flex flex-col items-center justify-center text-center px-4 py-8 space-y-6"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Pulsing Aura */}
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-3xl bg-emerald-100/60 blur-xl"
                      />

                      {/* Floating Bag */}
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-50/90 border border-emerald-200/60 flex items-center justify-center shadow-lg shadow-emerald-900/5"
                      >
                        <ShoppingBag className="w-12 h-12 text-[#0F5244] stroke-[1.6]" />
                      </motion.div>
                    </div>

                    <div className="space-y-1.5 max-w-xs">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {t("emptyTitle")}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                        {t("emptySubtitle")}
                      </p>
                    </div>

                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleBrowseCourses}
                        className="px-6 py-3.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Search className="h-4 w-4 shrink-0" />
                        <span>{t("browseCatalog")}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* Items List */
                  <motion.div
                    variants={containerListVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3.5"
                  >
                    <AnimatePresence mode="popLayout">
                      {formattedItems.map((item) => (
                        <motion.div
                          layout
                          key={item.id}
                          variants={itemCardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          whileHover={{ y: -2 }}
                          className={`relative p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex gap-3.5 group ${
                            removingId === item.id
                              ? "opacity-30 scale-95 pointer-events-none"
                              : ""
                          }`}
                        >
                          {/* Course Thumbnail */}
                          <div className="relative w-20 h-16 sm:w-22 sm:h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-2xs">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="88px"
                              className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
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
                          <motion.button
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={t("remove")}
                            aria-label={t("remove")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* Footer / Order Summary */}
              {formattedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    damping: 26,
                    stiffness: 220,
                    delay: 0.2,
                  }}
                  className="border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs p-5 sm:p-6 space-y-4 shrink-0 shadow-lg"
                >
                  {/* Order Summary Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{t("subtotal")}</span>
                      <span className="text-slate-900 font-bold">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>{t("taxesNote")}</span>
                      <span>--</span>
                    </div>
                    <div className="border-t border-slate-200/70 pt-2.5 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">
                        {t("total")}
                      </span>
                      <motion.span
                        key={totalPrice}
                        initial={{ scale: 1.15, color: "#059669" }}
                        animate={{ scale: 1, color: "#0F5244" }}
                        transition={{ duration: 0.3 }}
                        className="text-xl sm:text-2xl font-black text-[#0F5244] tracking-tight"
                      >
                        ${totalPrice.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1">
                    {/* Primary Checkout Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCheckout}
                      disabled={isProcessingCheckout}
                      className="w-full py-3.5 px-5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:shadow-emerald-950/15 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </motion.button>
                  </div>

                  {/* Trust Badge / Guarantee */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{t("guarantee")}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
