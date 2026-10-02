"use client";

import React from "react";
import {
  InteractiveCurriculumMapProps,
  useCurriculumMap,
  CurriculumMapHeader,
  CurriculumMobileTimeline,
  CurriculumDesktopCanvas,
  MilestoneReorderModal,
} from "./map";

export type { InteractiveCurriculumMapProps } from "./map";

export function InteractiveCurriculumMap(props: InteractiveCurriculumMapProps) {
  const {
    isAr = false,
    locale = "en",
    onRegenerate,
  } = props;

  const {
    soundOn,
    toggleSound,
    isReorderModalOpen,
    setIsReorderModalOpen,
    milestonesState,
    enrolledCourseIds,
    totalCount,
    completedCount,
    progressPercent,
    currentActiveIndex,
    expandedMilestoneId,
    setExpandedMilestoneId,
    handleMoveMilestone,
    handleReorderGroup,
    handleToggleSkip,
    handleToggleCompleted,
    waypoints,
    svgRoadPath,
    getTrackName,
    dynamicMinHeight,
  } = useCurriculumMap(props);

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="space-y-6 relative z-10 text-start w-full max-w-6xl mx-auto pb-4"
    >
      {/* 1. PATH HEADER (RICH GRADIENT + PATTERN + FULL ACTION CONTROLS) */}
      <CurriculumMapHeader
        isAr={isAr}
        totalCount={totalCount}
        completedCount={completedCount}
        progressPercent={progressPercent}
        trackName={getTrackName()}
        soundOn={soundOn}
        toggleSound={toggleSound}
        onOpenReorderModal={() => setIsReorderModalOpen(true)}
        onRegenerate={onRegenerate}
      />

      {/* 2A. MOBILE ROADMAP TIMELINE */}
      <CurriculumMobileTimeline
        isAr={isAr}
        locale={locale}
        milestonesState={milestonesState}
        totalCount={totalCount}
        currentActiveIndex={currentActiveIndex}
        expandedMilestoneId={expandedMilestoneId}
        enrolledCourseIds={enrolledCourseIds}
        setExpandedMilestoneId={setExpandedMilestoneId}
        handleToggleCompleted={handleToggleCompleted}
        handleToggleSkip={handleToggleSkip}
        handleMoveMilestone={handleMoveMilestone}
      />

      {/* 2B. DESKTOP DYNAMIC ROADMAP CANVAS */}
      <CurriculumDesktopCanvas
        isAr={isAr}
        locale={locale}
        milestonesState={milestonesState}
        waypoints={waypoints}
        svgRoadPath={svgRoadPath}
        dynamicMinHeight={dynamicMinHeight}
        totalCount={totalCount}
        currentActiveIndex={currentActiveIndex}
        expandedMilestoneId={expandedMilestoneId}
        enrolledCourseIds={enrolledCourseIds}
        setExpandedMilestoneId={setExpandedMilestoneId}
        handleToggleCompleted={handleToggleCompleted}
        handleToggleSkip={handleToggleSkip}
        handleMoveMilestone={handleMoveMilestone}
      />

      {/* 3. REORDER STEPS INTERACTIVE MODAL DIALOG */}
      <MilestoneReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        milestonesState={milestonesState}
        currentActiveIndex={currentActiveIndex}
        totalCount={totalCount}
        isAr={isAr}
        soundOn={soundOn}
        handleMoveMilestone={handleMoveMilestone}
        handleReorderGroup={handleReorderGroup}
      />
    </div>
  );
}

export default InteractiveCurriculumMap;
