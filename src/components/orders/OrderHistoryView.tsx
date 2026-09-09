"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Loader2,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from "lucide-react";
import { orderService } from "@/services/orderService";

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  itemsCount: number;
  itemsLabel?: string;
  total: number;
  status: "completed" | "cancelled" | "pending";
  courses: string[];
  courseDetails?: Array<{ id?: string | number; title: string }>;
}

export interface OrderHistoryViewProps {
  orders?: OrderItem[];
}

export function OrderHistoryView({ orders: initialOrders }: OrderHistoryViewProps) {
  const t = useTranslations("orderHistory");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [orders, setOrders] = useState<OrderItem[]>(initialOrders || []);
  const [isLoading, setIsLoading] = useState(!initialOrders || initialOrders.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [activePage, setActivePage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    // Clean up any old mock storage keys
    if (typeof window !== "undefined") {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("coachspace_order_status_")) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // Ignore
      }
    }
  }, []);

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(initialOrders);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchOrders() {
      setIsLoading(true);
      try {
        // Fetch student orders with a generous page size so all items are loaded cleanly
        const res = await orderService.getOrders(1, 100);
        if (isMounted && res?.results) {
          const mapped: OrderItem[] = res.results.map((rec) => {
            const resolvedStatus: "completed" | "pending" | "cancelled" =
              rec.status === "completed"
                ? "completed"
                : rec.status === "failed"
                ? "cancelled"
                : "pending";

            return {
              id: String(rec.id),
              orderNumber: `ORD-${rec.id}`,
              date: new Date(rec.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              itemsCount: rec.items?.length || 1,
              itemsLabel: `${rec.items?.length || 1} ${isAr ? "عنصر" : "items"}`,
              total: typeof rec.total_amount === "number" ? rec.total_amount : parseFloat(rec.total_amount || "0"),
              status: resolvedStatus,
              courses: rec.items?.map((item) => item.course?.title || (isAr ? "دورة تدريبية" : "Course")) || [],
              courseDetails: rec.items?.map((item) => ({
                id: item.course?.id,
                title: item.course?.title || (isAr ? "دورة تدريبية" : "Course"),
              })) || [],
            };
          });
          setOrders(mapped);
        }
      } catch (err) {
        console.warn("[OrderHistoryView] Failed to fetch orders:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [initialOrders, isAr]);

  // Derived Metrics
  const completedCount = useMemo(() => orders.filter((o) => o.status === "completed").length, [orders]);
  const pendingCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);

  // Filtered List
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter === "completed" && order.status !== "completed") return false;
      if (statusFilter === "pending" && order.status !== "pending") return false;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.courses.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [orders, statusFilter, searchQuery]);

  // Pagination Calculation
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));

  // Reset page to 1 when filters change
  useEffect(() => {
    setActivePage(1);
  }, [statusFilter, searchQuery]);

  // Ensure active page stays in bounds
  useEffect(() => {
    if (activePage > totalPages) {
      setActivePage(1);
    }
  }, [activePage, totalPages]);

  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalFiltered);
  const paginatedOrders = useMemo(
    () => filteredOrders.slice(startIndex, endIndex),
    [filteredOrders, startIndex, endIndex]
  );

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      isAr ? "رقم الطلب" : "Order ID",
      isAr ? "التاريخ" : "Date",
      isAr ? "العناصر" : "Items",
      isAr ? "المبلغ" : "Total",
      isAr ? "الحالة" : "Status",
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.date,
      `"${o.courses.join(" | ")}"`,
      `$${o.total.toFixed(2)}`,
      o.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coachspace_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Official Tax Invoice
  const handlePrintReceipt = (order: OrderItem) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      alert(isAr ? "يرجى السماح بالنوافذ المنبثقة لتحميل الفاتورة" : "Please allow popups to download the invoice");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isAr ? "rtl" : "ltr"}">
        <head>
          <title>${isAr ? "فاتورة ضريبية - " : "Invoice - "}${order.orderNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0F5244; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #0F5244; }
            .badge { background: #D1FAF0; color: #0F5244; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 12px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .details div { font-size: 13px; }
            .details span { color: #64748b; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items th { background: #f8fafc; padding: 12px; text-align: ${isAr ? "right" : "left"}; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .items td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total { text-align: ${isAr ? "left" : "right"}; font-size: 18px; font-weight: 900; color: #0F5244; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">CoachSpace</div>
              <div style="font-size: 12px; color: #64748b;">${isAr ? "منصة التدريب والتمكين الرائدة" : "Leading Coaching & Mentorship Platform"}</div>
            </div>
            <div class="badge">${isAr ? "تم السداد بالكامل عبر Stripe" : "Paid in Full via Stripe"}</div>
          </div>
          <div class="details">
            <div>
              <div><span>${isAr ? "رقم الطلب:" : "Order Number:"}</span> <strong>${order.orderNumber}</strong></div>
              <div style="margin-top: 6px;"><span>${isAr ? "تاريخ الطلب:" : "Order Date:"}</span> <strong>${order.date}</strong></div>
            </div>
            <div>
              <div><span>${isAr ? "بوابة الدفع:" : "Payment Gateway:"}</span> <strong>Stripe Official Gateway</strong></div>
              <div style="margin-top: 6px;"><span>${isAr ? "الحالة:" : "Status:"}</span> <strong style="color: #059669;">${isAr ? "مكتمل (ناجح)" : "Completed"}</strong></div>
            </div>
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>${isAr ? "الدورة التدريبية" : "Course Item"}</th>
                <th style="text-align: ${isAr ? "left" : "right"};">${isAr ? "المبلغ" : "Price"}</th>
              </tr>
            </thead>
            <tbody>
              ${(order.courseDetails && order.courseDetails.length > 0)
                ? order.courseDetails.map(c => `<tr><td><strong>${c.title}</strong></td><td style="text-align: ${isAr ? "left" : "right"}; font-weight: 700;">$${order.total.toFixed(2)}</td></tr>`).join("")
                : order.courses.map(c => `<tr><td><strong>${c}</strong></td><td style="text-align: ${isAr ? "left" : "right"}; font-weight: 700;">$${order.total.toFixed(2)}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="total">
            ${isAr ? "الإجمالي المدفوع:" : "Total Paid:"} $${order.total.toFixed(2)}
          </div>
          <div class="footer">
            ${isAr ? "شكراً لاشتراكك مع منصة كوتش سبيس - نتمنى لك رحلة تدريبية ملهمة ومثمرة" : "Thank you for enrolling with CoachSpace"}
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-150">
        <Loader2 className="h-10 w-10 text-[#0F5244] animate-spin" />
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          {isAr ? "جاري تحميل سجل الطلبات والفواتير..." : "Loading order history and invoices..."}
        </p>
      </div>
    );
  }

  // EMPTY ORDERS STATE CARD
  if (orders.length === 0) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="w-full py-12 font-sans animate-in fade-in duration-200">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D1FAF0] flex items-center justify-center mx-auto shadow-2xs">
            <Receipt className="h-9 w-9 text-[#0F5244] stroke-[1.8]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F5244] tracking-tight">
              {t("emptyTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              {t("emptyDescription")}
            </p>
          </div>

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
    <div dir={isAr ? "rtl" : "ltr"} className="w-full space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* Header: Title & Subtitle */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F5244] tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
          {t("description")}
        </p>
      </div>

      {/* Control Bar: Filter Tabs + Search + Export */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-slate-100 rounded-2xl border border-slate-200/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-white text-[#0F5244] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {isAr ? "الكل" : "All"} ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "pending"
                ? "bg-white text-amber-800 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {isAr ? "قيد الانتظار" : "Pending"} ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "completed"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {isAr ? "المكتملة" : "Completed"} ({completedCount})
          </button>
        </div>

        {/* Search & Export Action */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-11 rounded-2xl border border-slate-200/90 bg-white pl-10 rtl:pl-10 rtl:pr-10 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/15 transition-all shadow-2xs"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            title={isAr ? "تصدير السجل بتنسيق CSV" : "Export to CSV"}
            className="h-11 px-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98 shrink-0"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>{t("export")}</span>
          </button>
        </div>

      </div>

      {/* Orders Table Container */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 font-semibold text-sm">
          {t("noSearchResults")}
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
                {paginatedOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Order Number */}
                      <td className="py-5 px-6 font-extrabold text-[#0F5244] text-sm tracking-tight">
                        {order.orderNumber}
                      </td>

                      {/* Date */}
                      <td className="py-5 px-6 text-slate-500 font-semibold text-xs sm:text-sm">
                        {order.date}
                      </td>

                      {/* Items Count & Course Names */}
                      <td className="py-5 px-6 text-slate-600 font-medium text-xs sm:text-sm">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">
                            {order.itemsCount === 1
                              ? t("singleItem")
                              : t("itemsCount", { count: order.itemsCount })}
                          </span>
                          {order.courses.length > 0 && (
                            <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm">
                              {order.courses.join(", ")}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-5 px-6 font-black text-slate-900 text-base">
                        ${order.total.toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-5 px-6">
                        {order.status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#D1FAF0] text-[#064E3B] border border-emerald-200/60">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t("statusCompleted")}</span>
                          </span>
                        )}
                        {order.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200/70">
                            <XCircle className="h-3 w-3" />
                            <span>{t("statusCancelled")}</span>
                          </span>
                        )}
                        {order.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200/70">
                            <Clock className="h-3 w-3" />
                            <span>{t("statusPending")}</span>
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-5 px-6 text-end">
                        {order.status === "completed" ? (
                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(order)}
                            title={t("downloadReceipt")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#D1FAF0] text-slate-700 hover:text-[#0F5244] font-extrabold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-98 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{t("downloadReceipt")}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4">
          <button
            type="button"
            disabled={activePage === 1}
            onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-all active:scale-98 shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setActivePage(pageNum)}
              className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-2xs ${
                activePage === pageNum
                  ? "bg-[#0F5244] text-white"
                  : "border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={activePage === totalPages}
            onClick={() => setActivePage((prev) => Math.min(totalPages, prev + 1))}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-all active:scale-98 shadow-2xs"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      )}

    </div>
  );
}
