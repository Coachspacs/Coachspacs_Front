"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CourseCard } from "./CourseCard";
import { Course } from "@/types/catalog";
import { SlidersHorizontal } from "lucide-react";

interface CourseGridProps {
  courses: Course[];
  onResetFilters?: () => void;
  isAr?: boolean;
}

export function CourseGrid({ courses, onResetFilters, isAr = false }: CourseGridProps) {
  const t = useTranslations("catalog.emptyState");

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-4 w-full text-center animate-in fade-in duration-300">
        
        {/* Soft Card Container containing Illustration Graphic */}
        <div className="w-full max-w-xs sm:max-w-sm rounded-3xl bg-[#F4F8F7] border border-[#E1EEEA] p-6 sm:p-8 flex flex-col items-center justify-center text-center mb-6 shadow-2xs">
          <div className="w-48 sm:w-56 h-auto flex items-center justify-center mix-blend-multiply overflow-hidden rounded-xl">
            <img
              src="/images/no-courses-illustration.jpg"
              alt={t("headline")}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Main Headline */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {t("headline")}
        </h2>

        {/* Sub-description */}
        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md sm:max-w-lg mx-auto leading-relaxed mb-6">
          {t("subdescription")}
        </p>

        {/* Action Button */}
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t("resetButton")}</span>
          </button>
        )}

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} isAr={isAr} />
      ))}
    </div>
  );
}
