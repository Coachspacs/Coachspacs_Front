"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { InstructorStatusBanner } from "@/components/home/InstructorStatusBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { TopCategoriesSection } from "@/components/home/TopCategoriesSection";
import { MasterYourCraftSection } from "@/components/home/MasterYourCraftSection";

// Dynamic imports for instructor-only widgets (not loaded for guests/students)
const InstructorPendingWidget = dynamic(
  () => import("@/components/home/InstructorPendingWidget").then((m) => m.InstructorPendingWidget),
  { ssr: false }
);
const InstructorStudioWidget = dynamic(
  () => import("@/components/home/InstructorStudioWidget").then((m) => m.InstructorStudioWidget),
  { ssr: false }
);
const InstructorCoursesPreview = dynamic(
  () => import("@/components/home/InstructorCoursesPreview").then((m) => m.InstructorCoursesPreview),
  { ssr: false }
);
const InstructorAcademySection = dynamic(
  () => import("@/components/home/InstructorAcademySection").then((m) => m.InstructorAcademySection),
  { ssr: false }
);
const InstructorFaqSection = dynamic(
  () => import("@/components/home/InstructorFaqSection").then((m) => m.InstructorFaqSection),
  { ssr: false }
);

// Dynamic imports for below-the-fold sections (loaded lazily on scroll)
const WhyCoachSpaceStandsOutSection = dynamic(
  () => import("@/components/home/WhyCoachSpaceStandsOutSection").then((m) => m.WhyCoachSpaceStandsOutSection),
  {
    loading: () => <div className="w-full min-h-[300px] bg-slate-50" />,
  }
);
const RealStoriesSection = dynamic(
  () => import("@/components/home/RealStoriesSection").then((m) => m.RealStoriesSection),
  {
    loading: () => <div className="w-full min-h-[300px] bg-white" />,
  }
);
const FaqSection = dynamic(
  () => import("@/components/home/FaqSection").then((m) => m.FaqSection),
  {
    loading: () => <div className="w-full min-h-[250px] bg-slate-50" />,
  }
);
const JoinFutureSection = dynamic(
  () => import("@/components/home/JoinFutureSection").then((m) => m.JoinFutureSection),
  {
    loading: () => <div className="w-full min-h-[200px] bg-[#0F5244]" />,
  }
);

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = mounted && isAuthenticated && ((user?.role || "").toLowerCase() === "instructor" || (user?.role || "").toLowerCase() === "coach");

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <InstructorStatusBanner />
      <HeroSection />

      {isInstructor ? (
        /* Instructor-Specific Teaching Hub Flow */
        <>
          <InstructorPendingWidget />
          <InstructorStudioWidget />
          <InstructorCoursesPreview />
          <InstructorAcademySection />
          <InstructorFaqSection />
        </>
      ) : (
        /* Student & Guest (Visitor) Flow */
        <>
          <TopCategoriesSection />
          <MasterYourCraftSection />
          <WhyCoachSpaceStandsOutSection />
          <RealStoriesSection />
          <FaqSection />
          <JoinFutureSection />
        </>
      )}
    </div>
  );
}
