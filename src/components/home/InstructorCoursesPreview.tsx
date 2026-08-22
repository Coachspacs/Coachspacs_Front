"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { BookOpen, Users, Star, PlusCircle, Edit3 } from "lucide-react";

export function InstructorCoursesPreview() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach");
  const isApproved = (user?.approval_status || (user as any)?.approvalStatus || "").toLowerCase() === "approved";

  // Only show when instructor account is verified and approved
  if (!isInstructor || !isApproved) {
    return null;
  }

  // Instructor courses sample
  const instructorCourses = [
    {
      id: "react-archi",
      title: "React Enterprise Architecture & Performance Optimization",
      image: "/images/courses/course-react.png",
      studentsCount: 840,
      rating: "4.9",
      status: "Published",
      isDraft: false,
      revenue: "$74,760",
    },
    {
      id: "strategic-leadership",
      title: "Strategic Leadership & Tech Team Management",
      image: "/images/courses/course-leadership.png",
      studentsCount: 580,
      rating: "4.8",
      status: "Published",
      isDraft: false,
      revenue: "$69,600",
    },
    {
      id: "ai-agents-mastery",
      title: "Building Autonomous AI Agents with Next.js & Python",
      image: "/images/courses/course-uiux.png",
      studentsCount: 0,
      rating: "5.0",
      status: "Draft",
      isDraft: true,
      revenue: "$0",
    },
  ];

  const filteredCourses = instructorCourses.filter((course) => {
    if (activeTab === "published") return !course.isDraft;
    if (activeTab === "drafts") return course.isDraft;
    return true;
  });

  return (
    <section className="w-full bg-[#FAFCFB] py-14 sm:py-18 font-sans border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0F5244] text-xs font-bold tracking-wider uppercase mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0F5244]" />
              <span>{t("myCoursesSectionTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t("myCoursesSectionTitle")}
            </h2>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm font-medium">
              {t("myCoursesSectionSubtitle")}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("allCoursesTab")} (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("published")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "published"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("publishedTab")} (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("drafts")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "drafts"
                  ? "bg-[#0F5244] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("draftsTab")} (1)
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 rtl:right-2.5 ltr:left-2.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {course.status}
                  </div>
                </div>

                {/* Rating & Title */}
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{course.rating}</span>
                  {!course.isDraft && (
                    <span className="text-slate-400 font-normal text-[11px]">• 180+ reviews</span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0F5244] transition-colors mb-3">
                  {course.title}
                </h3>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{course.studentsCount} {t("totalStudentsCount")}</span>
                </div>

                <Link
                  href={`/${locale}/instructor/dashboard`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[#0F5244] bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t("openCourseStudio")}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
