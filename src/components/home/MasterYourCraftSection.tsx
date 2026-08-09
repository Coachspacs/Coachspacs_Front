"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

export function MasterYourCraftSection() {
  const t = useTranslations("home");

  const courses = [
    {
      id: "react-archi",
      image: "/images/courses/course-react.png",
      badges: [
        { text: t("bestseller"), type: "white" },
        { text: t("bilingual"), type: "teal" },
      ],
      rating: "4.9",
      title: t("course1Title"),
      instructorName: t("course1Instructor"),
      instructorAvatar: "/images/instructors/sarah.png",
      price: "$89.00",
    },
    {
      id: "strategic-leadership",
      image: "/images/courses/course-leadership.png",
      badges: [{ text: t("newBadge"), type: "white" }],
      rating: "4.8",
      title: t("course2Title"),
      instructorName: t("course2Instructor"),
      instructorAvatar: "/images/instructors/ahmed.png",
      price: "$120.00",
    },
    {
      id: "advanced-uiux",
      image: "/images/courses/course-uiux.png",
      badges: [{ text: t("popular"), type: "white" }],
      rating: "5.0",
      title: t("course3Title"),
      instructorName: t("course3Instructor"),
      instructorAvatar: "/images/instructors/lila.png",
      price: "$75.00",
    },
  ];

  return (
    <section className="w-full bg-[#F0F3FF] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t("masterYourCraftTitle")}
          </h2>
          <p className="mt-3 text-slate-500 text-sm sm:text-base font-medium">
            {t("masterYourCraftSubtitle")}
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group w-full"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-3.5 rtl:right-3.5 ltr:left-3.5 flex items-center gap-2 z-10">
                  {course.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`text-xs font-semibold px-3 py-1 rounded-full shadow-xs ${
                        badge.type === "teal"
                          ? "bg-[#0d7a66] text-white"
                          : "bg-white text-[#0d7a66]"
                      }`}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      ({course.rating})
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#004442] transition-colors">
                    {course.title}
                  </h3>

                  {/* Instructor Info */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {course.instructorName}
                    </span>
                  </div>
                </div>

                {/* Price & Add to Cart Button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                  <span className="text-xl font-black text-slate-900">
                    {course.price}
                  </span>
                  
                  <button
                    className="bg-[#004442] hover:bg-[#003331] active:scale-95 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all duration-200 shadow-xs"
                  >
                    {t("addToCart")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
