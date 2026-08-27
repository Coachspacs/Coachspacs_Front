"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { InstructorStatusBanner } from "@/components/home/InstructorStatusBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { TopCategoriesSection } from "@/components/home/TopCategoriesSection";
import { InstructorPendingWidget } from "@/components/home/InstructorPendingWidget";
import { InstructorStudioWidget } from "@/components/home/InstructorStudioWidget";
import { InstructorAcademySection } from "@/components/home/InstructorAcademySection";
import { InstructorFaqSection } from "@/components/home/InstructorFaqSection";
import { WhyCoachSpaceStandsOutSection } from "@/components/home/WhyCoachSpaceStandsOutSection";
import { RealStoriesSection } from "@/components/home/RealStoriesSection";
import { FaqSection } from "@/components/home/FaqSection";
import { JoinFutureSection } from "@/components/home/JoinFutureSection";

import { MasterYourCraftSection } from "@/components/home/MasterYourCraftSection";
import { InstructorCoursesPreview } from "@/components/home/InstructorCoursesPreview";

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
        <>
          <InstructorPendingWidget />
          <InstructorStudioWidget />
          <InstructorCoursesPreview />
          <InstructorAcademySection />
          <InstructorFaqSection />
        </>
      ) : (
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
