"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { LandingSectionsData, LandingSectionKey, SectionRolePermission } from "@/types/cms";
import { DEFAULT_SECTION_ORDER } from "@/lib/cmsDefaults";
import { isSectionAllowedForUser } from "@/lib/cmsPermissions";
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

interface HomePageClientProps {
  cmsSections: LandingSectionsData;
}

export { isSectionAllowedForUser };

export function HomePageClient({ cmsSections }: HomePageClientProps) {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = user?.role || null;
  const isInstructor =
    mounted &&
    isAuthenticated &&
    ((userRole || "").toLowerCase() === "instructor" ||
      (userRole || "").toLowerCase() === "coach");

  const canShow = (sectionConfig?: { is_visible?: boolean; allowed_roles?: SectionRolePermission[] }) => {
    return isSectionAllowedForUser(sectionConfig, userRole, mounted && isAuthenticated);
  };

  // Safe unique section order with fallback to DEFAULT_SECTION_ORDER
  const activeOrder: LandingSectionKey[] = Array.from(
    new Set([
      ...(cmsSections.section_order && cmsSections.section_order.length > 0
        ? cmsSections.section_order
        : DEFAULT_SECTION_ORDER),
      ...DEFAULT_SECTION_ORDER,
    ])
  );

  const renderSectionByKey = (key: LandingSectionKey) => {
    switch (key) {
      case "hero":
        return canShow(cmsSections.hero) ? <HeroSection key="hero" data={cmsSections.hero} /> : null;
      case "top_categories":
        return canShow(cmsSections.top_categories) ? (
          <TopCategoriesSection key="top_categories" data={cmsSections.top_categories} />
        ) : null;
      case "master_craft":
        return canShow(cmsSections.master_craft) ? (
          <MasterYourCraftSection key="master_craft" data={cmsSections.master_craft} />
        ) : null;
      case "why_stands_out":
        return canShow(cmsSections.why_stands_out) ? (
          <WhyCoachSpaceStandsOutSection key="why_stands_out" data={cmsSections.why_stands_out} />
        ) : null;
      case "real_stories":
        return canShow(cmsSections.real_stories) ? (
          <RealStoriesSection key="real_stories" data={cmsSections.real_stories} />
        ) : null;
      case "faq":
        return canShow(cmsSections.faq) ? <FaqSection key="faq" data={cmsSections.faq} /> : null;
      case "join_future":
        return canShow(cmsSections.join_future) ? (
          <JoinFutureSection key="join_future" data={cmsSections.join_future} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <InstructorStatusBanner />

      {/* Instructor Specific Dashboard View */}
      {isInstructor && (
        <>
          {renderSectionByKey("hero")}
          <InstructorPendingWidget />
          <InstructorStudioWidget />
          <InstructorCoursesPreview />
          <InstructorAcademySection />
          <InstructorFaqSection />
        </>
      )}

      {/* Public / Student Landing Page with Dynamic Section Order */}
      {!isInstructor && (
        <>
          {activeOrder.map((sectionKey) => renderSectionByKey(sectionKey))}
        </>
      )}
    </div>
  );
}

export default HomePageClient;
