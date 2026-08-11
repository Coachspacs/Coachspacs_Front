"use client";

import React from "react";
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

  return (
    <aside
      dir={isAr ? "rtl" : "ltr"}
      className="w-full md:w-64 lg:w-72 shrink-0 bg-[#EFF5F3] border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[640px] shadow-2xs font-sans"
    >
      {/* Top Section */}
      <div className="space-y-8">
        
        {/* Brand Header Logo */}
        <div className="space-y-0.5 px-2">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F5244] tracking-tight">
            {t("brandTitle")}
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 tracking-normal">
            {t("brandSubtitle")}
          </p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id, item.href);

            const content = (
              <>
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-[#064E3B]" : "text-slate-600"}`} />
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                    active
                      ? "bg-[#94F3D2] text-[#064E3B] shadow-2xs scale-[1.01]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold hover:translate-x-1 rtl:hover:-translate-x-1"
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
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                  active
                    ? "bg-[#94F3D2] text-[#064E3B] shadow-2xs scale-[1.01]"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold hover:translate-x-1 rtl:hover:-translate-x-1"
                }`}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-6 space-y-4 border-t border-slate-300/60">
        
        {/* Sign Out Action */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-500 hover:text-red-600" />
          <span>{t("signOut")}</span>
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 px-2 pt-1">
          {defaultUser.avatarUrl ? (
            <img
              src={defaultUser.avatarUrl}
              alt={defaultUser.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-300/80 shadow-2xs shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-300/80 border border-slate-300 text-[#0F5244] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
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

      </div>
    </aside>
  );
}
