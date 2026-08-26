"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import {
  Globe,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  Settings,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { RootState } from "@/lib/store";
import { logout } from "@/features/auth/slice";
import { tokenManager } from "@/lib/tokenManager";
import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
  lang?: "EN" | "AR";
  onLanguageToggle?: () => void;
  variant?: "main" | "auth";
}

export function Header({ lang, onLanguageToggle, variant = "main" }: HeaderProps) {
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");
  const locale = useLocale() || "en";
  const pathname = usePathname() || "";
  const router = useRouter();
  const dispatch = useDispatch();

  const isAr = locale === "ar" || lang === "AR";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  const userRole = (user?.role || "").toLowerCase();
  const isInstructor = userRole === "instructor" || userRole === "coach";
  const isApproved =
    (user?.approval_status || user?.approvalStatus || "").toLowerCase() === "approved";

  const instructorDashboardUrl = isApproved
    ? `/${locale}/instructor/dashboard`
    : `/${locale}/instructor`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside or escape key (only when open)
  useEffect(() => {
    if (!userDropdownOpen && !mobileMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userDropdownOpen, mobileMenuOpen]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLanguageToggle = () => {
    if (onLanguageToggle) {
      onLanguageToggle();
      return;
    }
    const nextLocale = locale === "ar" ? "en" : "ar";
    let newPath = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${pathname}`;
    }
    router.push(newPath);
  };

  const handleLogout = () => {
    tokenManager.clearTokens();
    dispatch(logout());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(`/${locale}/login`);
  };

  // Helper to normalize path by stripping locale prefix and query
  const normalizePath = (path: string) => {
    if (!path) return "/";
    let clean = path.split("?")[0].split("#")[0].replace(/\/$/, "");
    clean = clean.replace(/^\/(en|ar)(\/|$)/, "/");
    if (!clean.startsWith("/")) clean = "/" + clean;
    return clean || "/";
  };

  const currentCleanPath = normalizePath(pathname);

  // Accurate active link detection
  const isActive = (targetPath: string) => {
    const target = normalizePath(targetPath);
    if (target === "/") {
      return currentCleanPath === "/";
    }
    return currentCleanPath === target || currentCleanPath.startsWith(`${target}/`);
  };

  // ----------------------------------------------------
  // AUTH HEADER VARIANT (For Login, Register, Auth pages)
  // ----------------------------------------------------
  if (variant === "auth") {
    return (
      <header className="sticky top-0 z-50 w-full shrink-0">
        <div className="h-16 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Logo showText={true} isAr={isAr} href={`/${locale}`} />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLanguageToggle}
                aria-label={tHeader("switchLanguageLabel")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 hover:text-[#0F5244] transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 active:scale-95 shadow-2xs cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>{tHeader("switchLanguage")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ----------------------------------------------------
  // MAIN HEADER VARIANT (For Public & Portal Pages)
  // ----------------------------------------------------
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs font-sans transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Logo showText={true} isAr={isAr} href={`/${locale}`} />
        </div>

        {/* Center: Desktop Navigation Links (>= md) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          
          {/* 1. Home Link */}
          <Link
            href={`/${locale}`}
            className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all ${
              isActive("/")
                ? "bg-emerald-50 text-[#0F5244] font-extrabold border border-emerald-200/60 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tNav("home")}
          </Link>

          {/* 2. Courses Catalog Link */}
          <Link
            href={`/${locale}/courses`}
            className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all ${
              isActive("/courses")
                ? "bg-emerald-50 text-[#0F5244] font-extrabold border border-emerald-200/60 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tNav("courses")}
          </Link>

          {/* 3. Role-Based Navigation Link */}
          {mounted && isAuthenticated ? (
            isInstructor ? (
              <Link
                href={instructorDashboardUrl}
                className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                  isActive("/instructor")
                    ? "bg-emerald-50 text-[#0F5244] font-extrabold border border-emerald-200/60 shadow-2xs"
                    : "text-slate-600 hover:text-[#0F5244] hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-[#0F5244] shrink-0" />
                <span>{tNav("instructorStudio")}</span>
              </Link>
            ) : (
              <Link
                href={`/${locale}/student/courses`}
                className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                  isActive("/student/courses")
                    ? "bg-emerald-50 text-[#0F5244] font-extrabold border border-emerald-200/60 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="h-4 w-4 text-[#0F5244] shrink-0" />
                <span>{tNav("myLearning")}</span>
              </Link>
            )
          ) : (
            <Link
              href={`/${locale}/become-instructor`}
              className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                isActive("/become-instructor")
                  ? "bg-emerald-50 text-[#0F5244] font-extrabold border border-emerald-200/60 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{tNav("becomeInstructor")}</span>
            </Link>
          )}

        </nav>

        {/* Right: Actions (Language, Cart, Auth / User Profile) */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5">
          
          {/* Shopping Cart Button (For Guests and Students only) */}
          {(!mounted || !isAuthenticated || !isInstructor) && (
            <Link
              href={`/${locale}/student/cart`}
              className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                isActive("/student/cart")
                  ? "bg-emerald-50 text-[#0F5244] border border-emerald-200/60"
                  : "text-slate-600 hover:text-[#0F5244] hover:bg-slate-50 border border-transparent"
              }`}
              aria-label={tHeader("cartAria")}
              title={tHeader("cartAria")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#0F5244] px-1 text-[10px] font-black text-white shadow-xs">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 hover:text-[#0F5244] transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 active:scale-95 shadow-2xs cursor-pointer"
            aria-label={tHeader("switchLanguageLabel")}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>{tHeader("switchLanguage")}</span>
          </button>

          {/* Vertical Divider */}
          <div className="h-5 w-[1px] bg-slate-200" />

          {/* Auth State: User Menu Dropdown OR Login/Register CTA */}
          {mounted && isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-[#0F5244]/30 ring-offset-1 transition-all cursor-pointer group"
                aria-label={tHeader("userMenu")}
                aria-expanded={userDropdownOpen}
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user?.name || user?.fullName || "User Avatar"}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-2xs group-hover:border-emerald-500 transition-colors"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200/90 flex items-center justify-center text-[#0F5244] font-black text-xs shadow-2xs group-hover:bg-emerald-200 transition-colors">
                    {(user?.name || user?.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180 text-[#0F5244]" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Popup Menu (Concise & Non-redundant) */}
              {userDropdownOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2.5 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 text-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* User Profile Card Header */}
                  <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {user?.name || user?.fullName || (isAr ? "المستخدم" : "User")}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isInstructor
                            ? "bg-amber-100 text-amber-900 border border-amber-200/80"
                            : "bg-emerald-100 text-[#0F5244] border border-emerald-200/80"
                        }`}
                      >
                        {isInstructor ? tHeader("instructorRole") : tHeader("studentRole")}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {user?.email || "user@coachspace.com"}
                    </p>
                  </div>

                  {/* Concise Account Actions */}
                  <div className="py-1 space-y-0.5">
                    {isInstructor ? (
                      <>
                        <Link
                          href={instructorDashboardUrl}
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                            isActive("/instructor/dashboard") || isActive("/instructor")
                              ? "bg-emerald-50 text-[#0F5244]"
                              : "hover:bg-slate-50 text-slate-700 hover:text-[#0F5244]"
                          }`}
                        >
                          <LayoutDashboard className="h-4 w-4 text-[#0F5244] shrink-0" />
                          <span>{tNav("instructorDashboard")}</span>
                        </Link>

                        <Link
                          href={`/${locale}/instructor/settings`}
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                            isActive("/instructor/settings")
                              ? "bg-emerald-50 text-[#0F5244]"
                              : "hover:bg-slate-50 text-slate-700 hover:text-[#0F5244]"
                          }`}
                        >
                          <Settings className="h-4 w-4 text-[#0F5244] shrink-0" />
                          <span>{tNav("accountSettings")}</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/${locale}/student/profile`}
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                            isActive("/student/profile")
                              ? "bg-emerald-50 text-[#0F5244]"
                              : "hover:bg-slate-50 text-slate-700 hover:text-[#0F5244]"
                          }`}
                        >
                          <UserIcon className="h-4 w-4 text-[#0F5244] shrink-0" />
                          <span>{tNav("profile")}</span>
                        </Link>

                        <Link
                          href={`/${locale}/student/settings`}
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                            isActive("/student/settings")
                              ? "bg-emerald-50 text-[#0F5244]"
                              : "hover:bg-slate-50 text-slate-700 hover:text-[#0F5244]"
                          }`}
                        >
                          <Settings className="h-4 w-4 text-[#0F5244] shrink-0" />
                          <span>{tNav("accountSettings")}</span>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>{tNav("logout")}</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* Guest Auth Buttons */
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/login`}
                className="px-3.5 py-2 text-xs lg:text-sm font-bold text-slate-700 hover:text-[#0F5244] hover:bg-slate-50 rounded-xl transition-all"
              >
                {tNav("login")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs lg:text-sm font-bold transition-all shadow-xs active:scale-98"
              >
                {tNav("register")}
              </Link>
            </div>
          )}

        </div>

        {/* Mobile & Tablet Controls (< md) */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          
          {/* Cart Icon on Mobile */}
          {(!mounted || !isAuthenticated || !isInstructor) && (
            <Link
              href={`/${locale}/student/cart`}
              className="relative p-2 text-slate-700 hover:text-[#0F5244] rounded-xl hover:bg-slate-50"
              aria-label={tHeader("cartAria")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 rtl:right-auto rtl:left-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0F5244] px-1 text-[9px] font-black text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Language Switcher on Mobile */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-white"
            aria-label={tHeader("switchLanguageLabel")}
          >
            <Globe className="h-3 w-3 text-emerald-700" />
            <span>{tHeader("switchLanguage")}</span>
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-[#0F5244] focus:outline-none cursor-pointer"
            aria-label={mobileMenuOpen ? tHeader("closeMenu") : tHeader("menu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* MOBILE FULL-WIDTH DRAWER MENU (< md)                 */}
      {/* ---------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content (Concise & Focused) */}
          <div className="fixed top-16 inset-x-0 bg-white border-b border-slate-200 shadow-2xl z-50 max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
            
            {/* Top Area: Authenticated User Profile Banner OR Guest CTA Buttons */}
            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[#0F5244] font-black text-sm shrink-0 shadow-2xs">
                    {(user?.name || user?.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {user?.name || user?.fullName || "User"}
                    </p>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                        isInstructor
                          ? "bg-amber-100 text-amber-900 border border-amber-200/80"
                          : "bg-emerald-100 text-[#0F5244] border border-emerald-200/80"
                      }`}
                    >
                      {isInstructor ? tHeader("instructorRole") : tHeader("studentRole")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {user?.email || "user@coachspace.com"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-1">
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {tNav("login")}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-[#0F5244] text-center text-xs font-bold text-white hover:bg-[#07382E]"
                >
                  {tNav("register")}
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1">
              
              {/* 1. Home */}
              <Link
                href={`/${locale}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive("/")
                    ? "bg-[#0F5244] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${isActive("/") ? "text-white" : "text-emerald-700"}`} />
                <span>{tNav("home")}</span>
              </Link>

              {/* 2. Courses */}
              <Link
                href={`/${locale}/courses`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive("/courses")
                    ? "bg-[#0F5244] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <BookOpen className={`h-4 w-4 ${isActive("/courses") ? "text-white" : "text-emerald-700"}`} />
                <span>{tNav("courses")}</span>
              </Link>

              {/* 3. Role-Based Navigation Items */}
              {mounted && isAuthenticated ? (
                isInstructor ? (
                  <>
                    <Link
                      href={instructorDashboardUrl}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive("/instructor/dashboard") || (isActive("/instructor") && !isActive("/instructor/settings"))
                          ? "bg-[#0F5244] text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4 text-emerald-700" />
                      <span>{tNav("instructorDashboard")}</span>
                    </Link>

                    <Link
                      href={`/${locale}/instructor/settings`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive("/instructor/settings")
                          ? "bg-[#0F5244] text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Settings className="h-4 w-4 text-emerald-700" />
                      <span>{tNav("accountSettings")}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/student/courses`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive("/student/courses")
                          ? "bg-[#0F5244] text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <BookOpen className="h-4 w-4 text-emerald-700" />
                      <span>{tNav("myLearning")}</span>
                    </Link>

                    <Link
                      href={`/${locale}/student/profile`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive("/student/profile")
                          ? "bg-[#0F5244] text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <UserIcon className="h-4 w-4 text-emerald-700" />
                      <span>{tNav("profile")}</span>
                    </Link>

                    <Link
                      href={`/${locale}/student/settings`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive("/student/settings")
                          ? "bg-[#0F5244] text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Settings className="h-4 w-4 text-emerald-700" />
                      <span>{tNav("accountSettings")}</span>
                    </Link>
                  </>
                )
              ) : (
                /* Guest Become Instructor Link */
                <Link
                  href={`/${locale}/become-instructor`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive("/become-instructor")
                      ? "bg-[#0F5244] text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  <span>{tNav("becomeInstructor")}</span>
                </Link>
              )}

            </nav>

            {/* Bottom Section: Mobile Logout */}
            {mounted && isAuthenticated && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{tNav("logout")}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </header>
  );
}
