"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Trash2, ArrowRight, ShoppingBag, Search } from "lucide-react";

export interface CartItem {
  id: string;
  title: string;
  instructor: string;
  price: number;
  image: string;
}

const defaultDemoItems: CartItem[] = [
  {
    id: "1",
    title: "Advanced UI Patterns",
    instructor: "Sarah Jenkins",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    title: "Leadership Foundations",
    instructor: "Marcus Thorne",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    title: "Data-Driven Decision Making",
    instructor: "Dr. Emily Chen",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  },
];

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

  const [localItems, setLocalItems] = useState<CartItem[]>(items && items.length > 0 ? items : defaultDemoItems);

  const displayItems = items !== undefined ? items : localItems;

  const handleRemove = (id: string) => {
    if (onRemoveItem) {
      onRemoveItem(id);
    } else {
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
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
            <img
              src="/images/empty-cart-bag.png"
              alt="Empty Cart Bag"
              width={224}
              height={176}
              loading="lazy"
              decoding="async"
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
              href={`/${locale}/catalog`}
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
                  <img
                    src={item.image}
                    alt={item.title}
                    width={128}
                    height={80}
                    loading="lazy"
                    decoding="async"
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
                <button
                  type="button"
                  onClick={onCheckout}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t("checkout")}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
