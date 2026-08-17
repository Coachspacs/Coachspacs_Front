"use client";

import React from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const lang = isAr ? "AR" : "EN";

  const toggleLanguage = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    let newPath = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    } else {
      newPath = `/${nextLocale}${pathname}`;
    }
    router.push(newPath);
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex min-h-screen w-full flex-col justify-between bg-slate-50 text-slate-800 selection:bg-[#0F5244] selection:text-white font-sans overflow-hidden"
    >
      {/* Background SVG Grid Mesh Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#34D399]/20 via-[#0F5244]/8 to-transparent blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/2 -right-32 -z-10 h-[500px] w-[500px] rounded-full bg-[#D1FAE5]/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 -left-32 -z-10 h-[450px] w-[450px] rounded-full bg-[#0F5244]/8 blur-3xl" />

      {/* Shared Auth Header */}
      <Header variant="auth" lang={lang} onLanguageToggle={toggleLanguage} />

      {/* Main Centered Content */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-6 my-auto">
        {children}
      </main>

      {/* Shared Auth Minimal Footer */}
      <Footer variant="auth" lang={lang} />
    </div>
  );
}
