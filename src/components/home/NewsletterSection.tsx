"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, CheckCircle2, Send } from "lucide-react";

export function NewsletterSection() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-[#004442] via-[#085a57] to-[#0D6E6A] rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-[#004442]/15 overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 bg-[#6CF8BB]/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 w-64 h-64 bg-[#6CF8BB]/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            
            {/* Mail Badge */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-[#6CF8BB] shadow-inner mb-1">
              <Mail className="w-7 h-7 stroke-[2]" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {t("newsletterTitle")}
              </h2>
              <p className="text-emerald-100/90 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
                {t("newsletterSubtitle")}
              </p>
            </div>

            {/* Subscription Form */}
            {submitted ? (
              <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm sm:text-base font-bold animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-[#6CF8BB]" />
                <span>{t("newsletterSuccess")}</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto w-full pt-2"
              >
                <div className="relative w-full">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletterPlaceholder")}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-emerald-100/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#6CF8BB] focus:bg-white/15 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#6CF8BB] hover:bg-[#5be2a7] text-[#004442] font-bold text-sm sm:text-base transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>{t("newsletterBtn")}</span>
                  <Send className="w-4 h-4 rtl:rotate-180" />
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
