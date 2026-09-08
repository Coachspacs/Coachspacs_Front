"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { logout } from "@/features/auth/slice";
import { tokenManager } from "@/lib/tokenManager";
import { authService } from "@/services/auth";
import {
  LayoutDashboard,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
} from "lucide-react";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  items?: SidebarNavItem[];
  user?: {
    name?: string;
    role?: string;
    avatarUrl?: string | null;
    isApproved?: boolean;
  };
}

export function Sidebar({ activeTab, onTabChange, items, user }: SidebarProps) {
  const t = useTranslations("sidebar");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const authUser = useSelector((state: RootState) => state.auth?.user);

  // Mobile menu expand state
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default Navigation Items
  const defaultNavItems: SidebarNavItem[] = [
    {
      id: "overview",
      label: t("dashboard"),
      icon: LayoutDashboard,
      href: `/${locale}/student`,
    },
    {
      id: "courses",
      label: t("browseCourses"),
      icon: BookOpen,
      href: `/${locale}/student/courses`,
    },
    {
      id: "cart",
      label: t("cart"),
      icon: ShoppingCart,
      href: `/${locale}/student/cart`,
    },
    {
      id: "orders",
      label: t("orderHistory"),
      icon: Clock,
      href: `/${locale}/student/orders`,
    },
    {
      id: "certificates",
      label: t("certificates"),
      icon: CheckCircle2,
      href: `/${locale}/student/certificates`,
    },
    {
      id: "settings",
      label: t("accountSettings"),
      icon: Settings,
      href: `/${locale}/student/settings`,
    },
  ];

  const navItems = items || defaultNavItems;

  const normalizePath = (p?: string) => {
    if (!p) return "";
    let clean = p.split("?")[0].split("#")[0].replace(/\/$/, "");
    clean = clean.replace(/^\/(en|ar)(\/|$)/, "/");
    if (!clean.startsWith("/")) clean = "/" + clean;
    return clean;
  };

  const isItemActive = (itemId: string, href?: string) => {
    if (activeTab) return activeTab === itemId;
    if (!href) return false;

    const normPath = normalizePath(pathname);
    const normHref = normalizePath(href);

    if (normPath === normHref) return true;

    if (itemId === "overview") {
      const overviewPaths = [
        "/student",
        "/student/profile",
        "/student/dashboard",
      ];
      return overviewPaths.includes(normPath);
    }

    if (normHref !== "" && normHref !== "/" && normHref !== "/student" && normPath.startsWith(`${normHref}/`)) {
      return true;
    }

    return false;
  };

  const handleSignOut = () => {
    authService.logout().catch(() => {});
    dispatch(logout());
    router.push(`/${locale}/login`);
  };

  const activeItem =
    navItems.find((item) => isItemActive(item.id, item.href)) || navItems[0] || defaultNavItems[0];
  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="w-full md:w-auto shrink-0 font-sans">
      {/* ================= MOBILE COLLAPSIBLE NAVIGATION (< md) ================= */}
      <div className="md:hidden w-full bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between p-2.5 bg-white">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className="flex-1 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-900 text-xs font-extrabold hover:bg-slate-100 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ActiveIcon className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="truncate">{activeItem?.label || ""}</span>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-emerald-600" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            title={t("signOut")}
            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-colors shrink-0 cursor-pointer ml-2 rtl:ml-0 rtl:mr-2"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {isOpen && (
          <div className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-slate-100 bg-slate-50/60 animate-in fade-in duration-150">
            {navItems.map((item) => {
              const Icon = item?.icon || LayoutDashboard;
              const active = isItemActive(item.id, item.href);

              const handleItemClick = (e: React.MouseEvent) => {
                if (item.onClick) {
                  item.onClick(e);
                } else if (onTabChange) {
                  onTabChange(item.id);
                }
                setIsOpen(false);
              };

              const content = (
                <>
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-700" : "text-slate-500"}`} />
                  <span className="text-xs font-bold">{item.label}</span>
                  {mounted && item.id === "cart" && cartItems.length > 0 && (
                    <span className="ml-auto rtl:ml-0 rtl:mr-auto px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                      {cartItems.length}
                    </span>
                  )}
                </>
              );

              if (onTabChange || !item.href || item.onClick) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={handleItemClick}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-black shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-black shadow-2xs"
                      : "text-slate-700 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= DESKTOP VERTICAL SIDEBAR (>= md) ================= */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 bg-white border border-slate-200/80 rounded-2xl p-4 flex-col justify-between shadow-xs min-h-[520px]">
        <div className="space-y-4">
          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item?.icon || LayoutDashboard;
              const active = isItemActive(item.id, item.href);

              const content = (
                <>
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      active
                        ? "text-[#0B4F3A]"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span className={`text-xs sm:text-sm ${active ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                  {mounted && item.id === "cart" && cartItems.length > 0 && (
                    <span
                      className={`ml-auto rtl:ml-0 rtl:mr-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        active
                          ? "bg-[#0B4F3A] text-white"
                          : "bg-emerald-100 text-[#0B4F3A]"
                      }`}
                    >
                      {cartItems.length}
                    </span>
                  )}
                </>
              );

              if (onTabChange || !item.href || item.onClick) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => {
                      if (item.onClick) {
                        item.onClick(e);
                      } else if (onTabChange) {
                        onTabChange(item.id);
                      }
                    }}
                    className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                      active
                        ? "bg-[#0B4F3A]/8 text-[#0B4F3A] border-e-3 border-[#0B4F3A] font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    active
                      ? "bg-[#0B4F3A]/8 text-[#0B4F3A] border-e-3 border-[#0B4F3A] font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Sign Out */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/60 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-600" />
            <span>{t("signOut")}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
