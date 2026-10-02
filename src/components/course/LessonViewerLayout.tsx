"use client";

import React, { useMemo } from "react";
import { Footer } from "@/components/layout/Footer";
import {
  LessonViewerLayoutProps,
  useLessonPlayer,
  LessonViewerHeader,
  LessonVideoPlayer,
  LessonContentTabs,
  LessonCurriculumSidebar,
  KeyboardShortcutsModal,
  CourseCelebrationModal,
} from "./player";
import { LessonSummaryCard } from "./LessonSummaryCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export { type LessonItem, type SectionItem, type InstructorItem, type LessonViewerLayoutProps } from "./player/types";

export function LessonViewerLayout(props: LessonViewerLayoutProps) {
  const {
    courseTitle,
    courseSlug = "",
    courseCover,
    courseDescription,
    whatYouWillLearn = [],
    instructor,
    allLessons,
    activeLessonIndex,
    completedLessonIds,
    onSelectLesson,
    onToggleComplete,
    onNextLesson,
    onPrevLesson,
    onFinishCourse,
    courseMaterials,
    locale = "en",
    backHref = "/student/courses",
  } = props;

  const {
    router,
    pathname,
    dispatch,
    t,
    tNav,
    tHeader,
    isAr,
    user,
    isAuthenticated,
    isAdmin,
    cartItems,
    sidebarOpen,
    theaterMode,
    setTheaterMode,
    searchQuery,
    setSearchQuery,
    openSections,
    setOpenSections,
    toastMessage,
    userDropdownOpen,
    setUserDropdownOpen,
    showShortcutsModal,
    setShowShortcutsModal,
    showCelebrationModal,
    setShowCelebrationModal,
    setHasDismissedCelebration,
    playerContainerRef,
    videoRef,
    dropdownRef,
    settingsMenuRef,
    progressBarRef,
    isPlaying,
    setIsPlaying,
    isFullscreen,
    playbackSpeed,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    isMuted,
    autoplayNext,
    setAutoplayNext,
    nextCountdown,
    setNextCountdown,
    showControls,
    hasStartedPlayback,
    feedbackToast,
    settingsMenuOpen,
    setSettingsMenuOpen,
    settingsSubmenu,
    setSettingsSubmenu,
    selectedQuality,
    setSelectedQuality,
    activeLesson,
    isCurrentCompleted,
    totalLessons,
    completedCount,
    progressPercent,
    filteredSections,
    handleSeekScrubber,
    handleVolumeChange,
    handleToggleMute,
    handleMouseMovePlayer,
    handlePlayPause,
    handleJumpSeconds,
    handleSpeedChange,
    handleToggleFullscreen,
    formatTime,
    handleVideoEnded,
    handleNavigateToCertificate,
  } = useLessonPlayer(props);

  // Polish Titles & Descriptions
  const displayCourseTitle = useMemo(() => {
    if (!courseTitle || courseTitle.trim().toLowerCase() === "test" || courseTitle.trim() === "") {
      return t("defaultCourseTitle");
    }
    return courseTitle;
  }, [courseTitle, t]);

  const displayLessonTitle = useMemo(() => {
    const raw = activeLesson?.title || "";
    if (
      !raw ||
      raw.trim().toLowerCase() === "test" ||
      raw.trim().toLowerCase() === "new lesson" ||
      raw.trim() === ""
    ) {
      return t("defaultLessonTitle");
    }
    return raw;
  }, [activeLesson?.title, t]);

  const displayCourseDescription = useMemo(() => {
    if (
      !courseDescription ||
      courseDescription.trim().length < 8 ||
      courseDescription.trim().toLowerCase() === "test"
    ) {
      return t("defaultCourseDescription");
    }
    return courseDescription;
  }, [courseDescription, t]);

  // Refined Instructor Data
  const rawInstructorName = instructor?.full_name || instructor?.name;
  const isGenericInstructor =
    !rawInstructorName ||
    rawInstructorName.trim().toLowerCase() === "instructor" ||
    rawInstructorName.trim().toLowerCase() === "admin";
  const instructorName = isGenericInstructor
    ? t("defaultInstructorName")
    : rawInstructorName;

  const rawHeadline =
    (isAr ? instructor?.headline_ar || instructor?.headline : instructor?.headline || instructor?.headline_ar) ||
    (isAr ? instructor?.role_ar || instructor?.role : instructor?.role);
  const isGenericHeadline =
    !rawHeadline ||
    rawHeadline.trim().toLowerCase() === "professional instructor & coach" ||
    rawHeadline.trim().toLowerCase() === "instructor";
  const instructorHeadline = isGenericHeadline
    ? t("defaultInstructorHeadline")
    : rawHeadline;
  const instructorSlug = instructor?.slug || String(instructor?.id || "instructor");

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-white"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#0F5244] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500/40 animate-in fade-in slide-in-from-top-3 backdrop-blur-md">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <LessonViewerHeader
        courseTitle={displayCourseTitle}
        courseSlug={courseSlug}
        courseCover={courseCover}
        progressPercent={progressPercent}
        completedCount={completedCount}
        totalLessons={totalLessons}
        backHref={backHref}
        locale={locale}
        isAr={isAr}
        user={user}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        cartItems={cartItems}
        userDropdownOpen={userDropdownOpen}
        setUserDropdownOpen={setUserDropdownOpen}
        dropdownRef={dropdownRef}
        setShowShortcutsModal={setShowShortcutsModal}
        handleNavigateToCertificate={handleNavigateToCertificate}
        router={router}
        pathname={pathname}
        dispatch={dispatch}
        t={t}
        tNav={tNav}
        tHeader={tHeader}
      />

      {/* 2. Main Player & Curriculum Stage */}
      <main
        className={`flex-1 w-full ${
          theaterMode ? "max-w-[1850px]" : "max-w-[1680px]"
        } mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col ${
          theaterMode ? "lg:flex-col" : "lg:flex-row"
        } gap-6 sm:gap-7 items-start transition-all duration-300`}
      >
        {/* Dominant Left Video Workspace Column */}
        <div
          className={`w-full ${
            theaterMode ? "lg:w-full" : sidebarOpen ? "lg:w-[68%]" : "lg:w-full"
          } min-w-0 space-y-4 transition-all duration-300`}
        >
          {/* Video Player */}
          <ErrorBoundary
            title={isAr ? "تعذر تحميل مشغل الفيديو" : "Video Player Error"}
            description={
              isAr
                ? "حدث خطأ غير متوقع أثناء تشغيل الفيديو. يمكنك إعادة المحاولة أو الانتقال لدرس آخر."
                : "An unexpected error occurred in the video player. You can retry or switch lessons."
            }
            resetText={isAr ? "إعادة تحميل المشغل" : "Reload Player"}
          >
            <LessonVideoPlayer
              activeLesson={activeLesson}
              activeLessonIndex={activeLessonIndex}
              allLessons={allLessons}
              courseCover={courseCover}
              isAr={isAr}
              theaterMode={theaterMode}
              setTheaterMode={setTheaterMode}
              playerContainerRef={playerContainerRef}
              videoRef={videoRef}
              settingsMenuRef={settingsMenuRef}
              progressBarRef={progressBarRef}
              isPlaying={isPlaying}
              isFullscreen={isFullscreen}
              playbackSpeed={playbackSpeed}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              autoplayNext={autoplayNext}
              setAutoplayNext={setAutoplayNext}
              nextCountdown={nextCountdown}
              setNextCountdown={setNextCountdown}
              showControls={showControls}
              hasStartedPlayback={hasStartedPlayback}
              feedbackToast={feedbackToast}
              settingsMenuOpen={settingsMenuOpen}
              setSettingsMenuOpen={setSettingsMenuOpen}
              settingsSubmenu={settingsSubmenu}
              setSettingsSubmenu={setSettingsSubmenu}
              selectedQuality={selectedQuality}
              setSelectedQuality={setSelectedQuality}
              isCurrentCompleted={isCurrentCompleted}
              handleMouseMovePlayer={handleMouseMovePlayer}
              handlePlayPause={handlePlayPause}
              handleJumpSeconds={handleJumpSeconds}
              handleToggleFullscreen={handleToggleFullscreen}
              handleVideoEnded={handleVideoEnded}
              handleSeekScrubber={handleSeekScrubber}
              handleToggleMute={handleToggleMute}
              handleVolumeChange={handleVolumeChange}
              handleSpeedChange={handleSpeedChange}
              formatTime={formatTime}
              onToggleComplete={onToggleComplete}
              onPrevLesson={onPrevLesson}
              onNextLesson={onNextLesson}
              onFinishCourse={onFinishCourse}
              handleNavigateToCertificate={handleNavigateToCertificate}
              setIsPlaying={setIsPlaying}
              setCurrentTime={setCurrentTime}
              setDuration={setDuration}
              t={t}
            />
          </ErrorBoundary>

          {/* Lesson Content & Details Tabs */}
          <LessonContentTabs
            activeLesson={activeLesson}
            activeLessonIndex={activeLessonIndex}
            allLessons={allLessons}
            displayLessonTitle={displayLessonTitle}
            displayCourseTitle={displayCourseTitle}
            displayCourseDescription={displayCourseDescription}
            instructorName={instructorName}
            instructorHeadline={instructorHeadline}
            instructorSlug={instructorSlug}
            instructor={instructor}
            whatYouWillLearn={whatYouWillLearn}
            courseMaterials={courseMaterials}
            locale={locale}
            isAr={isAr}
            t={t}
          />
        </div>

        {/* 3. Right Sidebar Workspace Column (Summary + Curriculum next to video) */}
        <aside
          className={`w-full ${
            theaterMode ? "lg:w-full" : sidebarOpen ? "lg:w-[32%] lg:max-w-[420px]" : "hidden"
          } shrink-0 space-y-4 transition-all duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-0.5 custom-scrollbar`}
        >
          {/* AI LESSON SUMMARY (At the top next to video, above the lessons!) */}
          {activeLesson?.id && (
            <ErrorBoundary
              title={isAr ? "تعذر تحميل بطاقة الملخص الذكي" : "Lesson Summary Error"}
              description={
                isAr
                  ? "حدث خطأ أثناء تحميل الملخص الذكي. باقي محتويات الدرس تعمل بشكل طبيعي."
                  : "An unexpected error occurred while loading the AI summary."
              }
              resetText={isAr ? "إعادة المحاولة" : "Try Again"}
            >
              <LessonSummaryCard
                key={`lesson-summary-${activeLesson.id}`}
                lessonId={activeLesson.id}
                lessonTitle={displayLessonTitle}
                isEnrolled={!activeLesson?.is_locked || Boolean(activeLesson?.is_preview)}
                hasResources={true}
                locale={locale}
              />
            </ErrorBoundary>
          )}

          {/* Curriculum Sidebar (Course Content & Lessons) */}
          <LessonCurriculumSidebar
            theaterMode={theaterMode}
            sidebarOpen={sidebarOpen}
            completedCount={completedCount}
            totalLessons={totalLessons}
            progressPercent={progressPercent}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredSections={filteredSections}
            openSections={openSections}
            setOpenSections={setOpenSections}
            allLessons={allLessons}
            activeLessonIndex={activeLessonIndex}
            completedLessonIds={completedLessonIds}
            onSelectLesson={onSelectLesson}
            setIsPlaying={setIsPlaying}
            isAr={isAr}
            t={t}
          />
        </aside>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        t={t}
      />

      {/* Course Completion Celebration Modal */}
      <CourseCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => {
          setShowCelebrationModal(false);
          setHasDismissedCelebration(true);
        }}
        onNavigateToCertificate={handleNavigateToCertificate}
        displayCourseTitle={displayCourseTitle}
        t={t}
      />

      {/* Footer */}
      <Footer variant="auth" />
    </div>
  );
}
