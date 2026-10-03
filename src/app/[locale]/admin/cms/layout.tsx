"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
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
  Globe,
} from "lucide-react";

export default function CmsAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";
  const otherLocale = isAr ? "en" : "ar";
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("cms");
  const headerT = useTranslations("header");

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 space-y-4">
        <Loader2 className="w-8 h-8 text-[#0F5244] animate-spin" />
        <p className="text-sm font-bold text-slate-600">
          {t("verifyingAccess")}
        </p>
      </div>
    );
  }

  const role = (user?.role || "").toLowerCase();
  const isSuperuser = Boolean(
    isAuthenticated && (
      user?.is_superuser === true ||
      (user as any)?.isSuperuser === true ||
      role === "admin" ||
      role === "superuser"
    )
  );

  if (!isSuperuser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {t("accessDenied")}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t("accessDeniedDesc")}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-[#0F5244]/30"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t("backToPlatform")}</span>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: `/${locale}/admin/cms`,
      label: t("nav.overview"),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/${locale}/admin/cms/branding`,
      label: t("nav.branding"),
      icon: Palette,
      exact: false,
    },
    {
      href: `/${locale}/admin/cms/landing`,
      label: t("nav.landing"),
      icon: FileText,
      exact: false,
    },
    {
      href: `/${locale}/admin/cms/pages`,
      label: t("nav.pages"),
      icon: ShieldCheck,
      exact: false,
    },
  ];

  const switchLocaleHref = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const handleLivePreviewClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (typeof window !== "undefined") {
        const previewCached = localStorage.getItem("coachspace_cms_preview_branding");
        if (previewCached) {
          const parsed = JSON.parse(previewCached);
          fetch("/api/cms/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_branding_draft",
              data: parsed,
            }),
          }).catch(() => {});

          try {
            if (typeof BroadcastChannel !== "undefined") {
              const bc = new BroadcastChannel("coachspace_cms_preview");
              bc.postMessage({ type: "PREVIEW_BRANDING_UPDATE", branding: parsed });
              bc.close();
            }
          } catch {}
        }
      }
    } catch {}

    window.open(`/api/cms/preview?secret=coachspace_cms_preview_secret&locale=${locale}`, "_blank");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-screen lg:min-h-full bg-white text-slate-800 font-sans select-none">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="inline-flex items-center gap-2.5 min-w-0">
          <Logo showText={false} compact={true} href={`/${locale}/admin/cms`} />
          <Link
            href={`/${locale}/admin/cms`}
            className="flex flex-col min-w-0 transition-opacity duration-150 hover:opacity-90 group cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-[#0F5244] tracking-tight leading-none truncate">
                {headerT("brandName")}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#0F5244]/10 text-[#0F5244] tracking-wider leading-none shrink-0">
                CMS
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {t("studioAdmin")}
            </span>
          </Link>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
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
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions & Exit Footer (Pinned to bottom) */}
      <div className="p-4 border-t border-slate-200/80 space-y-2 shrink-0 mt-auto bg-white">
        <button
          type="button"
          onClick={handleLivePreviewClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0F5244] hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4 shrink-0 text-[#0F5244]" />
          <span className="truncate">{t("nav.previewSite")}</span>
        </button>

        <Link
          href={`/${locale}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer border border-slate-200/80"
        >
          {isAr ? <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> : <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{t("nav.backToApp")}</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-e border-slate-200 flex-col shrink-0 h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 z-50 w-72 sm:w-80 shadow-lg transition-transform duration-300 ease-in-out ${
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
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-xs text-slate-600 font-bold truncate">
              {t("headerTitle")}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <Link
              href={switchLocaleHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{isAr ? "English" : "العربية"}</span>
            </Link>

            <span className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#0F5244]/10 border border-[#0F5244]/20 text-[#0F5244] text-[11px] sm:text-xs font-bold select-none">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F5244]" />
              </span>
              <span className="hidden sm:inline">{t("activeEngine")}</span>
              <span className="sm:hidden">{t("activeShort")}</span>
            </span>
          </div>
        </header>

        {/* Responsive Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

