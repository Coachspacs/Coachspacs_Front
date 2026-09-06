"use client";

import React from "react";
import { Star, Users, CreditCard, Sparkles, TrendingUp, BookOpen } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface InstructorOverviewTabProps {
  courses: any[];
}

export function InstructorOverviewTab({ courses }: InstructorOverviewTabProps) {
  const tInst = useTranslations("instructorSettings");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const totalStudents = courses.reduce(
    (acc, curr) => acc + Number(curr.studentsCount || 0),
    0
  );

  const totalRevenue = courses.reduce(
    (acc, curr) => acc + Number(curr.revenue || 0),
    0
  );

  const ratedCourses = courses.filter((c) => Number(c.reviewsCount || 0) > 0);
  const avgRating =
    ratedCourses.length > 0
      ? (
          ratedCourses.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) /
          ratedCourses.length
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {tInst("instructorOverviewTitle")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {isAr
            ? "نظرة عامة على نشاطك التعليمي وأداء دوراتك التدريبية"
            : "Overview of your teaching activities and course performance"}
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Students */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0F5244]/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {tInst("enrolledStudentsNav")}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalStudents.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-flex items-center gap-1 border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              <span>{isAr ? "نشط حالياً" : "Active learners"}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F5244] flex items-center justify-center shrink-0 border border-emerald-100/80">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Payout */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0F5244]/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {tInst("payoutAndBilling")}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mt-2 inline-flex items-center gap-1 border border-teal-100">
              <span>{isAr ? "إجمالي الأرباح" : "Total Revenue"}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Rating */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0F5244]/30 transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {tInst("ratingLabel")}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-1.5">
              <span>{avgRating}</span>
              <Star className="h-6 w-6 fill-amber-400 text-amber-400 shrink-0" />
            </div>
            <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-2 inline-flex items-center gap-1 border border-amber-100">
              <span>
                {ratedCourses.length} {isAr ? "دورة تم تقييمها" : "rated courses"}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/80">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorOverviewTab;
