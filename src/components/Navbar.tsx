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

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${locale}/login`);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
            CoachSpace<span className="text-brand-500">.</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href={`/${locale}`} className="hover:text-brand-400 transition-colors">
            {t('home')}
          </Link>
          <Link href={`/${locale}/courses`} className="hover:text-brand-400 transition-colors">
            {t('courses')}
          </Link>
          {isAuthenticated && (
            <Link href={`/${locale}/my-courses`} className="hover:text-brand-400 transition-colors">
              {t('myCourses')}
            </Link>
          )}
          {isAuthenticated && (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold">
              <LayoutDashboard className="w-4 h-4" />
              {t('dashboard')}
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-xs font-semibold uppercase tracking-wider transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            {locale === 'ar' ? 'English' : 'العربية'}
          </button>

          {/* Cart Icon */}
          <Link href={`/${locale}/cart`} className="relative p-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-300 hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Auth buttons / User Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/account`} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:border-brand-500 text-sm font-medium transition-colors">
                <UserIcon className="w-4 h-4 text-brand-400" />
                <span>{user?.name || 'Account'}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:bg-red-950/40 hover:text-red-300">
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
          <Link href={`/${locale}/cart`} className="relative p-2 text-slate-300">
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-slate-800 px-4 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col gap-3 text-slate-300 font-medium">
            <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)}>{t('home')}</Link>
            <Link href={`/${locale}/courses`} onClick={() => setMobileMenuOpen(false)}>{t('courses')}</Link>
            {isAuthenticated && (
              <Link href={`/${locale}/my-courses`} onClick={() => setMobileMenuOpen(false)}>{t('myCourses')}</Link>
            )}
            {isAuthenticated && (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
              <Link href={`/${locale}/dashboard`} onClick={() => setMobileMenuOpen(false)} className="text-brand-400">{t('dashboard')}</Link>
            )}
          </nav>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-sm"
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
