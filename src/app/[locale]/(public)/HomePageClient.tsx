"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { LandingSectionsData, LandingSectionKey, SectionRolePermission, TargetAudienceView } from "@/types/cms";
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
  previewView?: TargetAudienceView;
  isPreview?: boolean;
}

export { isSectionAllowedForUser };

export function HomePageClient({ cmsSections, previewView, isPreview }: HomePageClientProps) {
  const [mounted, setMounted] = useState(false);
  const [sectionsData, setSectionsData] = useState<LandingSectionsData>(cmsSections);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep state in sync with server props
  useEffect(() => {
    setSectionsData(cmsSections);
  }, [cmsSections]);

  // Real-time synchronization for preview mode (BroadcastChannel & localStorage)
  useEffect(() => {
    if (isPreview && typeof window !== "undefined") {
      const syncFromLocal = () => {
        try {
          const cached = localStorage.getItem("coachspace_cms_preview_landing");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === "object") {
              setSectionsData((prev) => ({
                ...prev,
                ...parsed,
              }));
              return true;
            }
          }
        } catch (e) {
          console.warn("Failed reading landing preview cache:", e);
        }
        return false;
      };

      syncFromLocal();

      let bc: BroadcastChannel | null = null;
      try {
        if (typeof BroadcastChannel !== "undefined") {
          bc = new BroadcastChannel("coachspace_cms_preview");
          bc.onmessage = (event) => {
            if (event.data?.type === "PREVIEW_LANDING_UPDATE" && event.data?.sections) {
              setSectionsData((prev) => ({
                ...prev,
                ...event.data.sections,
              }));
            }
          };
        }
      } catch {}

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "coachspace_cms_preview_landing" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed) {
              setSectionsData((prev) => ({
                ...prev,
                ...parsed,
              }));
            }
          } catch {}
        }
      };

      const handleTabFocus = () => {
        syncFromLocal();
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("focus", handleTabFocus);
      window.addEventListener("visibilitychange", handleTabFocus);

      return () => {
        if (bc) bc.close();
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("focus", handleTabFocus);
        window.removeEventListener("visibilitychange", handleTabFocus);
      };
    }
  }, [isPreview]);

  const userRole = user?.role || null;

  // Resolve audience view: Respect previewView if in preview, otherwise infer from user role & auth
  const currentView: TargetAudienceView = previewView
    ? previewView
    : mounted &&
      isAuthenticated &&
      ((userRole || "").toLowerCase() === "instructor" ||
        (userRole || "").toLowerCase() === "coach")
    ? "instructor"
    : mounted && isAuthenticated
    ? "student"
    : "guest";

  const isInstructor = currentView === "instructor";

  // Resolve active sections data for current audience view with complete data isolation
  const activeSections: LandingSectionsData =
    sectionsData.views && sectionsData.views[currentView]
      ? sectionsData.views[currentView]!
      : sectionsData;

  const canShow = (sectionConfig?: {
    is_visible?: boolean;
    allowed_roles?: SectionRolePermission[];
    hidden_in_views?: TargetAudienceView[];
  }) => {
    return isSectionAllowedForUser(
      sectionConfig,
      userRole,
      previewView ? previewView !== "guest" : mounted && isAuthenticated,
      currentView
    );
  };

  // Safe unique section order respecting user customization and deletions
  const activeOrder: LandingSectionKey[] =
    activeSections.section_order && Array.isArray(activeSections.section_order)
      ? activeSections.section_order
      : DEFAULT_SECTION_ORDER;

  const renderSectionByKey = (key: LandingSectionKey) => {
    switch (key) {
      case "hero":
        return canShow(activeSections.hero) ? (
          <HeroSection
            key="hero"
            data={activeSections.hero}
            previewView={currentView}
            isPreview={isPreview}
          />
        ) : null;
      case "top_categories":
        return canShow(activeSections.top_categories) ? (
          <TopCategoriesSection key="top_categories" data={activeSections.top_categories} />
        ) : null;
      case "master_craft":
        return canShow(activeSections.master_craft) ? (
          <MasterYourCraftSection key="master_craft" data={activeSections.master_craft} />
        ) : null;
      case "why_stands_out":
        return canShow(activeSections.why_stands_out) ? (
          <WhyCoachSpaceStandsOutSection key="why_stands_out" data={activeSections.why_stands_out} />
        ) : null;
      case "real_stories":
        return canShow(activeSections.real_stories) ? (
          <RealStoriesSection key="real_stories" data={activeSections.real_stories} />
        ) : null;
      case "faq":
        return canShow(activeSections.faq) ? (
          isInstructor ? (
            <InstructorFaqSection key="faq" data={activeSections.faq} isPreview={isPreview} />
          ) : (
            <FaqSection key="faq" data={activeSections.faq} />
          )
        ) : null;
      case "join_future":
        return canShow(activeSections.join_future) ? (
          <JoinFutureSection
            key="join_future"
            data={activeSections.join_future}
            isPreview={isPreview}
          />
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
          <InstructorPendingWidget isPreview={isPreview} />
          <InstructorStudioWidget isPreview={isPreview} />
          <InstructorCoursesPreview isPreview={isPreview} />
          <InstructorAcademySection isPreview={isPreview} />
          {activeOrder
            .filter((key) => key !== "hero")
            .map((sectionKey) => renderSectionByKey(sectionKey))}
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
