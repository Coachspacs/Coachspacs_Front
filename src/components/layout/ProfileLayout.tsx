"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
      <Header />
      <div className="flex-grow py-4 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {children}
      </div>
      <Footer />
    </div>
  );
}
