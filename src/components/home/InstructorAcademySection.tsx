"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Mic, CheckSquare, Target, TrendingUp, Flame, Lightbulb } from "lucide-react";

export function InstructorAcademySection() {
  const t = useTranslations("home");
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach");

  if (!isInstructor) {
    return null;
  }

  const tips = [
    {
      icon: <Mic className="w-5 h-5 text-[#0F5244]" />,
      bg: "bg-emerald-50 border-emerald-200/70 text-[#0F5244]",
      pill: "Audio & Quality",
      title: t("tip1Title"),
      desc: t("tip1Desc"),
    },
    {
      icon: <CheckSquare className="w-5 h-5 text-teal-700" />,
      bg: "bg-teal-50 border-teal-200/70 text-teal-700",
      pill: "Engagement",
      title: t("tip2Title"),
      desc: t("tip2Desc"),
    },
    {
      icon: <Target className="w-5 h-5 text-amber-700" />,
      bg: "bg-amber-50 border-amber-200/70 text-amber-700",
      pill: "Curriculum",
      title: t("tip3Title"),
      desc: t("tip3Desc"),
    },
  ];

  const trendingTopics = [
    { name: t("topicReact"), growth: "+92%", tag: "Development" },
    { name: t("topicAi"), growth: "+140%", tag: "AI & Tech" },
    { name: t("topicUiUx"), growth: "+68%", tag: "Design" },
    { name: t("topicLeadership"), growth: "+45%", tag: "Business" },
  ];

  return (
    <section className="w-full bg-white py-14 sm:py-18 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0F5244] text-xs font-bold tracking-wider uppercase mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-[#0F5244]" />
            <span>{t("instructorAcademyTitle")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
            {t("instructorAcademyTitle")}
          </h2>
          <p className="mt-2.5 text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            {t("instructorAcademySubtitle")}
          </p>
        </div>

        {/* 3 Tips Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-14">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-[#FAFCFB] hover:bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-105 ${tip.bg}`}>
                    {tip.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {tip.pill}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-[#0F5244] transition-colors">
                  {tip.title}
                </h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trending & High Demand Topics Banner (1 Shade Darker & Richer Sage-Mint Gradient) */}
        <div className="bg-gradient-to-b from-[#E5F1EC] to-[#DAECE5] rounded-3xl p-7 sm:p-10 border border-emerald-300/80 shadow-md shadow-emerald-900/5 relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#0F5244] border border-emerald-300/80 text-xs font-bold tracking-wider uppercase mb-2.5 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("trendingTopicsTitle")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t("trendingTopicsTitle")}
              </h3>
              <p className="text-slate-700 text-xs sm:text-sm font-medium mt-1 max-w-xl">
                {t("trendingTopicsSubtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-white bg-[#0F5244] px-4 py-2.5 rounded-xl self-start lg:self-auto shadow-md shadow-[#0F5244]/15">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>{t("studentsDemandLabel")}</span>
            </div>
          </div>

          {/* 4 Floating Luxury Topic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {trendingTopics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-white hover:bg-white rounded-2xl p-5 border border-emerald-200/80 hover:border-[#0F5244] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 group-hover:text-emerald-700 transition-colors">
                    {topic.tag}
                  </div>
                  <div className="text-sm font-black text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-[#0F5244] transition-colors">
                    {topic.name}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-semibold">{t("studentsDemandLabel")}</span>
                  <span className="inline-flex items-center font-black text-[#0F5244] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 text-xs shadow-2xs">
                    {topic.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
