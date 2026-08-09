"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Heart, User, Globe, Menu, X } from "lucide-react";

interface CatalogHeaderProps {
  currentLocale: string;
}

export function CatalogHeader({ currentLocale }: CatalogHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() || currentLocale;
  const isAr = locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = useTranslations("catalog.header");
  const brandT = useTranslations("header");

  const handleLanguageToggle = () => {
    const nextLocale = isAr ? "en" : "ar";
    let newPath = pathname;
    if (pathname.startsWith(`/${currentLocale}`)) {
      newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${pathname}`;
    }
    router.push(newPath);
  };

  const navItems = [
    { key: "browse", labelKey: "browse", href: `/${currentLocale}/courses`, active: true },
    { key: "myLearning", labelKey: "myLearning", href: `/${currentLocale}/my-courses`, active: false },
    { key: "mentors", labelKey: "mentors", href: `/${currentLocale}/mentors`, active: false },
    { key: "resources", labelKey: "resources", href: `/${currentLocale}/resources`, active: false },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xs shadow-2xs transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link 
            href={`/${currentLocale}`} 
            className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F5244] hover:opacity-90 transition-opacity"
          >
            <span className="bg-[#0F5244] text-white px-2 py-0.5 rounded-lg text-lg font-black shadow-xs">C</span>
            <span>{brandT("brandName")}</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse h-full">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`relative flex items-center h-full text-sm sm:text-base font-semibold transition-colors duration-150 ${
                item.active
                  ? "text-[#0F5244] font-bold"
                  : "text-slate-600 hover:text-[#0F5244]"
              }`}
            >
              <span>{t(item.labelKey)}</span>
              {item.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0F5244] rounded-t-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions (Notification, Wishlist, User Avatar, Language Toggle) */}
        <div className="hidden md:flex items-center gap-4 sm:gap-5">
          {/* Notification Bell Icon */}
          <button 
            type="button" 
            className="relative p-2 text-slate-600 hover:text-[#0F5244] hover:bg-slate-100/70 rounded-full transition-colors"
            title={t("notifications")}
            aria-label={t("notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {/* Wishlist Heart Icon */}
          <button 
            type="button" 
            className="p-2 text-slate-600 hover:text-[#0F5244] hover:bg-slate-100/70 rounded-full transition-colors"
            title={t("wishlist")}
            aria-label={t("wishlist")}
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* User Avatar Circle */}
          <button 
            type="button" 
            className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 text-[#0F5244] border border-slate-200 hover:border-[#0F5244] transition-all shadow-2xs"
            title={t("profile")}
            aria-label={t("profile")}
          >
            <User className="h-5 w-5" />
          </button>

          {/* Divider */}
          <div className="h-5 w-[1px] bg-slate-200" />

          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5244]/20 active:scale-95 shadow-2xs"
            aria-label={brandT("switchLanguageLabel")}
          >
            <Globe className="h-4 w-4 text-slate-500" />
            <span>{brandT("switchLanguage")}</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="p-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            {brandT("switchLanguage")}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold transition-colors ${
                item.active
                  ? "bg-[#0F5244]/10 text-[#0F5244]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around">
            <button type="button" className="flex items-center gap-1.5 text-slate-700 text-sm font-medium py-2">
              <Bell className="h-5 w-5" />
              <span>{t("notifications")}</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 text-slate-700 text-sm font-medium py-2">
              <Heart className="h-5 w-5" />
              <span>{t("wishlist")}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
