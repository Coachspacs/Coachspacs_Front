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
  Eye,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function CmsAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-e border-slate-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-tight leading-tight">
                {isAr ? "نظام إدارة المحتوى" : "Coach Space CMS"}
              </h1>
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
                {isAr ? "لوحة الإدارة" : "Studio Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions & Exit Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            href={`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{isAr ? "معاينة الموقع المباشر" : "Live Preview Site"}</span>
          </Link>

          <Link
            href={`/${locale}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            <span>{isAr ? "العودة للمنصة" : "Back to App"}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
          <div className="text-xs text-slate-400 font-medium">
            {isAr ? "لوحة التحكم المركزية بالهوية والمحتوى" : "Central Marketing & Branding Management"}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? "نظام الإدارة نشط" : "CMS Engine Active"}</span>
            </span>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
