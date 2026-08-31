"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { Star } from "lucide-react";
import { normalizeInstructorSlug } from "@/lib/mockInstructors";
import { courseService } from "@/services/courseService";
import { addToCart } from "@/features/cart/cartSlice";

export function MasterYourCraftSection() {
  const t = useTranslations("home");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const dispatch = useDispatch();

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
    let isSubscribed = true;

    async function load() {
      try {
        const data = await courseService.getCourses({ page_size: 50 }, locale);
        if (!isSubscribed) return;
        const results = Array.isArray(data) ? data : data?.results || [];
        if (results.length > 0) {
          const mapped = results.slice(0, 3).map((c: any) => {
            const instName = typeof c.instructor === "object" ? (c.instructor?.full_name || c.instructor?.name || "") : (typeof c.instructor === "string" ? c.instructor : "");
            const priceNum = Number(c.price) || 0;
            return {
              id: String(c.id),
              title: isAr ? (c.title_ar || c.title || "دورة تدريبية") : (c.title || c.title_en || "Course"),
              instructorName: instName,
              instructorAvatar: (typeof c.instructor === "object" ? c.instructor?.avatar : undefined) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
              price: priceNum === 0 ? t("free") : `$${priceNum.toFixed(2)}`,
              priceRaw: priceNum,
              rating: Number(c.rating || 0),
              reviewsCount: Number(c.reviews_count || c.reviewsCount || 0),
              image: c.cover_image || c.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
              badges: [
                { text: t("bestseller"), type: "white" },
                { text: c.language === "ar" ? t("arabic") : t("english"), type: "teal" },
              ],
            };
          });
          setCourses(mapped);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.warn("Failed to load featured courses for home:", err);
        if (isSubscribed) setCourses([]);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    load();

    return () => {
      isSubscribed = false;
    };
  }, [locale, isAr, t]);

  return (
    <section suppressHydrationWarning className="w-full bg-[#F0F3FF] py-12 sm:py-16 font-sans">
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[...Array(3)].map((_, i) => (
              <div
                key={`skel-${i}`}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col w-full animate-pulse"
              >
                <div className="w-full aspect-[16/10] bg-slate-200" />
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-slate-200 rounded-md" />
                    <div className="h-6 w-full bg-slate-200 rounded-md" />
                    <div className="h-4 w-32 bg-slate-200 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                    <div className="h-6 w-16 bg-slate-200 rounded-md" />
                    <div className="h-9 w-24 bg-slate-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 space-y-4 max-w-md mx-auto shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">
              {t("exploreAvailableCourses")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("exploreAvailableCoursesSubtitle")}
            </p>
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>{t("browseAllCourses")}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {courses.map((course: any) => {
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group w-full"
                >
                  {/* Image Container */}
                  <Link href={`/${locale}/courses/${course.id}`} className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 block">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-3.5 rtl:right-3.5 ltr:left-3.5 flex items-center gap-2 z-10">
                      {course.badges.map((badge: any, bIdx: number) => (
                        <span
                          key={bIdx}
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
                  </Link>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-3">
                      {/* Rating */}
                      {Number(course.reviewsCount || 0) > 0 && Number(course.rating || 0) > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center text-amber-400 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            ({course.rating.toFixed(1)})
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <Link href={`/${locale}/courses/${course.id}`} className="block">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#004442] transition-colors">
                          {course.title}
                        </h3>
                      </Link>

                      {/* Instructor Info */}
                      {course.instructorName && (
                        <Link
                          href={`/${locale}/instructors/${normalizeInstructorSlug(course.instructorName)}`}
                          className="flex items-center gap-2.5 pt-1 w-fit group/inst cursor-pointer"
                          title={course.instructorName}
                        >
                          <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200 group-hover/inst:ring-2 group-hover/inst:ring-[#004442] transition-all">
                            <Image
                              src={course.instructorAvatar}
                              alt={course.instructorName}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 group-hover/inst:text-[#004442] group-hover/inst:underline transition-colors">
                            {course.instructorName}
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Price & Add to Cart Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                      <span className="text-xl font-black text-slate-900">
                        {course.price}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(addToCart({
                            id: course.id,
                            title: course.title,
                            instructor: course.instructorName,
                            price: course.priceRaw,
                            image: course.image,
                          } as any));
                        }}
                        className="bg-[#004442] hover:bg-[#003331] active:scale-95 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all duration-200 shadow-xs cursor-pointer"
                      >
                        {t("addToCart")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
