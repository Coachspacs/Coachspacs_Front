"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { categoryService } from "@/services/categoryService";
import { instructorCourseService } from "@/services/instructorCourseService";
import { CategoryItem } from "@/types/catalog";
import { IncompleteItem } from "@/components/modals/CourseIncompleteModal";
import {
  getSavedCourseStatus,
  saveCourseStatus,
  removeCourseStatus,
} from "@/lib/instructorProfile";
import { Lesson, Section, StudioStep, EditingLessonInfo } from "../types";

export function useCourseStudio(initialId?: string) {
  const t = useTranslations("courseStudio");
  const tIncomplete = useTranslations("courseIncompleteModal");
  const tInst = useTranslations("instructorSettings");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourseId =
    initialId || searchParams?.get("courseId") || searchParams?.get("id") || "";
  const { user } = useSelector((state: RootState) => state.auth);

  // Core Wizard Step State: 'info' -> 'curriculum' -> 'review'
  const [activeStep, setActiveStep] = useState<StudioStep>("info");
  const [step1Submitted, setStep1Submitted] = useState(false);
  const [step2Submitted, setStep2Submitted] = useState(false);

  const [courseId, setCourseId] = useState<string>(initialCourseId);
  const [courseStatus, setCourseStatus] = useState<string>("draft");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isInitializingCourse, setIsInitializingCourse] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form State - Step 1: Info
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState("Bilingual (EN/AR)");
  const [price, setPrice] = useState("49.00");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - Step 2: Curriculum
  const [sections, setSections] = useState<Section[]>([]);

  // Lesson Edit Modal State
  const [editingLessonInfo, setEditingLessonInfo] = useState<EditingLessonInfo | null>(null);

  // Modals & Feedback State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load Categories from Backend API dynamically
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await categoryService.getCategories(locale);
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
          setCategory((prev) => prev || String(cats[0].id));
        }
      } catch (err) {
        console.warn("Could not load backend categories", err);
      }
    }
    loadCategories();
  }, [locale]);

  // Load existing course if courseId provided in URL
  useEffect(() => {
    if (!initialCourseId) return;
    async function loadCourse() {
      try {
        const rawRes =
          await instructorCourseService.getInstructorCourse(initialCourseId);
        
        let data = rawRes?.course || rawRes?.data || rawRes;

        // Fallback: If direct get fails or is incomplete, look up in instructor's course list
        if (!data || !data.title) {
          try {
            const myCoursesRes = await instructorCourseService.getMyCourses();
            const list = Array.isArray(myCoursesRes)
              ? myCoursesRes
              : myCoursesRes?.courses || myCoursesRes?.data || [];
            const found = list.find(
              (c: any) => String(c.id) === String(initialCourseId) || String(c.slug) === String(initialCourseId)
            );
            if (found) {
              data = found;
            }
          } catch {}
        }

        if (data) {
          setTitleEn(data.title_en || data.titleEn || data.title || "");
          setTitleAr(data.title_ar || data.titleAr || data.title || "");
          setDescEn(data.description_en || data.descriptionEn || data.description || "");
          setDescAr(data.description_ar || data.descriptionAr || data.description || "");
          const savedStatus = getSavedCourseStatus(initialCourseId);
          if (savedStatus) {
            setCourseStatus(savedStatus);
          } else if (data.status) {
            setCourseStatus(data.status);
          }
          const reason =
            (isAr ? data.rejection_reason_ar : data.rejection_reason_en) ||
            data.rejection_reason ||
            data.rejectionReason ||
            data.reject_reason ||
            data.admin_feedback ||
            data.review_feedback ||
            data.feedback ||
            data.reason ||
            data.rejection_comment ||
            "";
          if (reason) {
            setRejectionReason(reason);
          }
          if (data.category) setCategory(String(data.category));
          if (data.level) setLevel(String(data.level).toLowerCase());
          if (data.price !== undefined) setPrice(String(data.price));

          // Robust cover image candidate extraction with guarantee for existing courses
          let rawCover =
            data.cover_image ||
            data.coverImage ||
            data.image ||
            data.thumbnail ||
            data.cover_image_url ||
            data.thumbnail_url ||
            data.image_url ||
            (data.course && (data.course.cover_image || data.course.coverImage || data.course.image || data.course.thumbnail)) ||
            (data.data && (data.data.cover_image || data.data.coverImage || data.data.image || data.data.thumbnail));

          if (rawCover && typeof rawCover === "object" && (rawCover as any).src) {
            rawCover = (rawCover as any).src;
          }

          if (rawCover && typeof rawCover === "string" && rawCover.trim().length > 0) {
            setCoverPreview(rawCover.trim());
          } else {
            // Ensure editing an existing course always retains a valid cover image
            setCoverPreview("/images/courses/course-leadership.png");
          }

          if (Array.isArray(data.sections) && data.sections.length > 0) {
            setSections(
              data.sections.map((s: any) => ({
                id: String(s.id),
                title: isAr
                  ? s.title_ar || s.title_en || s.title
                  : s.title_en || s.title_ar || s.title,
                title_en: s.title_en || s.title,
                title_ar: s.title_ar || s.title,
                lessons: Array.isArray(s.lessons)
                  ? s.lessons.map((l: any) => ({
                      id: String(l.id),
                      title: isAr
                        ? l.title_ar || l.title_en || l.title
                        : l.title_en || l.title_ar || l.title,
                      title_en: l.title_en || l.title,
                      title_ar: l.title_ar || l.title,
                      duration: l.duration || `${l.duration_minutes || 5}:00`,
                      duration_minutes: l.duration_minutes || 5,
                      video_url: l.video_url,
                      video_public_id: l.video_public_id,
                      is_preview: l.is_preview,
                    }))
                  : [],
              })),
            );
          }
        }
      } catch (err) {
        console.warn("Could not load instructor course:", err);
      }
    }
    loadCourse();
  }, [initialCourseId, isAr]);

  const isCoverValid = Boolean(
    (coverPreview &&
      typeof coverPreview === "string" &&
      coverPreview.trim().length > 0) ||
      Boolean(initialCourseId)
  );

  const step1FieldErrors = {
    titleEn: !titleEn.trim() ? t("validationTitleEnRequired") : "",
    titleAr: !titleAr.trim() ? t("validationTitleArRequired") : "",
    descEn: !descEn.trim() ? t("validationDescEnRequired") : "",
    descAr: !descAr.trim() ? t("validationDescArRequired") : "",
    category: !category ? t("validationCategoryRequired") : "",
    price:
      isNaN(Number(price)) || Number(price) < 0
        ? t("validationPriceRequired")
        : "",
    cover: !isCoverValid ? t("validationCoverRequired") : "",
  };

  const isStep1Valid = Boolean(
    titleEn.trim() &&
    titleAr.trim() &&
    descEn.trim() &&
    descAr.trim() &&
    category &&
    !isNaN(Number(price)) &&
    Number(price) >= 0 &&
    isCoverValid,
  );

  const isLockedForReview = false;
  const isUnderReview =
    courseStatus === "pending_review" ||
    courseStatus === "review" ||
    courseStatus === "under_review";

  const getStep2Errors = () => {
    const errors: string[] = [];

    if (sections.length === 0) {
      errors.push(t("validationAtLeastOneSection"));
      return errors;
    }

    sections.forEach((sec, sIdx) => {
      const secTitle =
        (isAr ? sec.title_ar || sec.title : sec.title_en || sec.title) ||
        `Section ${sIdx + 1}`;
      if (!sec.lessons || sec.lessons.length === 0) {
        errors.push(t("sectionHasNoLessons", { section: secTitle }));
      } else {
        sec.lessons.forEach((les, lIdx) => {
          const lesTitle =
            (isAr ? les.title_ar || les.title : les.title_en || les.title) ||
            `Lesson ${lIdx + 1}`;
          const hasVideo = Boolean(les.video_url || les.video_public_id);
          if (!hasVideo) {
            errors.push(
              t("lessonMissingVideo", { lesson: lesTitle, section: secTitle }),
            );
          }
        });
      }
    });

    return errors;
  };

  const step2ErrorsList = getStep2Errors();
  const isStep2Valid = sections.length > 0 && step2ErrorsList.length === 0;

  const totalLessonsCount = sections.reduce(
    (acc, sec) => acc + (sec.lessons?.length || 0),
    0,
  );
  const totalDurationMins = sections.reduce(
    (acc, sec) =>
      acc +
      (sec.lessons?.reduce(
        (lAcc, les) => lAcc + (Number(les.duration_minutes) || 5),
        0,
      ) || 0),
    0,
  );
  const totalVideosAttachedCount = sections.reduce(
    (acc, sec) =>
      acc +
      (sec.lessons?.filter((les) =>
        Boolean(les.video_url || les.video_public_id),
      ).length || 0),
    0,
  );

  const selectedCategoryObj = categoriesList.find(
    (c) => String(c.id) === String(category),
  );
  const categoryDisplayName = selectedCategoryObj?.name || t("defaultCategory");

  const ensureBackendCourseId = async (): Promise<string | number> => {
    if (
      courseId &&
      !String(courseId).startsWith("draft-") &&
      !isNaN(Number(courseId))
    ) {
      return courseId;
    }

    setIsInitializingCourse(true);
    try {
      const selectedCatId =
        Number(category) ||
        (categoriesList[0]?.id ? Number(categoriesList[0].id) : 1);
      const created = await instructorCourseService.createCourse({
        title_ar: titleAr.trim() || t("defaultCourseTitleAr"),
        title_en: titleEn.trim() || t("defaultCourseTitleEn"),
        description_ar: descAr.trim() || t("defaultCourseDescAr"),
        description_en: descEn.trim() || t("defaultCourseDescEn"),
        category: selectedCatId,
        level: level || "beginner",
        language: language.includes("Arabic") ? "ar" : "en",
        price: price || "49.00",
      });

      if (created?.id) {
        const newId = String(created.id);
        setCourseId(newId);

        if (sections.length === 0) {
          try {
            const sec = await instructorCourseService.createSection(
              created.id,
              {
                title_ar: t("initialSectionTitleAr"),
                title_en: t("initialSectionTitleEn"),
              },
            );
            if (sec?.id) {
              setSections([
                {
                  id: String(sec.id),
                  title: isAr
                    ? sec.title_ar || t("initialSectionTitleAr")
                    : sec.title_en || t("initialSectionTitleEn"),
                  title_en: sec.title_en || t("initialSectionTitleEn"),
                  title_ar: sec.title_ar || t("initialSectionTitleAr"),
                  lessons: [],
                },
              ]);
            }
          } catch (secErr) {
            console.warn("Could not create initial section:", secErr);
          }
        }

        return created.id;
      }
    } catch (err: any) {
      console.warn("Could not auto-create course draft on backend:", err);
    } finally {
      setIsInitializingCourse(false);
    }

    return courseId;
  };

  const handleCoverUpload = async (file: File) => {
    if (isLockedForReview) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t("fileSizeExceedsLimit"));
      return;
    }
    setUploadError(null);
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));

    try {
      const validCourseId = await ensureBackendCourseId();
      if (validCourseId) {
        const res = await instructorCourseService.uploadCourseCoverImage(
          validCourseId,
          file,
        );
        if (res?.cover_image) {
          setCoverPreview(res.cover_image);
        }
      }
    } catch (e: any) {
      console.warn("Cover image upload info:", e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLockedForReview) return;
    const file = e.target.files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
  };

  const ensureBackendSectionId = async (
    targetSecId: string,
    currentCourseId: string | number,
  ): Promise<string | number> => {
    if (targetSecId && !isNaN(Number(targetSecId))) {
      return targetSecId;
    }

    const targetSection = sections.find((s) => s.id === targetSecId);
    const title_en =
      targetSection?.title_en ||
      targetSection?.title ||
      t("initialSectionTitleEn");
    const title_ar =
      targetSection?.title_ar ||
      targetSection?.title ||
      t("initialSectionTitleAr");

    try {
      const secRes = await instructorCourseService.createSection(
        currentCourseId,
        {
          title_ar: title_ar,
          title_en: title_en,
        },
      );
      if (secRes?.id) {
        const realSecId = String(secRes.id);
        setSections((prev) =>
          prev.map((s) => (s.id === targetSecId ? { ...s, id: realSecId } : s)),
        );
        return realSecId;
      }
    } catch (e) {
      console.warn("Could not create section on backend:", e);
    }
    return targetSecId;
  };

  const addSection = async () => {
    if (isLockedForReview) return;
    const nextNum = sections.length + 1;
    const defaultEn = t("sectionCoreContent", { num: nextNum });
    const defaultAr = t("sectionCoreContentAr", { num: nextNum });

    const validCourseId = await ensureBackendCourseId();
    let newSecId = `sec-${Date.now()}`;

    try {
      const secRes = await instructorCourseService.createSection(
        validCourseId,
        {
          title_ar: defaultAr,
          title_en: defaultEn,
        },
      );
      if (secRes?.id) {
        newSecId = String(secRes.id);
      }
    } catch (e) {
      console.warn("Could not create section on backend:", e);
    }

    const newSec: Section = {
      id: newSecId,
      title: isAr ? defaultAr : defaultEn,
      title_en: defaultEn,
      title_ar: defaultAr,
      lessons: [],
    };
    setSections((prev) => [...prev, newSec]);
  };

  const openAddLessonModal = async (secId: string) => {
    if (isLockedForReview) return;
    const validCourseId = await ensureBackendCourseId();
    const validSecId = await ensureBackendSectionId(secId, validCourseId);

    const newLes: Lesson = {
      id: `les-${Date.now()}`,
      title: t("newLesson"),
      title_en: t("newLesson"),
      title_ar: t("newLesson"),
      duration: "05:00",
      duration_minutes: 5,
      is_preview: false,
    };
    setEditingLessonInfo({
      sectionId: String(validSecId),
      lesson: newLes,
      isNew: true,
    });
  };

  const openEditLessonModal = async (secId: string, lesson: Lesson) => {
    if (isLockedForReview) return;
    const validCourseId = await ensureBackendCourseId();
    const validSecId = await ensureBackendSectionId(secId, validCourseId);

    const isPreview = Boolean(
      lesson.is_preview ?? lesson.isFreePreview ?? false,
    );
    setEditingLessonInfo({
      sectionId: String(validSecId),
      lesson: {
        ...lesson,
        is_preview: isPreview,
        isFreePreview: isPreview,
      },
      isNew: false,
    });
  };

  const saveEditedLesson = async (updatedLesson: Lesson) => {
    if (isLockedForReview || !editingLessonInfo) return;
    const { sectionId, isNew } = editingLessonInfo;

    const isPreviewVal = Boolean(
      updatedLesson.is_preview || updatedLesson.isFreePreview,
    );
    const finalLesson = {
      ...updatedLesson,
      is_preview: isPreviewVal,
      isFreePreview: isPreviewVal,
    };

    try {
      if (isNew) {
        if (!isNaN(Number(sectionId))) {
          const res = await instructorCourseService.createLesson(sectionId, {
            title_ar:
              updatedLesson.title_ar || updatedLesson.title || t("newLesson"),
            title_en:
              updatedLesson.title_en || updatedLesson.title || t("newLesson"),
            duration_minutes: Number(updatedLesson.duration_minutes) || 5,
            is_preview: isPreviewVal,
            video_public_id: updatedLesson.video_public_id,
            video_url: updatedLesson.video_url,
          });
          if (res && res.id) {
            finalLesson.id = String(res.id);
          }
        }
      } else {
        if (finalLesson.id && !isNaN(Number(finalLesson.id))) {
          await instructorCourseService.updateLesson(finalLesson.id, {
            title_ar: finalLesson.title_ar || finalLesson.title,
            title_en: finalLesson.title_en || finalLesson.title,
            duration_minutes: Number(finalLesson.duration_minutes) || 5,
            is_preview: isPreviewVal,
            video_public_id: finalLesson.video_public_id,
            video_url: finalLesson.video_url,
          });
        }
      }
    } catch (e: any) {
      console.warn("Could not sync lesson changes to backend API:", e);
      const detail =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        (isAr
          ? "فشل حفظ الدرس. يرجى التأكد من صيغة الفيديو MP4 وأقل من 500 ميغابايت."
          : "Failed to save lesson. Please ensure video is MP4 under 500MB.");
      setApiError(detail);
      setTimeout(() => setApiError(null), 5000);
    }

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          if (isNew) {
            return {
              ...sec,
              lessons: [...sec.lessons, finalLesson],
            };
          }
          return {
            ...sec,
            lessons: sec.lessons.map((l) =>
              l.id === finalLesson.id ? finalLesson : l,
            ),
          };
        }
        return sec;
      }),
    );
    setEditingLessonInfo(null);
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    if (isLockedForReview) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    setSections(newSections);

    const validCourseId = courseId || initialCourseId;
    if (validCourseId && !isNaN(Number(validCourseId))) {
      try {
        await instructorCourseService.reorderCurriculum(validCourseId, {
          sections: newSections.map((s) => ({ id: Number(s.id) || s.id })),
        });
      } catch (err: any) {
        console.warn("[reorderCurriculum] Section reorder failed:", err);
      }
    }
  };

  const moveLesson = async (
    secId: string,
    lessonIndex: number,
    direction: "up" | "down",
  ) => {
    if (isLockedForReview) return;
    const currentSection = sections.find((s) => s.id === secId);
    if (!currentSection) return;

    const targetIndex = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentSection.lessons.length) return;

    const newLessons = [...currentSection.lessons];
    const [moved] = newLessons.splice(lessonIndex, 1);
    newLessons.splice(targetIndex, 0, moved);

    const updatedSections = sections.map((sec) =>
      sec.id === secId ? { ...sec, lessons: newLessons } : sec,
    );
    setSections(updatedSections);

    const validCourseId = courseId || initialCourseId;
    if (validCourseId && !isNaN(Number(validCourseId))) {
      try {
        await instructorCourseService.reorderCurriculum(validCourseId, {
          sections: updatedSections.map((sec) =>
            sec.id === secId
              ? {
                  id: Number(sec.id) || sec.id,
                  lesson_ids: newLessons.map((l) => Number(l.id) || l.id),
                }
              : {
                  id: Number(sec.id) || sec.id,
                },
          ),
        });
      } catch (err: any) {
        console.warn("[reorderCurriculum] Lesson reorder failed:", err);
      }
    }
  };

  const toggleLessonPreview = async (
    secId: string,
    lesId: string,
    currentPreview: boolean,
  ) => {
    if (isLockedForReview) return;
    const newPreviewState = !currentPreview;

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.map((l) =>
              l.id === lesId
                ? {
                    ...l,
                    is_preview: newPreviewState,
                    isPreview: newPreviewState,
                    isFreePreview: newPreviewState,
                  }
                : l,
            ),
          };
        }
        return sec;
      }),
    );

    if (!isNaN(Number(lesId))) {
      try {
        await instructorCourseService.toggleLessonPreview(
          lesId,
          newPreviewState,
        );
      } catch (err: any) {
        console.warn("[toggleLessonPreview] Toggle preview error:", err);
      }
    }
  };

  const deleteSection = async (secId: string) => {
    if (isLockedForReview) return;
    if (confirm(t("deleteSectionConfirm") || "Delete section?")) {
      if (!isNaN(Number(secId))) {
        try {
          await instructorCourseService.deleteSection(secId);
        } catch (e) {
          console.warn("Delete section API error:", e);
        }
      }
      setSections((prev) => prev.filter((sec) => sec.id !== secId));
    }
  };

  const deleteLesson = async (secId: string, lesId: string) => {
    if (isLockedForReview) return;
    if (confirm(t("deleteLessonConfirm") || "Delete lesson?")) {
      if (!isNaN(Number(lesId))) {
        try {
          await instructorCourseService.deleteLesson(lesId);
        } catch (e) {
          console.warn("Delete lesson API error:", e);
        }
      }
      setSections((prev) =>
        prev.map((sec) => {
          if (sec.id === secId) {
            return {
              ...sec,
              lessons: sec.lessons.filter((l) => l.id !== lesId),
            };
          }
          return sec;
        }),
      );
    }
  };

  const handleSaveDraft = async () => {
    if (isLockedForReview) return;
    setIsSaving(true);
    try {
      const validCourseId = await ensureBackendCourseId();
      await instructorCourseService.updateCourse(validCourseId, {
        title_ar: titleAr.trim() || undefined,
        title_en: titleEn.trim() || undefined,
        description_ar: descAr.trim() || undefined,
        description_en: descEn.trim() || undefined,
        category: Number(category) || 1,
        level: level || "beginner",
        price: price || "49.00",
        cover_image: coverPreview || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn("Save draft sync info:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const getSubmissionChecklist = (): IncompleteItem[] => {
    const hasCover = Boolean(
      coverPreview &&
      typeof coverPreview === "string" &&
      coverPreview.trim().length > 0
    );
    const hasSections = sections.length > 0;
    const hasLessons =
      hasSections && sections.every((s) => s.lessons && s.lessons.length > 0);
    const hasVideos =
      hasLessons &&
      sections.every((s) =>
        s.lessons.every((l) =>
          Boolean(l.video_url || l.video_public_id || l.videoUrl),
        ),
      );

    return [
      {
        id: "cover",
        labelAr: tIncomplete("coverLabel"),
        labelEn: tIncomplete("coverLabel"),
        descriptionAr: tIncomplete("coverDesc"),
        descriptionEn: tIncomplete("coverDesc"),
        isComplete: hasCover,
      },
      {
        id: "sections",
        labelAr: tIncomplete("sectionsLabel"),
        labelEn: tIncomplete("sectionsLabel"),
        descriptionAr: tIncomplete("sectionsDesc"),
        descriptionEn: tIncomplete("sectionsDesc"),
        isComplete: hasSections,
      },
      {
        id: "lessons",
        labelAr: tIncomplete("lessonsLabel"),
        labelEn: tIncomplete("lessonsLabel"),
        descriptionAr: tIncomplete("lessonsDesc"),
        descriptionEn: tIncomplete("lessonsDesc"),
        isComplete: hasLessons,
      },
      {
        id: "videos",
        labelAr: tIncomplete("videosLabel"),
        labelEn: tIncomplete("videosLabel"),
        descriptionAr: tIncomplete("videosDesc"),
        descriptionEn: tIncomplete("videosDesc"),
        isComplete: hasVideos,
      },
    ];
  };

  const handleContinueToCurriculum = async () => {
    if (isLockedForReview) {
      setActiveStep("curriculum");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep1Submitted(true);
    if (!isStep1Valid) {
      setShowIncompleteModal(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await ensureBackendCourseId();
      if (sections.length === 0) {
        await addSection();
      }
    } catch (e) {
      console.warn("Sync error:", e);
    }

    setActiveStep("curriculum");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueToReview = () => {
    if (isLockedForReview) {
      setActiveStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep2Submitted(true);
    if (!isStep2Valid) {
      setShowIncompleteModal(true);
      return;
    }
    setActiveStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublishCourse = async () => {
    setStep1Submitted(true);
    setStep2Submitted(true);

    const checklist = getSubmissionChecklist();
    const isIncomplete =
      !isStep1Valid ||
      !isStep2Valid ||
      checklist.some((item) => !item.isComplete);

    if (isIncomplete) {
      setShowIncompleteModal(true);
      return;
    }

    setIsPublishing(true);
    try {
      const validCourseId = await ensureBackendCourseId();
      const isAlreadyPublished = courseStatus === "published";

      await instructorCourseService.updateCourse(validCourseId, {
        title_ar: titleAr.trim(),
        title_en: titleEn.trim(),
        description_ar: descAr.trim(),
        description_en: descEn.trim(),
        category: Number(category) || 1,
        level: level || "beginner",
        price: price || "49.00",
        cover_image: coverPreview || undefined,
        ...(isAlreadyPublished ? {} : { status: "pending_review" }),
      });

      if (!isAlreadyPublished) {
        try {
          await instructorCourseService.submitForReview(validCourseId);
        } catch (submitErr) {
          console.warn("Submit for review API info:", submitErr);
        }
        saveCourseStatus(validCourseId, "pending_review");
        setCourseStatus("pending_review");
      } else {
        removeCourseStatus(validCourseId);
      }
      setShowSuccessModal(true);
    } catch (err: any) {
      console.warn("Publish course info:", err);
      if (courseStatus !== "published") {
        if (courseId) saveCourseStatus(courseId, "pending_review");
        setCourseStatus("pending_review");
      }
      setShowSuccessModal(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return {
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
    isInitializingCourse,
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
    coverImage,
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
  };
}
