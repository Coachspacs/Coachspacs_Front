"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
} from "lucide-react";

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  itemsCount: number;
  itemsLabel?: string;
  total: number;
  status: "completed" | "cancelled" | "pending";
  courses: string[];
}

const defaultDemoOrders: OrderItem[] = [
  {
    id: "1",
    orderNumber: "#CS-7721",
    date: "Oct 12, 2023",
    itemsCount: 2,
    total: 89.99,
    status: "completed",
    courses: ["Advanced UI Patterns", "React 19 & Next.js Masterclass"],
  },
  {
    id: "2",
    orderNumber: "#CS-7650",
    date: "Sep 28, 2023",
    itemsCount: 1,
    total: 129.00,
    status: "completed",
    courses: ["Figma UI/UX Design System"],
  },
  {
    id: "3",
    orderNumber: "#CS-7512",
    date: "Aug 05, 2023",
    itemsCount: 1,
    total: 15.00,
    status: "cancelled",
    courses: ["Python Machine Learning Basics"],
  },
];

export interface OrderHistoryViewProps {
  orders?: OrderItem[];
}

export function OrderHistoryView({ orders = defaultDemoOrders }: OrderHistoryViewProps) {
  const t = useTranslations("orderHistory");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.courses.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  // EMPTY ORDERS STATE CARD (Matching exact user screenshot)
  if (orders.length === 0) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="w-full py-8 font-sans animate-in fade-in duration-200">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xs text-center space-y-6">
          
          {/* Top Mint Circle Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D1FAF0] flex items-center justify-center mx-auto shadow-2xs">
            <Receipt className="h-9 w-9 text-[#0F5244] stroke-[1.8]" />
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F5244] tracking-tight">
              {t("emptyTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              {t("emptyDescription")}
            </p>
          </div>

          {/* Browse Courses Button */}
          <div className="pt-2">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-98"
            >
              <Search className="h-4 w-4" />
              <span>{t("browseCourses")}</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="w-full space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* Header: Title & Description */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F5244] tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
          {t("description")}
        </p>
      </div>

      {/* Control Bar: Search + Export */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-11 rounded-2xl border border-slate-200/90 bg-white pl-10 rtl:pl-4 rtl:pr-10 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/15 transition-all shadow-2xs"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            className="h-11 px-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>{t("export")}</span>
          </button>
        </div>

      </div>

      {/* Orders Table Container */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 font-semibold text-sm">
          {isAr ? "لا توجد نتائج مطابقة لبحثك" : "No orders found matching your search"}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6 text-start">{t("colOrder")}</th>
                  <th className="py-4 px-6 text-start">{t("colDate")}</th>
                  <th className="py-4 px-6 text-start">{t("colItems")}</th>
                  <th className="py-4 px-6 text-start">{t("colTotal")}</th>
                  <th className="py-4 px-6 text-start">{t("colStatus")}</th>
                  <th className="py-4 px-6 text-end">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90 font-medium">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        onClick={() => toggleExpand(order.id)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      >
                        {/* Order Number */}
                        <td className="py-5 px-6 font-extrabold text-[#0F5244] text-sm tracking-tight">
                          {order.orderNumber}
                        </td>

                        {/* Date */}
                        <td className="py-5 px-6 text-slate-500 font-semibold text-xs sm:text-sm">
                          {order.date}
                        </td>

                        {/* Items Count */}
                        <td className="py-5 px-6 text-slate-600 font-medium text-xs sm:text-sm">
                          {order.itemsCount === 1
                            ? t("singleItem")
                            : t("itemsCount", { count: order.itemsCount })}
                        </td>

                        {/* Total Price */}
                        <td className="py-5 px-6 font-black text-slate-900 text-base">
                          ${order.total.toFixed(2)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-5 px-6">
                          {order.status === "completed" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#94F3D2]/40 text-[#064E3B]">
                              {t("statusCompleted")}
                            </span>
                          )}
                          {order.status === "cancelled" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700">
                              {t("statusCancelled")}
                            </span>
                          )}
                          {order.status === "pending" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Expand Action */}
                        <td className="py-5 px-6 text-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-t border-slate-100">
                          <td colSpan={6} className="p-5 sm:p-6 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  {isAr ? "الدورات المشترية:" : "Purchased Courses:"}
                                </span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {order.courses.map((courseTitle, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold"
                                    >
                                      {courseTitle}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => alert(isAr ? "جاري تحميل الفاتورة..." : "Downloading receipt...")}
                                className="px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>{t("downloadReceipt")}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination & Showing Footer */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-400">
            {t("showingText", { start: 1, end: filteredOrders.length, total: 12 })}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-2xs"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => setActivePage(1)}
              className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-2xs ${
                activePage === 1
                  ? "bg-[#0F5244] text-white"
                  : "border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              1
            </button>

            <button
              type="button"
              onClick={() => setActivePage(2)}
              className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-2xs ${
                activePage === 2
                  ? "bg-[#0F5244] text-white"
                  : "border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              2
            </button>

            <button
              type="button"
              onClick={() => setActivePage(3)}
              className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-2xs ${
                activePage === 3
                  ? "bg-[#0F5244] text-white"
                  : "border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              3
            </button>

            <button
              type="button"
              className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-2xs"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
