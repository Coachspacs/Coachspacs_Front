"use client";

import React from "react";
import { CourseIncompleteModal } from "@/components/modals/CourseIncompleteModal";
import { LiveCoursePreviewModal } from "@/components/modals/LiveCoursePreviewModal";
import {
  CreateCourseStudioProps,
  useCourseStudio,
  StudioAlertBanners,
  StudioStepInfo,
  StudioStepCurriculum,
  StudioStepReview,
  LessonEditModal,
  StudioSuccessModal,
} from "./studio";

export { type Lesson, type Section } from "./studio/types";

export function CreateCourseStudio({ initialId }: CreateCourseStudioProps = {}) {
  const {
    t,
    tInst,
    locale,
    isAr,
    router,
    user,
    activeStep,
    setActiveStep,
    step1Submitted,
    step2Submitted,
    courseId,
    courseStatus,
    rejectionReason,
    isSaving,
    isPublishing,
    titleEn,
    setTitleEn,
    titleAr,
    setTitleAr,
    descEn,
    setDescEn,
    descAr,
    setDescAr,
    category,
    setCategory,
    categoriesList,
    level,
    setLevel,
    language,
    setLanguage,
    price,
    setPrice,
    coverPreview,
    uploadError,
    fileInputRef,
    sections,
    setSections,
    editingLessonInfo,
    setEditingLessonInfo,
    showPreviewModal,
    setShowPreviewModal,
    showSuccessModal,
    setShowSuccessModal,
    showIncompleteModal,
    setShowIncompleteModal,
    saveSuccess,
    apiError,
    setApiError,
    isCoverValid,
    step1FieldErrors,
    isStep1Valid,
    isLockedForReview,
    isUnderReview,
    step2ErrorsList,
    isStep2Valid,
    totalLessonsCount,
    totalDurationMins,
    totalVideosAttachedCount,
    categoryDisplayName,
    handleImageSelect,
    handleDrop,
    addSection,
    openAddLessonModal,
    openEditLessonModal,
    saveEditedLesson,
    moveSection,
    moveLesson,
    toggleLessonPreview,
    deleteSection,
    deleteLesson,
    handleSaveDraft,
    getSubmissionChecklist,
    handleContinueToCurriculum,
    handleContinueToReview,
    handlePublishCourse,
  } = useCourseStudio(initialId);

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F4F7F6] text-slate-800 font-sans pb-16 flex flex-col antialiased"
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        id="course-cover-file-input"
        aria-label="Upload Course Cover Image"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 flex-1 w-full">
        {/* Alerts & Feedback Banners */}
        <StudioAlertBanners
          isUnderReview={isUnderReview}
          courseStatus={courseStatus}
          rejectionReason={rejectionReason}
          saveSuccess={saveSuccess}
          apiError={apiError}
          setApiError={setApiError}
          t={t}
          tInst={tInst}
        />

        {/* STEP 1: COURSE INFO VIEW */}
        {activeStep === "info" && (
          <StudioStepInfo
            t={t}
            locale={locale}
            isAr={isAr}
            router={router}
            isSaving={isSaving}
            isLockedForReview={isLockedForReview}
            step1Submitted={step1Submitted}
            isStep1Valid={isStep1Valid}
            step1FieldErrors={step1FieldErrors}
            titleEn={titleEn}
            setTitleEn={setTitleEn}
            titleAr={titleAr}
            setTitleAr={setTitleAr}
            descEn={descEn}
            setDescEn={setDescEn}
            descAr={descAr}
            setDescAr={setDescAr}
            category={category}
            setCategory={setCategory}
            categoriesList={categoriesList}
            level={level}
            setLevel={setLevel}
            language={language}
            setLanguage={setLanguage}
            price={price}
            setPrice={setPrice}
            coverPreview={coverPreview}
            isCoverValid={isCoverValid}
            uploadError={uploadError}
            fileInputRef={fileInputRef}
            handleDrop={handleDrop}
            handleSaveDraft={handleSaveDraft}
            handleContinueToCurriculum={handleContinueToCurriculum}
            setShowPreviewModal={setShowPreviewModal}
          />
        )}

        {/* STEP 2: CURRICULUM & VIDEOS BUILDER */}
        {activeStep === "curriculum" && (
          <StudioStepCurriculum
            t={t}
            isAr={isAr}
            courseId={courseId}
            sections={sections}
            setSections={setSections}
            isSaving={isSaving}
            isLockedForReview={isLockedForReview}
            step2Submitted={step2Submitted}
            isStep2Valid={isStep2Valid}
            step2ErrorsList={step2ErrorsList}
            totalLessonsCount={totalLessonsCount}
            totalDurationMins={totalDurationMins}
            totalVideosAttachedCount={totalVideosAttachedCount}
            coverPreview={coverPreview}
            addSection={addSection}
            openAddLessonModal={openAddLessonModal}
            openEditLessonModal={openEditLessonModal}
            moveSection={moveSection}
            moveLesson={moveLesson}
            toggleLessonPreview={toggleLessonPreview}
            deleteSection={deleteSection}
            deleteLesson={deleteLesson}
            handleSaveDraft={handleSaveDraft}
            handleContinueToReview={handleContinueToReview}
            setActiveStep={setActiveStep}
            setShowPreviewModal={setShowPreviewModal}
          />
        )}

        {/* STEP 3: REVIEW & PUBLISH VIEW */}
        {activeStep === "review" && (
          <StudioStepReview
            t={t}
            isAr={isAr}
            isSaving={isSaving}
            isPublishing={isPublishing}
            isLockedForReview={isLockedForReview}
            isUnderReview={isUnderReview}
            isStep1Valid={isStep1Valid}
            isStep2Valid={isStep2Valid}
            courseStatus={courseStatus}
            price={price}
            categoryDisplayName={categoryDisplayName}
            level={level}
            language={language}
            titleEn={titleEn}
            titleAr={titleAr}
            descEn={descEn}
            coverPreview={coverPreview}
            sections={sections}
            totalLessonsCount={totalLessonsCount}
            totalDurationMins={totalDurationMins}
            setActiveStep={setActiveStep}
            handleSaveDraft={handleSaveDraft}
            handlePublishCourse={handlePublishCourse}
            setShowPreviewModal={setShowPreviewModal}
          />
        )}
      </div>

      {/* Lesson Edit / Video Upload Modal */}
      <LessonEditModal
        t={t}
        isAr={isAr}
        courseId={courseId}
        editingLessonInfo={editingLessonInfo}
        setEditingLessonInfo={setEditingLessonInfo}
        saveEditedLesson={saveEditedLesson}
      />

      {/* Course Submitted Celebration Modal */}
      <StudioSuccessModal
        isOpen={showSuccessModal}
        courseStatus={courseStatus}
        locale={locale}
        router={router}
        onClose={() => setShowSuccessModal(false)}
        t={t}
      />

      {/* Authentic Full Live Course Landing Page Preview Modal */}
      <LiveCoursePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        titleEn={titleEn}
        titleAr={titleAr}
        descEn={descEn}
        descAr={descAr}
        categoryName={categoryDisplayName}
        level={level}
        language={language}
        price={price}
        coverUrl={isCoverValid ? coverPreview : null}
        sections={sections}
        instructorName={user?.fullName || user?.name}
      />

      {/* Course Incomplete Mandatory Checklist Modal */}
      <CourseIncompleteModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        courseId={String(courseId)}
        courseTitle={isAr ? titleAr || titleEn : titleEn || titleAr}
        missingItems={getSubmissionChecklist()}
        onAction={() => {
          setShowIncompleteModal(false);
          const checklist = getSubmissionChecklist();
          const missingCover = checklist.some(
            (i) => i.id === "cover" && !i.isComplete,
          );
          if (missingCover || !isStep1Valid) {
            setActiveStep("info");
          } else {
            setActiveStep("curriculum");
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
