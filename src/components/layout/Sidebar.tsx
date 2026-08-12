"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

export interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  items?: SidebarNavItem[];
  user?: {
    name?: string;
    role?: string;
    avatarUrl?: string | null;
  };
}

export function Sidebar({ activeTab, onTabChange, items, user }: SidebarProps) {
  const t = useTranslations("sidebar");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();

  // Mobile menu expand state
  const [isOpen, setIsOpen] = useState(false);

  // Default Navigation Items matching screenshot design
  const defaultNavItems: SidebarNavItem[] = [
    {
      id: "overview",
      label: t("dashboard"),
      icon: LayoutDashboard,
      href: `/${locale}/account`,
    },
    {
      id: "courses",
      label: t("browseCourses"),
      icon: Search,
      href: `/${locale}/catalog`,
    },
    {
      id: "cart",
      label: t("cart"),
      icon: ShoppingCart,
      href: `/${locale}/cart`,
    },
    {
      id: "orders",
      label: t("orderHistory"),
      icon: Clock,
      href: `/${locale}/account?tab=orders`,
    },
    {
      id: "certificates",
      label: t("certificates"),
      icon: CheckCircle2,
      href: `/${locale}/account?tab=certificates`,
    },
    {
      id: "settings",
      label: t("accountSettings"),
      icon: Settings,
      href: `/${locale}/student-settings`,
    },
  ];

  const navItems = items || defaultNavItems;

  // Helper to check active status
  const isItemActive = (itemId: string, href?: string) => {
    if (activeTab) return activeTab === itemId;
    if (href) return pathname === href || pathname.startsWith(href);
    return false;
  };

  const handleSignOut = () => {
    router.push(`/${locale}/login`);
  };

  const defaultUser = {
    name: user?.name || (isAr ? "ليلى حسن" : "Alex Johnson"),
    role: user?.role || (isAr ? "طالب" : "Student"),
    avatarUrl: user?.avatarUrl,
  };

  // Currently active item (for mobile collapsed header display)
  const activeItem =
    navItems.find((item) => isItemActive(item.id, item.href)) || navItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="w-full md:w-auto shrink-0">
      {/* ------------------------------------------------------------------- */}
      {/* MOBILE COLLAPSIBLE ACCORDION NAVIGATION (< md)                       */}
      {/* ------------------------------------------------------------------- */}
      <div className="md:hidden w-full bg-white border border-slate-200/80 rounded-2xl shadow-2xs font-sans overflow-hidden">
        {/* Main Collapsed Button Bar */}
        <div className="flex items-center justify-between p-2.5 bg-white">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className="flex-1 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-900 text-xs font-extrabold hover:bg-slate-100 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ActiveIcon className="h-4 w-4 text-[#0F5244] shrink-0" />
              <span className="truncate">{activeItem.label}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#0F5244]" : ""
                }`}
              />
            </div>
          </button>

          {/* Quick Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            title={t("signOut")}
            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-colors shrink-0 cursor-pointer ml-2 rtl:ml-0 rtl:mr-2"
            aria-label={t("signOut")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Expanded Accordion Menu */}
        {isOpen && (
          <div className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-slate-100 bg-slate-50/60 animate-in fade-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.id, item.href);

              const handleItemClick = () => {
                if (onTabChange) {
                  onTabChange(item.id);
                }
                setIsOpen(false);
              };

              const content = (
                <>
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-emerald-300" : "text-slate-500"}`} />
                  <span className="text-xs">{item.label}</span>
                  {active && (
                    <span className="ml-auto rtl:ml-0 rtl:mr-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </>
              );

              if (onTabChange || !item.href) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={handleItemClick}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      active
                        ? "bg-[#0F5244] text-white shadow-sm"
                        : "text-slate-700 hover:text-slate-900 hover:bg-white font-semibold"
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? "bg-[#0F5244] text-white shadow-sm"
                      : "text-slate-700 hover:text-slate-900 hover:bg-white font-semibold"
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* DESKTOP VERTICAL SIDEBAR (>= md)                                   */}
      {/* ------------------------------------------------------------------- */}
      <aside
        className="hidden md:flex w-64 lg:w-72 shrink-0 bg-white border border-slate-200/80 rounded-3xl p-6 flex-col justify-between min-h-[640px] shadow-xs font-sans"
      >
        {/* Top Section */}
        <div className="space-y-6">
          {/* Brand Header Logo */}
          <div className="space-y-0.5 px-2 pb-3 border-b border-slate-100">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F5244] tracking-tight">
              {t("brandTitle")}
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 tracking-normal">
              {t("brandSubtitle")}
            </p>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.id, item.href);

              const content = (
                <>
                  <Icon className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-emerald-300" : "text-slate-500 group-hover:text-slate-700"}`} />
                  <span className="text-sm">{item.label}</span>
                </>
              );

              if (onTabChange || !item.href) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => onTabChange && onTabChange(item.id)}
                    className={`group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                      active
                        ? "bg-[#0F5244] text-white shadow-md shadow-[#0F5244]/20 scale-[1.01]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold hover:translate-x-1 rtl:hover:-translate-x-1"
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
                  className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                    active
                      ? "bg-[#0F5244] text-white shadow-md shadow-[#0F5244]/20 scale-[1.01]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold hover:translate-x-1 rtl:hover:-translate-x-1"
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 space-y-3 border-t border-slate-100">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
            {defaultUser.avatarUrl ? (
              <img
                src={defaultUser.avatarUrl}
                alt={defaultUser.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-[#0F5244] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                {defaultUser.name.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {defaultUser.name}
              </h4>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {defaultUser.role}
              </p>
            </div>
          </div>

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-600" />
            <span>{t("signOut")}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
