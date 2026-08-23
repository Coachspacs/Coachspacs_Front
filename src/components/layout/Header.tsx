"use client";

import React, { useState, useEffect } from "react";
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
  PlusCircle,
} from "lucide-react";
import { RootState } from "@/lib/store";
import { logout } from "@/features/auth/slice";
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
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const isAr = locale === "ar" || lang === "AR";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    dispatch(logout());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(`/${locale}/login`);
  };

  // Helper to check if link is active
  const isActive = (targetPath: string) => {
    let current = pathname || "/";

    if (current === `/${locale}` || current === `/${locale}/`) {
      current = "/";
    } else if (current.startsWith(`/${locale}/`)) {
      current = current.slice(locale.length + 1);
    }

    if (!current.startsWith("/")) {
      current = "/" + current;
    }

    if (targetPath === "/") {
      return current === "/";
    }

    return current === targetPath || current.startsWith(targetPath + "/");
  };

  // ----------------------------------------------------
  // AUTH HEADER VARIANT (For Login, Register, Auth pages)
  // ----------------------------------------------------
  if (variant === "auth") {
    return (
      <header className="sticky top-0 z-50 w-full shrink-0 transition-all duration-300">
        <div className="h-16 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Logo showText={true} isAr={isAr} />
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={handleLanguageToggle}
                aria-label={tHeader("switchLanguageLabel")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 active:scale-95 shadow-xs"
              >
                <Globe className="h-4 w-4 text-slate-600 shrink-0" />
                <span>{tHeader("switchLanguage")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ----------------------------------------------------
  // MAIN HEADER VARIANT (For Home Page & All Main Pages)
  // ----------------------------------------------------
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <Logo showText={true} isAr={isAr} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
          <Link
            href={`/${locale}`}
            className={`transition-colors py-1 text-sm ${
              isActive("/")
                ? "text-slate-950 font-extrabold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            {tNav("home")}
          </Link>

          <Link
            href={`/${locale}/catalog`}
            className={`transition-colors py-1 text-sm ${
              isActive("/catalog")
                ? "text-[#0F5244] font-extrabold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            {tNav("catalog")}
          </Link>

          <Link
            href={`/${locale}/courses`}
            className={`transition-colors py-1 text-sm ${
              isActive("/courses")
                ? "text-[#0F5244] font-extrabold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            {tNav("courses")}
          </Link>

          {/* Role-Specific CTA Link in Navbar */}
          {mounted && isAuthenticated && isInstructor ? (
            <Link
              href={instructorDashboardUrl}
              className={`transition-colors py-1 text-sm inline-flex items-center gap-1.5 ${
                isActive("/instructor")
                  ? "text-[#0F5244] font-extrabold"
                  : "text-slate-600 hover:text-[#0F5244] font-bold"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-[#0F5244]" />
              <span>{isAr ? "مساحة المدرب" : "Instructor Studio"}</span>
            </Link>
          ) : (
            <Link
              href={`/${locale}/become-instructor`}
              className={`transition-colors py-1 text-sm ${
                isActive("/become-instructor")
                  ? "text-slate-950 font-extrabold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              {tNav("becomeInstructor")}
            </Link>
          )}
        </nav>

        {/* Right Section: Language Toggle | Divider | Avatar */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4">
          
          {/* Language Switcher Pill Button */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 active:scale-95 shadow-xs"
            aria-label={tHeader("switchLanguageLabel")}
          >
            <Globe className="h-4 w-4 text-slate-600 shrink-0" />
            <span>{tHeader("switchLanguage")}</span>
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-[1.5px] bg-slate-200" />

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#0F5244] ring-offset-2 transition-transform active:scale-95"
              aria-label="User Profile Menu"
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user?.name || "User Avatar"}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs hover:bg-slate-200/80 transition-colors">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-60 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 text-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {mounted && isAuthenticated ? (
                  <>
                    {/* User Header & Role Badge */}
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.name || user?.fullName || "User"}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isInstructor ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-[#0F5244]"
                        }`}>
                          {isInstructor ? (isAr ? "مدرب" : "Instructor") : (isAr ? "طالب" : "Student")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {/* INSTRUCTOR SPECIFIC LINKS */}
                      {isInstructor ? (
                        <>
                          <Link
                            href={instructorDashboardUrl}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <LayoutDashboard className="h-4 w-4 text-[#0F5244]" />
                            <span>{isAr ? "لوحة تحكم المدرب" : "Instructor Dashboard"}</span>
                          </Link>

                          <Link
                            href={`/${locale}/instructor/courses`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <BookOpen className="h-4 w-4 text-[#0F5244]" />
                            <span>{isAr ? "إدارة وتعديل الدورات" : "Manage Courses"}</span>
                          </Link>

                          <Link
                            href={`/${locale}/instructor/courses/new`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <PlusCircle className="h-4 w-4 text-[#0F5244]" />
                            <span>{isAr ? "إنشاء دورة جديدة" : "Create New Course"}</span>
                          </Link>

                          <Link
                            href={`/${locale}/instructor/settings`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <Settings className="h-4 w-4 text-[#0F5244]" />
                            <span>{isAr ? "إعدادات الحساب والملف" : "Profile & Settings"}</span>
                          </Link>
                        </>
                      ) : (
                        /* STUDENT SPECIFIC LINKS */
                        <>
                          <Link
                            href={`/${locale}/student/courses`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <BookOpen className="h-4 w-4 text-[#0F5244]" />
                            <span>{isAr ? "دوراتي التعليمية" : "My Learning"}</span>
                          </Link>

                          <Link
                            href={`/${locale}/student/profile`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <UserIcon className="h-4 w-4 text-[#0F5244]" />
                            <span>{isAr ? "الملف الشخصي" : "Profile"}</span>
                          </Link>

                          <Link
                            href={`/${locale}/student/settings`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <Settings className="h-4 w-4 text-[#0F5244]" />
                            <span>{isAr ? "إعدادات الحساب" : "Account Settings"}</span>
                          </Link>

                          <Link
                            href={`/${locale}/cart`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex justify-between items-center rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <span className="flex items-center gap-2.5">
                              <ShoppingCart className="h-4 w-4 text-[#0F5244]" />
                              <span>{tNav("cart")}</span>
                            </span>
                            {cartItems.length > 0 && (
                              <span className="rounded-full bg-[#0F5244] px-2 py-0.5 text-xs text-white font-bold">
                                {cartItems.length}
                              </span>
                            )}
                          </Link>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{tNav("logout")}</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-1 p-1">
                    <Link
                      href={`/${locale}/login`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      <UserIcon className="h-4 w-4 text-[#0F5244]" />
                      <span>{tNav("login")}</span>
                    </Link>
                    <Link
                      href={`/${locale}/register`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-center rounded-xl bg-[#0F5244] px-3 py-2.5 text-sm font-extrabold text-white hover:bg-[#0c4337] transition-colors shadow-xs"
                    >
                      <span>{tNav("register")}</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            aria-label={tHeader("switchLanguageLabel")}
          >
            <Globe className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span>{tHeader("switchLanguage")}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-slate-700">
            <Link
              href={`/${locale}`}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive("/")
                  ? "text-slate-950 font-extrabold"
                  : "hover:bg-slate-50 font-medium text-slate-600"
              }`}
            >
              {tNav("home")}
            </Link>

            <Link
              href={`/${locale}/catalog`}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive("/catalog")
                  ? "text-[#0F5244] font-extrabold"
                  : "hover:bg-slate-50 font-medium text-slate-600"
              }`}
            >
              {tNav("catalog")}
            </Link>

            <Link
              href={`/${locale}/courses`}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive("/courses")
                  ? "text-[#0F5244] font-extrabold"
                  : "hover:bg-slate-50 font-medium text-slate-600"
              }`}
            >
              {tNav("courses")}
            </Link>

            {mounted && isAuthenticated && isInstructor ? (
              <Link
                href={instructorDashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  isActive("/instructor")
                    ? "text-[#0F5244] font-extrabold"
                    : "hover:bg-slate-50 font-bold text-[#0F5244]"
                }`}
              >
                {isAr ? "مساحة المدرب" : "Instructor Studio"}
              </Link>
            ) : (
              <Link
                href={`/${locale}/become-instructor`}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  isActive("/become-instructor")
                    ? "text-slate-950 font-extrabold"
                    : "hover:bg-slate-50 font-medium text-slate-600"
                }`}
              >
                {tNav("becomeInstructor")}
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.name || "Coach Space User"}</p>
                <p className="text-xs text-slate-500">{user?.email || "welcome@coachspace.com"}</p>
              </div>
            </div>

            {mounted && isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <Link
                href={`/${locale}/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-[#0F5244] px-4 py-2 text-sm font-bold text-white"
              >
                {tNav("login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
