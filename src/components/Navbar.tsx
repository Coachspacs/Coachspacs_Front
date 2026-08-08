'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { logout } from '@/features/auth/slice';
import { ShoppingCart, Globe, Menu, X, User as UserIcon, BookOpen, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    let newPath = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${pathname}`;
    }
    router.push(newPath);
  };

  const isActive = (targetPath: string) => {
    let current = pathname || "/";

    // Strip locale prefix if present (e.g., /ar or /en)
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

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${locale}/login`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#0F5244] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            CoachSpace<span className="text-[#0F5244]">.</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link
            href={`/${locale}`}
            className={`transition-colors py-1 text-sm ${
              isActive("/")
                ? "text-slate-950 font-extrabold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            {t("home")}
          </Link>
          <Link
            href={`/${locale}/courses`}
            className={`transition-colors py-1 text-sm ${
              isActive("/courses")
                ? "text-slate-950 font-extrabold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            {t("courses")}
          </Link>
          <Link
            href={`/${locale}/categories`}
            className={`transition-colors py-1 text-sm ${
              isActive("/categories")
                ? "text-slate-950 font-extrabold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            {t("categories")}
          </Link>
          <Link
            href={`/${locale}/become-instructor`}
            className={`transition-colors py-1 text-sm ${
              isActive("/become-instructor")
                ? "text-slate-950 font-extrabold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            {t("becomeInstructor")}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 active:scale-95 shadow-xs"
            aria-label="Switch Language"
          >
            <Globe className="w-4 h-4 text-slate-600 shrink-0" />
            <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Cart Icon */}
          <Link href={`/${locale}/cart`} className="relative p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-[#0F5244] transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0F5244] text-white text-xs font-bold flex items-center justify-center shadow-md">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Auth buttons / User Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/account`} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 hover:border-[#0F5244] text-sm font-medium transition-colors">
                <UserIcon className="w-4 h-4 text-[#0F5244]" />
                <span>{user?.name || 'Account'}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm">{t('login')}</Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button variant="primary" size="sm">{t('register')}</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href={`/${locale}/cart`} className="relative p-2 text-slate-700">
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0F5244] text-white text-[10px] font-bold flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col gap-2 text-slate-700 font-medium">
            <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)} className={`px-3 py-2 rounded-lg transition-colors text-sm ${isActive("/") ? "text-slate-950 font-extrabold" : "hover:bg-slate-50 font-medium text-slate-600"}`}>{t('home')}</Link>
            <Link href={`/${locale}/courses`} onClick={() => setMobileMenuOpen(false)} className={`px-3 py-2 rounded-lg transition-colors text-sm ${isActive("/courses") ? "text-slate-950 font-extrabold" : "hover:bg-slate-50 font-medium text-slate-600"}`}>{t('courses')}</Link>
            <Link href={`/${locale}/categories`} onClick={() => setMobileMenuOpen(false)} className={`px-3 py-2 rounded-lg transition-colors text-sm ${isActive("/categories") ? "text-slate-950 font-extrabold" : "hover:bg-slate-50 font-medium text-slate-600"}`}>{t('categories')}</Link>
            <Link href={`/${locale}/become-instructor`} onClick={() => setMobileMenuOpen(false)} className={`px-3 py-2 rounded-lg transition-colors text-sm ${isActive("/become-instructor") ? "text-slate-950 font-extrabold" : "hover:bg-slate-50 font-medium text-slate-600"}`}>{t('becomeInstructor')}</Link>
          </nav>
          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold"
            >
              <Globe className="w-4 h-4" />
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>
            {isAuthenticated ? (
              <Button variant="danger" onClick={handleLogout} className="w-full">
                {t('logout')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link href={`/${locale}/login`} className="w-1/2">
                  <Button variant="outline" className="w-full">{t('login')}</Button>
                </Link>
                <Link href={`/${locale}/register`} className="w-1/2">
                  <Button variant="primary" className="w-full">{t('register')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
