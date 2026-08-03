"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { LoginCard } from "@/components/auth/LoginCard";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  const isAr = lang === "AR";

  const toggleLanguage = () => {
    setLang((prev) => (prev === "EN" ? "AR" : "EN"));
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex h-screen h-[100dvh] w-full max-w-full overflow-hidden flex-col justify-between bg-slate-50 text-slate-800 selection:bg-[#0F5244] selection:text-white font-sans"
    >
      {/* Background SVG Grid Mesh Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#34D399]/20 via-[#0F5244]/8 to-transparent blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/2 -right-32 -z-10 h-[500px] w-[500px] rounded-full bg-[#D1FAE5]/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 -left-32 -z-10 h-[450px] w-[450px] rounded-full bg-[#0F5244]/8 blur-3xl" />

      {/* Authentication Header */}
      <Header lang={lang} onLanguageToggle={toggleLanguage} />

      {/* Main Centered Login Card - Enlarged Card with Tight Gaps */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-1 sm:py-2">
        <div className="w-full max-w-[480px] my-auto">
          <LoginCard lang={lang} />
        </div>
      </main>

      {/* Ultra Simple Minimal Footer */}
      <Footer lang={lang} />
    </div>
  );
}
