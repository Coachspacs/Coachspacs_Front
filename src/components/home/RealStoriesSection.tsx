"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export function RealStoriesSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const stories = [
    {
      id: "story-1",
      name: t("story1Name"),
      role: t("story1Role"),
      quote: t("story1Quote"),
      initials: "LH",
    },
    {
      id: "story-2",
      name: t("story2Name"),
      role: t("story2Role"),
      quote: t("story2Quote"),
      initials: "OK",
    },
    {
      id: "story-3",
      name: t("story3Name"),
      role: t("story3Role"),
      quote: t("story3Quote"),
      initials: "SA",
    },
    {
      id: "story-4",
      name: t("story4Name"),
      role: t("story4Role"),
      quote: t("story4Quote"),
      initials: "MA",
    },
    {
      id: "story-5",
      name: t("story5Name"),
      role: t("story5Role"),
      quote: t("story5Quote"),
      initials: "TM",
    },
    {
      id: "story-6",
      name: t("story6Name"),
      role: t("story6Role"),
      quote: t("story6Quote"),
      initials: "NS",
    },
  ];

  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, stories.length - itemsPerPage);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Visible stories logic
  const visibleStories = stories.slice(currentIndex, currentIndex + itemsPerPage);
  if (visibleStories.length < itemsPerPage) {
    visibleStories.push(...stories.slice(0, itemsPerPage - visibleStories.length));
  }

  const totalPages = Math.ceil(stories.length / itemsPerPage);
  const activePage = Math.floor(currentIndex / itemsPerPage);

  return (
    <section className="w-full bg-[#F0F3FF]/40 py-16 sm:py-20 border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t("storiesTitle")}
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
            {t("storiesSubtitle")}
          </p>
        </div>

        {/* Slider Container with Left & Right Side Flanking Arrows */}
        <div className="relative w-full px-2 sm:px-6 md:px-8">
          
          {/* Physical Left Side Arrow */}
          <button
            onClick={isRtl ? handleNext : handlePrev}
            aria-label={isRtl ? "التالي" : "Previous"}
            className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-[#004442]/20 text-[#004442] shadow-md hover:bg-[#004442] hover:text-white transition-all flex items-center justify-center cursor-pointer group active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
          </button>

          {/* Stories Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full transition-all duration-500 ease-in-out">
            {visibleStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-3xl p-7 border border-[#004442]/15 shadow-md shadow-[#004442]/5 hover:shadow-lg hover:border-[#004442]/30 transition-all duration-300 flex flex-col justify-between min-h-[270px]"
              >
                {/* Top Row: Quote Icon & 5 Stars */}
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    {/* Quote Icon */}
                    <span className="text-[#004442] font-serif text-4xl leading-none font-bold select-none opacity-90">
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
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                  {/* Avatar Badge with Brand Ring */}
                  <div className="w-11 h-11 rounded-full bg-[#e2f3f0] text-[#004442] font-bold text-sm flex items-center justify-center shrink-0 ring-2 ring-[#004442]/20 shadow-2xs">
                    {story.initials}
                  </div>

                  {/* Details */}
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      {story.name}
                    </h3>
                    <p className="text-xs font-bold text-[#0d7a66]">
                      {story.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Physical Right Side Arrow */}
          <button
            onClick={isRtl ? handlePrev : handleNext}
            aria-label={isRtl ? "السابق" : "Next"}
            className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-[#004442]/20 text-[#004442] shadow-md hover:bg-[#004442] hover:text-white transition-all flex items-center justify-center cursor-pointer group active:scale-95"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * itemsPerPage)}
              aria-label={`Go to slide page ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activePage === idx
                  ? "w-8 bg-[#004442]"
                  : "w-2.5 bg-[#004442]/20 hover:bg-[#004442]/40"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
