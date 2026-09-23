"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  LayoutDashboard,
  Palette,
  FileText,
  ShieldCheck,
  Eye,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export default function CmsAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm font-bold text-slate-300">
          {isAr ? "جاري التحقق من الصلاحيات..." : "Verifying admin access..."}
        </p>
      </div>
    );
  }

  const role = (user?.role || "").toLowerCase();
  const isAdmin = isAuthenticated && (role === "admin" || role === "staff");

  // In development mode, allow preview even if not explicitly logged in as admin
  const isDev = process.env.NODE_ENV === "development";

  if (!isAdmin && !isDev) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 p-8 rounded-3xl space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isAr ? "صلاحيات غير كافية" : "Access Denied"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr
              ? "تحتاج إلى صلاحية مدير (Admin) للوصول إلى نظام إدارة المحتوى وتخصيص الهوية."
              : "You require Django administrator privileges to access the content management system."}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? "العودة للمنصة" : "Back to Platform"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: `/${locale}/admin/cms`,
      label: isAr ? "نظرة عامة" : "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/${locale}/admin/cms/branding`,
      label: isAr ? "الهوية البصرية" : "Global Branding",
      icon: Palette,
      exact: false,
    },
    {
      href: `/${locale}/admin/cms/landing`,
      label: isAr ? "محتوى الصفحة الرئيسية" : "Landing Page",
      icon: FileText,
      exact: false,
    },
    {
      href: `/${locale}/admin/cms/pages`,
      label: isAr ? "الصفحات القانونية (الشروط والخصوصية)" : "Legal & Static Pages",
      icon: ShieldCheck,
      exact: false,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-white text-base tracking-tight leading-tight truncate">
              {isAr ? "نظام إدارة المحتوى" : "Coach Space CMS"}
            </h1>
            <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase block">
              {isAr ? "لوحة الإدارة" : "Studio Admin"}
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions & Exit Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-2 shrink-0">
        <Link
          href={`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`}
          target="_blank"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span className="truncate">{isAr ? "معاينة الموقع المباشر" : "Live Preview Site"}</span>
        </Link>

        <Link
          href={`/${locale}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          {isAr ? <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> : <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{isAr ? "العودة للمنصة" : "Back to App"}</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-900 border-e border-slate-800 flex-col shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 z-50 w-72 sm:w-80 shadow-2xl transition-transform duration-300 ease-in-out ${
          isAr
            ? mobileOpen
              ? "translate-x-0 right-0"
              : "translate-x-full right-0"
            : mobileOpen
            ? "translate-x-0 left-0"
            : "-translate-x-full left-0"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-xs text-slate-300 font-medium truncate">
              {isAr ? "لوحة التحكم المركزية بالهوية والمحتوى" : "Central Marketing & Branding Management"}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">{isAr ? "نظام الإدارة نشط" : "CMS Engine Active"}</span>
              <span className="sm:hidden">{isAr ? "نشط" : "Active"}</span>
            </span>
          </div>
        </header>

        {/* Responsive Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

