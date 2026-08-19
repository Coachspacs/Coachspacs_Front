"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  Search,
  ArrowRight,
  BadgeCheck,
  Users,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react";

export function HeroSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/${locale}/courses`);
    }
  };

  const displayName = user?.name || user?.fullName || user?.email?.split("@")[0] || "";

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 pt-12 md:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left rtl:text-right z-10">
            
            {/* Logged in Welcome Pill / Badge */}
            {mounted && isAuthenticated ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F5244] text-white shadow-md mb-6 text-xs sm:text-sm font-bold animate-in fade-in duration-300">
                <Sparkles className="w-4 h-4 text-[#6CF8BB] shrink-0" />
                <span>
                  {locale === "ar"
                    ? `مرحباً بك مجدداً، ${displayName}!`
                    : `Welcome back, ${displayName}!`}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6CF8BB]/20 text-[#0F5244] border border-[#6CF8BB]/40 shadow-xs mb-6 text-xs font-bold tracking-wider uppercase">
                <BadgeCheck className="w-4 h-4 text-[#0F5244] shrink-0" />
                <span>{t("heroBadge")}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.35] mb-6">
              {t("heroTitle")}{" "}
              <span className="text-[#0F5244] block mt-2 sm:mt-3">
                {t("heroTitleHighlight")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mb-8 font-medium">
              {t("heroSubtitle")}
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="relative flex items-center w-full bg-white rounded-full p-1.5 pl-5 rtl:pl-1.5 rtl:pr-5 border border-slate-200 shadow-md hover:border-slate-300 focus-within:border-[#0F5244] focus-within:ring-2 focus-within:ring-[#0F5244]/20 transition-all max-w-lg mb-8"
            >
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3 rtl:mr-0 rtl:ml-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#0F5244] hover:bg-[#0c4337] text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all shadow-md shrink-0 active:scale-95"
              >
                {t("searchBtn")}
              </button>
            </form>

            {/* CTA */}
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-3 bg-[#0F5244] hover:bg-[#0c4337] text-white font-bold text-base px-8 py-3.5 rounded-full shadow-lg shadow-[#0F5244]/20 hover:shadow-xl hover:shadow-[#0F5244]/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group"
            >
              <span>{t("exploreCourses")}</span>
              <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>

          </div>

          {/* Hero Image */}
          <div className="hidden lg:flex lg:col-span-6 relative justify-center lg:justify-end rtl:lg:justify-start items-center mt-10 lg:mt-0">
            
            {/* Glow */}
            <div className="absolute -top-[31px] ltr:right-0 rtl:-left-8 w-[600px] h-[600px] rounded-[9999px] bg-[#6CF8BB]/20 blur-[80px] pointer-events-none z-0" />

            {/* Image Wrapper */}
            <div className="relative z-10 w-full max-w-[440px] sm:max-w-[480px] rtl:lg:-translate-x-8 transition-transform duration-300">
              
              <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-white">
                <Image
                  src="/images/hero-coach.png"
                  alt="Coach Space"
                  width={480}
                  height={480}
                  priority
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Card 1 */}
              <div className="absolute -top-5 ltr:-left-6 rtl:-right-6 sm:-top-7 sm:ltr:-left-8 sm:rtl:-right-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/70 border border-slate-100 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.03] z-20 select-none">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#6CF8BB]/25 text-[#0F5244] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {t("activeStudentsCount")}
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    {t("activeStudentsLabel")}
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="absolute top-1/2 ltr:-right-6 rtl:-left-6 sm:ltr:-right-8 sm:rtl:-left-8 -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/70 border border-slate-100 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.03] z-20 select-none">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#6CF8BB]/25 text-[#0F5244] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {t("expertCoursesCount")}
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    {t("expertCoursesLabel")}
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="absolute -bottom-5 ltr:left-6 rtl:right-6 sm:-bottom-7 sm:ltr:left-10 sm:rtl:right-10 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/70 border border-slate-100 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.03] z-20 select-none">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#6CF8BB]/25 text-[#0F5244] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {t("certificatesCount")}
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    {t("certificatesLabel")}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
