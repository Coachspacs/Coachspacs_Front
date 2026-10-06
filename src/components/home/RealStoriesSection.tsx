import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { RealStoriesSectionData } from "@/types/cms";

interface RealStoriesSectionProps {
  data?: RealStoriesSectionData;
}

export function RealStoriesSection({ data }: RealStoriesSectionProps = {}) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const titleText =
    (isRtl ? (data?.title_ar || data?.title_en) : (data?.title_en || data?.title_ar)) ||
    t("storiesTitle");
  const subtitleText =
    (isRtl ? (data?.subtitle_ar || data?.subtitle_en) : (data?.subtitle_en || data?.subtitle_ar)) ||
    t("storiesSubtitle");

  const defaultStories = [
    {
      id: "story-1",
      name: t("story1Name"),
      role: t("story1Role"),
      quote: t("story1Quote"),
      initials: t("story1Initials"),
    },
    {
      id: "story-2",
      name: t("story2Name"),
      role: t("story2Role"),
      quote: t("story2Quote"),
      initials: t("story2Initials"),
    },
    {
      id: "story-3",
      name: t("story3Name"),
      role: t("story3Role"),
      quote: t("story3Quote"),
      initials: t("story3Initials"),
    },
    {
      id: "story-4",
      name: t("story4Name"),
      role: t("story4Role"),
      quote: t("story4Quote"),
      initials: t("story4Initials"),
    },
    {
      id: "story-5",
      name: t("story5Name"),
      role: t("story5Role"),
      quote: t("story5Quote"),
      initials: t("story5Initials"),
    },
    {
      id: "story-6",
      name: t("story6Name"),
      role: t("story6Role"),
      quote: t("story6Quote"),
      initials: t("story6Initials"),
    },
  ];

  const stories =
    data?.testimonials && data.testimonials.length > 0
      ? data.testimonials.map((item, idx) => ({
          id: item.id || `story-${idx + 1}`,
          name: isRtl ? item.name_ar : item.name_en,
          role: isRtl ? item.role_ar : item.role_en,
          quote: isRtl ? item.quote_ar : item.quote_en,
          initials: (isRtl ? item.name_ar : item.name_en).slice(0, 2).toUpperCase(),
        }))
      : defaultStories;

  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch Swipe State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (window.innerWidth < 640) {
          setItemsPerPage(1);
        } else if (window.innerWidth < 1024) {
          setItemsPerPage(2);
        } else if (window.innerWidth < 1280) {
          setItemsPerPage(3);
        } else {
          // On wide desktop, display 4 cards if 4 or more stories exist, or 3 cards
          setItemsPerPage(stories.length >= 4 ? 4 : 3);
        }
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [stories.length]);

  const effectiveItemsPerPage = Math.min(itemsPerPage, Math.max(1, stories.length));
  const maxIndex = Math.max(0, stories.length - effectiveItemsPerPage);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 40;
    const isSwipeRight = distance < -40;

    if (isRtl) {
      if (isSwipeLeft) handlePrev();
      if (isSwipeRight) handleNext();
    } else {
      if (isSwipeLeft) handleNext();
      if (isSwipeRight) handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const totalPages = Math.max(1, Math.ceil(stories.length / effectiveItemsPerPage));
  const activePage = Math.min(totalPages - 1, Math.floor(currentIndex / effectiveItemsPerPage));
  const translateOffset = (currentIndex * 100) / effectiveItemsPerPage;

  return (
    <section className="w-full bg-[#F0F3FF]/40 py-16 sm:py-24 border-t border-slate-100 overflow-hidden font-sans relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-dark/10 border border-brand-dark/20 text-brand-dark text-xs font-bold tracking-wider uppercase mb-3">
            <span>{t("storiesBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {titleText}
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
            {subtitleText}
          </p>
        </motion.div>

        {/* Carousel Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full px-2 sm:px-6 md:px-10"
        >
          
          {/* Left Arrow Button (Sleek Glassmorphic Style) */}
          {maxIndex > 0 && (
            <button
              type="button"
              onClick={isRtl ? handleNext : handlePrev}
              aria-label={isRtl ? t("nextSlide") : t("prevSlide")}
              className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 backdrop-blur-md border border-brand-dark/25 text-brand-dark shadow-lg shadow-brand-dark/10 hover:bg-brand-dark hover:text-white hover:border-brand-dark hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer group active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2] group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Touch Swipeable Overflow Window */}
          <div
            className="w-full overflow-hidden py-3"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sliding Track with Bezier Smooth Animation */}
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                transform: isRtl
                  ? `translateX(${translateOffset}%)`
                  : `translateX(-${translateOffset}%)`,
              }}
            >
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="shrink-0 px-3 transition-opacity duration-500"
                  style={{ width: `${100 / effectiveItemsPerPage}%` }}
                >
                  <div className="group bg-white rounded-3xl p-7 border border-[#004442]/15 shadow-md shadow-[#004442]/5 hover:shadow-xl hover:border-[#004442]/35 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full min-h-[270px]">
                    {/* Top Row: Quote Icon & 5 Stars */}
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        {/* Quote Icon */}
                        <span className="text-[#004442] font-serif text-4xl leading-none font-bold select-none opacity-85 group-hover:scale-110 transition-transform">
                          ““
                        </span>

                        {/* 5 Stars */}
                        <div className="flex items-center gap-1 text-[#004442]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-[#004442] text-[#004442]"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Middle: Quote Text */}
                      <p className="text-slate-700 text-sm sm:text-base font-medium italic leading-relaxed mb-6">
                        {story.quote}
                      </p>
                    </div>

                    {/* Bottom Row: Avatar Circle, Name & Subtitle */}
                    <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100 mt-auto">
                      {/* Avatar Badge with Brand Ring */}
                      <div className="w-11 h-11 rounded-full bg-[#e2f3f0] text-[#004442] font-bold text-sm flex items-center justify-center shrink-0 ring-2 ring-[#004442]/20 shadow-2xs group-hover:ring-[#004442]/40 transition-all">
                        {story.initials}
                      </div>

                      {/* Details */}
                      <div className="space-y-0.5">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug group-hover:text-[#004442] transition-colors">
                          {story.name}
                        </h3>
                        <p className="text-xs font-bold text-[#0d7a66]">
                          {story.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Button (Sleek Glassmorphic Style) */}
          {maxIndex > 0 && (
            <button
              type="button"
              onClick={isRtl ? handlePrev : handleNext}
              aria-label={isRtl ? t("prevSlide") : t("nextSlide")}
              className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 backdrop-blur-md border border-brand-dark/25 text-brand-dark shadow-lg shadow-brand-dark/10 hover:bg-brand-dark hover:text-white hover:border-brand-dark hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer group active:scale-95"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </motion.div>

        {/* Enhanced Pagination Controls Bar */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <span className="text-xs font-extrabold text-brand-dark/70 tracking-wider">
              {activePage + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(Math.min(idx * effectiveItemsPerPage, maxIndex))}
                  aria-label={isRtl ? `الانتقال إلى شريحة ${idx + 1}` : `Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                    activePage === idx
                      ? "w-10 bg-brand-dark shadow-xs shadow-brand-dark/30"
                      : "w-3 bg-brand-dark/20 hover:bg-brand-dark/40 hover:w-5"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
