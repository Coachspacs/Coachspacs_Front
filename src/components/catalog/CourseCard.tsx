"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Star, Clock, User } from "lucide-react";
import { Course } from "@/types/catalog";

interface CourseCardProps {
  course: Course;
  isAr?: boolean;
}

export function CourseCard({ course, isAr = false }: CourseCardProps) {
  const locale = useLocale() || "en";
  const t = useTranslations("catalog.card");

  const [imgSrc, setImgSrc] = useState(
    course.coverImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
  );

  const getBadgeStyle = (badge?: string) => {
    if (badge === "Bestseller") return "bg-[#45D1B4] text-slate-900 font-black";
    if (badge === "New") return "bg-[#38BDF8] text-slate-900 font-black";
    return "bg-emerald-500 text-white font-black";
  };

  const getBadgeText = (badge?: string) => {
    if (badge === "Bestseller") return t("bestseller");
    if (badge === "New") return t("new");
    if (badge === "Popular") return t("popular");
    return badge;
  };

  const coursePath = `/${locale}/courses/${course.id}`;

  return (
    <Link href={coursePath} className="block group h-full">
      <div className="flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-[#0F5244]/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
        
        {/* Top Image Banner Container */}
        <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
          <img
            src={imgSrc}
            alt={isAr ? course.titleAr : course.title}
            onError={() => {
              setImgSrc("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80");
            }}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top-Left Badge */}
          {course.badge && (
            <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
              <span className={`inline-block px-2.5 py-1 text-[11px] rounded-md uppercase tracking-wider shadow-2xs ${getBadgeStyle(course.badge)}`}>
                {getBadgeText(course.badge)}
              </span>
            </div>
          )}
        </div>

        {/* Card Body Content */}
        <div className="flex flex-col flex-1 p-5 justify-between space-y-4">
          <div className="space-y-2">
            {/* Category Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0F5244] bg-[#E8F3F1] px-2.5 py-0.5 rounded-md">
                {isAr ? course.categoryAr : course.category}
              </span>
            </div>

            {/* Course Title */}
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0F5244] transition-colors line-clamp-2 leading-snug tracking-tight">
              {isAr ? course.titleAr : course.title}
            </h3>

            {/* Instructor Name with Icon */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pt-0.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{isAr ? course.instructorNameAr : course.instructorName}</span>
            </div>
          </div>

          {/* Rating & Details Footer */}
          <div className="space-y-3 pt-2">
            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-extrabold text-slate-900">{course.rating.toFixed(1)}</span>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(course.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-amber-100 text-amber-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-400 font-medium">({course.reviewsCountFormatted})</span>
            </div>

            {/* Price & Duration Line */}
            <div className="flex items-baseline justify-between pt-3 border-t border-slate-100">
              <span className="text-lg font-black text-slate-900">
                {course.priceFormatted === "Free" || course.priceFormatted === "مجاني" ? (
                  <span className="text-emerald-600 font-extrabold">{t("free")}</span>
                ) : (
                  course.priceFormatted
                )}
              </span>

              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{isAr ? `${course.durationHours} ${t("hours")}` : course.durationFormatted}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
}
