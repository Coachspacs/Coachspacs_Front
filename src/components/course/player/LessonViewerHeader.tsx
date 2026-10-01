"use client";

import React, { useState, useEffect, RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ShoppingCart,
  Globe,
  User,
  LogOut,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { openCartDrawer } from "@/features/cart/cartSlice";
import { logout } from "@/features/auth/slice";
import { tokenManager } from "@/lib/tokenManager";
import { authService } from "@/services/auth";

interface LessonViewerHeaderProps {
  courseTitle: string;
  courseSlug?: string;
  courseCover?: string;
  progressPercent: number;
  completedCount: number;
  totalLessons: number;
  backHref: string;
  locale: string;
  isAr: boolean;
  user: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  cartItems: any[];
  userDropdownOpen: boolean;
  setUserDropdownOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
  setShowShortcutsModal: (val: boolean) => void;
  handleNavigateToCertificate: () => void;
  router: any;
  pathname: string;
  dispatch: any;
  t: any;
  tNav: any;
  tHeader: any;
}

export function LessonViewerHeader({
  locale,
  isAr,
  user,
  isAdmin,
  cartItems,
  userDropdownOpen,
  setUserDropdownOpen,
  dropdownRef,
  router,
  pathname,
  dispatch,
  t,
  tNav,
  tHeader,
}: LessonViewerHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "en" || segments[0] === "ar") {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }
    router.push("/" + segments.join("/"));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // fallback cleanup
    } finally {
      tokenManager.clearTokens();
      dispatch(logout());
      router.push(`/${locale}/login`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs font-sans transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center shrink-0">
          <Logo showText={true} isAr={isAr} href={`/${locale}`} />
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          {/* Home */}
          <Link
            href={`/${locale}`}
            className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            {tNav("home")}
          </Link>

          {/* Courses */}
          <Link
            href={`/${locale}/courses`}
            className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            {tNav("courses")}
          </Link>

          {/* Role Link */}
          {isAdmin ? (
            <Link
              href={`/${locale}/admin/cms`}
              className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold text-purple-900 bg-purple-50 border border-purple-200/80 shadow-2xs inline-flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-purple-700 shrink-0" />
              <span>{isAr ? "لوحة الإدارة" : "Admin Portal"}</span>
            </Link>
          ) : (
            <Link
              href={`/${locale}/student/courses`}
              className="px-3.5 py-2 rounded-xl text-xs lg:text-sm font-extrabold bg-emerald-50 text-[#0F5244] border border-emerald-200/60 shadow-2xs inline-flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="h-4 w-4 text-[#0F5244] shrink-0" />
              <span>{tNav("myLearning")}</span>
            </Link>
          )}
        </nav>

        {/* Right Actions: Shopping Cart, Language Switcher, User Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Shopping Cart Button (Hidden for Admins) */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => dispatch(openCartDrawer())}
              className="p-2 text-slate-700 hover:text-[#0F5244] transition-colors cursor-pointer inline-flex items-center justify-center"
              title={tNav("cart")}
              aria-label={tNav("cart")}
            >
              <span className="relative inline-flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartItems.length > 0 && (
                  <span className="absolute -top-2 -end-2 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#0F5244] px-1 text-[10px] font-black leading-none text-white border-2 border-white shadow-xs pointer-events-none">
                    {cartItems.length}
                  </span>
                )}
              </span>
            </button>
          )}

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-emerald-300 hover:text-[#0F5244] transition-all shadow-2xs cursor-pointer active:scale-95"
            title={tHeader("switchLanguageLabel")}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span className="font-extrabold">{tHeader("switchLanguage")}</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/20 transition-all cursor-pointer"
              title={user?.name || user?.email || "User Profile"}
            >
              {user?.avatar ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-xs">
                  <Image
                    src={user.avatar}
                    alt={user.name || "Avatar"}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0F5244] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </button>

            {/* Dropdown Menu Card */}
            {userDropdownOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {user?.name || user?.fullName || t("registeredStudent")}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isAdmin
                        ? "bg-purple-100 text-purple-800 border border-purple-200/80 font-black"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {isAdmin ? (isAr ? "مسؤول النظام" : "Admin") : tHeader("studentRole")}
                  </span>
                </div>

                <div className="py-1">
                  {isAdmin ? (
                    <>
                      <Link
                        href={`/${locale}/admin/cms`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-purple-900 hover:bg-purple-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>{isAr ? "لوحة الإدارة (CMS)" : "Admin Portal"}</span>
                      </Link>
                      <Link
                        href={`/${locale}/admin/cms/landing`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F5244]"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isAr ? "إدارة الصفحة الرئيسية" : "Landing CMS"}</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/${locale}/student/courses`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F5244]"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tNav("myCourses")}</span>
                      </Link>
                      <Link
                        href={`/${locale}/student/settings`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F5244]"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tNav("accountSettings")}</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left rtl:text-right"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{tNav("logout")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
