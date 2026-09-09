"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { categoryService } from "@/services/categoryService";
import { instructorCourseService } from "@/services/instructorCourseService";
import { CategoryItem } from "@/types/catalog";
import {
  FileText,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  PlayCircle,
  AlertTriangle,
  AlertCircle,
  Eye,
  X,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Video,
  Sparkles,
  Save,
  Send,
  Loader2,
  Check,
  BookOpen,
  Clock,
  DollarSign,
  Film,
  ExternalLink,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { LessonVideoUploader } from "@/components/instructor/LessonVideoUploader";
import {
  CourseIncompleteModal,
  IncompleteItem,
} from "@/components/modals/CourseIncompleteModal";
import { LiveCoursePreviewModal } from "@/components/modals/LiveCoursePreviewModal";
import {
  getSavedCourseStatus,
  saveCourseStatus,
} from "@/lib/instructorProfile";

interface Lesson {
  id: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  titleEn?: string;
  titleAr?: string;
  duration: string;
  duration_minutes?: number;
  video_url?: string;
  videoUrl?: string;
  video_public_id?: string;
  is_preview?: boolean;
  isPreview?: boolean;
  isFreePreview?: boolean;
  isCompleted?: boolean;
  warning?: string;
}

interface Section {
  id: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  titleEn?: string;
  titleAr?: string;
  lessons: Lesson[];
  warning?: string;
}

type StudioStep = "info" | "curriculum" | "review";

interface CreateCourseStudioProps {
  initialId?: string;
}

export function CreateCourseStudio({
  initialId,
}: CreateCourseStudioProps = {}) {
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
  const [editingLessonInfo, setEditingLessonInfo] = useState<{
    sectionId: string;
    lesson: Lesson;
    isNew?: boolean;
  } | null>(null);

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
        const data =
          await instructorCourseService.getInstructorCourse(initialCourseId);
        if (data) {
          setTitleEn(data.title_en || data.title || "");
          setTitleAr(data.title_ar || "");
          setDescEn(data.description_en || data.description || "");
          setDescAr(data.description_ar || "");
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
          if (data.level) setLevel(data.level.toLowerCase());
          if (data.price) setPrice(String(data.price));
          if (
            data.cover_image &&
            typeof data.cover_image === "string" &&
            !data.cover_image.includes("unsplash.com/photo-1516321318423")
          ) {
            setCoverPreview(data.cover_image);
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

  /**
   * Validation: Step 1 (Course Info)
   */
  const isCoverValid = Boolean(
    coverPreview &&
    typeof coverPreview === "string" &&
    !coverPreview.includes("unsplash.com/photo-1516321318423"),
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

  const isLockedForReview =
    courseStatus === "pending_review" ||
    courseStatus === "review" ||
    courseStatus === "under_review";

  /**
   * Validation: Step 2 (Curriculum & Videos)
   * Required:
   * 1. At least 1 section.
   * 2. Every section must have at least 1 lesson.
   * 3. Every lesson must have a video (video_url or video_public_id).
   */
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

  /**
   * Helper: Total Course Statistics
   */
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

  /**
   * Ensures a real database course ID exists before requesting upload signatures or adding lessons
   */
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

        // Auto-create initial section on backend if none exist
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

  /**
   * Handlers for Cover Image
   */
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

  /**
   * Ensures a real database section ID exists before creating or updating lessons
   */
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

  /**
   * Section Handlers
   */
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

  /**
   * Reorder Sections via PUT /api/instructor/courses/{id}/reorder
   */
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

  /**
   * Reorder Lessons within a section via PUT /api/instructor/courses/{id}/reorder
   */
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

  /**
   * Toggle Free Preview on a lesson via PATCH /api/instructor/lessons/{lessonId}
   */
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

  /**
   * Save Draft Action
   */
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
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn("Save draft sync info:", e);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Helper: Build Live Submission Checklist
   */
  const getSubmissionChecklist = (): IncompleteItem[] => {
    const hasCover = Boolean(
      coverPreview &&
      typeof coverPreview === "string" &&
      !coverPreview.includes("unsplash.com/photo-1516321318423"),
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

  /**
   * Step 1 -> Step 2 Navigation
   */
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
      // Auto create an initial section if empty
      if (sections.length === 0) {
        await addSection();
      }
    } catch (e) {
      console.warn("Sync error:", e);
    }

    setActiveStep("curriculum");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Step 2 -> Step 3 Navigation
   */
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

  /**
   * Step 3: Final Publish & Submit
   */
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
      await instructorCourseService.updateCourse(validCourseId, {
        title_ar: titleAr.trim(),
        title_en: titleEn.trim(),
        description_ar: descAr.trim(),
        description_en: descEn.trim(),
        category: Number(category) || 1,
        level: level || "beginner",
        price: price || "49.00",
        status: "pending_review",
      });

      try {
        await instructorCourseService.submitForReview(validCourseId);
      } catch (submitErr) {
        console.warn("Submit for review API info:", submitErr);
      }

      saveCourseStatus(validCourseId, "pending_review");
      setCourseStatus("pending_review");
      setShowSuccessModal(true);
    } catch (err: any) {
      console.warn("Publish course info:", err);
      if (courseId) saveCourseStatus(courseId, "pending_review");
      setCourseStatus("pending_review");
      setShowSuccessModal(true);
    } finally {
      setIsPublishing(false);
    }
  };

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
        {/* Course Under Review Lock Notification Banner */}
        {isLockedForReview && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex items-start gap-3.5 shadow-2xs animate-in fade-in">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-amber-950 text-sm sm:text-base">
                  {t("courseUnderReviewBannerTitle")}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[11px] font-black">
                  {t("lockedModeBadge")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/90 font-medium leading-relaxed">
                {t("courseUnderReviewBannerDesc")}
              </p>
            </div>
          </div>
        )}

        {/* Course Rejected Alert Banner with Rejection Reason */}
        {courseStatus === "rejected" && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3.5 shadow-xs animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-rose-950 text-sm sm:text-base">
                  {t("courseRejectedBannerTitle")}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[11px] font-black">
                  {tInst("statusRejected")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-900/90 font-medium leading-relaxed">
                {t("courseRejectedBannerDesc")}
              </p>

              {/* Highlighted Reason Box */}
              <div className="p-3.5 rounded-2xl bg-white border border-rose-200/90 shadow-2xs text-xs font-semibold text-rose-900 leading-relaxed flex items-start gap-2.5">
                <span className="font-black text-rose-950 shrink-0">
                  {tInst("rejectionReasonLabel")}
                </span>
                <span className="text-rose-800">
                  {rejectionReason || t("rejectionReasonFallback")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Save Draft Success Notification Toast */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{t("draftSavedSuccess")}</span>
          </div>
        )}

        {/* API Error Notification Toast */}
        {apiError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-rose-600 hover:text-rose-800 p-1 rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: COURSE INFO VIEW                                  */}
        {/* ========================================================= */}
        {activeStep === "info" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {t("courseDetailsTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  {t("courseDetailsSubtitle")}
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t("previewBtn")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#0F5244]" />
                  )}
                  <span>{t("saveDraft")}</span>
                </button>
              </div>
            </div>

            {/* Validation Banner if submitted with errors */}
            {step1Submitted && !isStep1Valid && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold">
                    {t("validationFixErrorsPrompt")}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-rose-700">
                    {step1FieldErrors.titleEn && (
                      <li>{step1FieldErrors.titleEn}</li>
                    )}
                    {step1FieldErrors.titleAr && (
                      <li>{step1FieldErrors.titleAr}</li>
                    )}
                    {step1FieldErrors.descEn && (
                      <li>{step1FieldErrors.descEn}</li>
                    )}
                    {step1FieldErrors.descAr && (
                      <li>{step1FieldErrors.descAr}</li>
                    )}
                    {step1FieldErrors.category && (
                      <li>{step1FieldErrors.category}</li>
                    )}
                    {step1FieldErrors.price && (
                      <li>{step1FieldErrors.price}</li>
                    )}
                    {step1FieldErrors.cover && (
                      <li>{step1FieldErrors.cover}</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column (2 Cols): Basic Info & Attributes */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Basic Information Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#0F5244]">
                    <FileText size={18} className="shrink-0 text-[#0F5244]" />
                    <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {t("basicInfoTitle")}
                    </h2>
                  </div>

                  {/* Course Title (EN & AR) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      {t("courseTitleLabel")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          id="course-title-en"
                          type="text"
                          value={titleEn}
                          disabled={isLockedForReview}
                          onChange={(e) => setTitleEn(e.target.value)}
                          placeholder={t("titleEnglishPlaceholder")}
                          className={`w-full h-11 rounded-2xl border px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 ${
                            isLockedForReview
                              ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                              : step1Submitted && !titleEn.trim()
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                                : "border-slate-200 focus:border-[#0F5244] focus:ring-[#0F5244]/10"
                          }`}
                        />
                        {step1Submitted && !titleEn.trim() && (
                          <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                            {t("validationTitleEnRequired")}
                          </span>
                        )}
                      </div>

                      <div>
                        <input
                          id="course-title-ar"
                          type="text"
                          value={titleAr}
                          disabled={isLockedForReview}
                          onChange={(e) => setTitleAr(e.target.value)}
                          placeholder={t("titleArabicPlaceholder")}
                          dir="rtl"
                          className={`w-full h-11 rounded-2xl border px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 text-right ${
                            isLockedForReview
                              ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                              : step1Submitted && !titleAr.trim()
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                                : "border-slate-200 focus:border-[#0F5244] focus:ring-[#0F5244]/10"
                          }`}
                        />
                        {step1Submitted && !titleAr.trim() && (
                          <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                            {t("validationTitleArRequired")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Description (EN & AR) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      {t("courseDescLabel")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <textarea
                          id="course-desc-en"
                          rows={4}
                          value={descEn}
                          disabled={isLockedForReview}
                          onChange={(e) => setDescEn(e.target.value)}
                          placeholder={t("descEnglishPlaceholder")}
                          className={`w-full rounded-2xl border p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 resize-none ${
                            isLockedForReview
                              ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                              : step1Submitted && !descEn.trim()
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                                : "border-slate-200 focus:border-[#0F5244] focus:ring-[#0F5244]/10"
                          }`}
                        />
                        {step1Submitted && !descEn.trim() && (
                          <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                            {t("validationDescEnRequired")}
                          </span>
                        )}
                      </div>

                      <div>
                        <textarea
                          id="course-desc-ar"
                          rows={4}
                          value={descAr}
                          disabled={isLockedForReview}
                          onChange={(e) => setDescAr(e.target.value)}
                          placeholder={t("descArabicPlaceholder")}
                          dir="rtl"
                          className={`w-full rounded-2xl border p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 resize-none text-right ${
                            isLockedForReview
                              ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                              : step1Submitted && !descAr.trim()
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                                : "border-slate-200 focus:border-[#0F5244] focus:ring-[#0F5244]/10"
                          }`}
                        />
                        {step1Submitted && !descAr.trim() && (
                          <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                            {t("validationDescArRequired")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Attributes & Pricing Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#0F5244]">
                    <Layers size={18} className="shrink-0 text-[#0F5244]" />
                    <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {t("attributesPricingTitle")}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Select */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700">
                        {t("categoryLabel")}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="course-category-select"
                        value={category}
                        disabled={isLockedForReview}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full h-11 rounded-2xl border px-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 bg-slate-50/50 ${
                          isLockedForReview
                            ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                            : step1Submitted && !category
                              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                              : "border-slate-200 focus:border-[#0F5244] focus:ring-[#0F5244]/10"
                        }`}
                      >
                        <option value="">{t("selectCategory")}</option>
                        {categoriesList.length > 0 ? (
                          categoriesList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="1">Programming</option>
                            <option value="4">Business Coaching</option>
                            <option value="5">Career Coaching</option>
                            <option value="2">Fitness Coaching</option>
                            <option value="6">Life & Mindfulness</option>
                            <option value="3">Nutrition</option>
                            <option value="7">Public Speaking</option>
                          </>
                        )}
                      </select>
                      {step1Submitted && !category && (
                        <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                          {t("validationCategoryRequired")}
                        </span>
                      )}
                    </div>

                    {/* Level Select */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700">
                        {t("levelLabel")}
                      </label>
                      <select
                        id="course-level-select"
                        value={level}
                        disabled={isLockedForReview}
                        onChange={(e) => setLevel(e.target.value)}
                        className={`w-full h-11 rounded-2xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-800 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50 ${
                          isLockedForReview
                            ? "bg-slate-100/80 cursor-not-allowed text-slate-600"
                            : ""
                        }`}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="all">All Levels</option>
                      </select>
                    </div>

                    {/* Primary Language */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700">
                        {t("primaryLanguageLabel")}
                      </label>
                      <select
                        id="course-language-select"
                        value={language}
                        disabled={isLockedForReview}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={`w-full h-11 rounded-2xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-800 focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 bg-slate-50/50 ${
                          isLockedForReview
                            ? "bg-slate-100/80 cursor-not-allowed text-slate-600"
                            : ""
                        }`}
                      >
                        <option value="Bilingual (EN/AR)">
                          {t("bilingual")}
                        </option>
                        <option value="Arabic">{t("arabic")}</option>
                        <option value="English">{t("english")}</option>
                      </select>
                    </div>

                    {/* Price Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700">
                        {t("priceLabel")}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                          $
                        </span>
                        <input
                          id="course-price-input"
                          type="text"
                          value={price}
                          disabled={isLockedForReview}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          className={`w-full h-11 rounded-2xl border pl-8 rtl:pl-3.5 rtl:pr-8 text-xs sm:text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 bg-slate-50/50 ${
                            isLockedForReview
                              ? "bg-slate-100/80 cursor-not-allowed text-slate-600 border-slate-200"
                              : step1Submitted &&
                                  (isNaN(Number(price)) || Number(price) < 0)
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                                : "border-slate-200 focus:border-[#0F5244] focus:ring-[#0F5244]/10"
                          }`}
                        />
                      </div>
                      {step1Submitted &&
                        (isNaN(Number(price)) || Number(price) < 0) && (
                          <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                            {t("validationPriceRequired")}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (1 Col): Big Cover Image Upload Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#0F5244]">
                  <ImageIcon size={18} className="shrink-0 text-[#0F5244]" />
                  <h2 className="font-extrabold text-slate-900 text-base">
                    {t("courseCoverTitle")}{" "}
                    <span className="text-rose-500">*</span>
                  </h2>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload Course Cover"
                  onClick={() => {
                    if (!isLockedForReview) fileInputRef.current?.click();
                  }}
                  onKeyDown={(e) => {
                    if (
                      !isLockedForReview &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => !isLockedForReview && e.preventDefault()}
                  onDrop={(e) => !isLockedForReview && handleDrop(e)}
                  className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] ${
                    isLockedForReview
                      ? "border-slate-200 bg-slate-50/50 cursor-default"
                      : step1Submitted && !isCoverValid
                        ? "border-rose-300 bg-rose-50/30 cursor-pointer"
                        : isCoverValid
                          ? "border-emerald-300 bg-emerald-50/20 cursor-pointer"
                          : "border-slate-300 hover:border-[#0F5244] hover:bg-emerald-50/20 cursor-pointer"
                  }`}
                >
                  {isCoverValid && coverPreview ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden group">
                      <Image
                        src={coverPreview}
                        alt="Course Cover"
                        width={400}
                        height={200}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                      {!isLockedForReview && (
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-extrabold bg-[#0F5244] px-4 py-2 rounded-xl shadow-md">
                            {t("changeCover")}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0F5244]">
                        <ImageIcon size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                          {t("dragDropImage")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t("clickToBrowse")}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t("coverDimensionsNotice")}
                      </p>
                    </>
                  )}
                </div>

                {step1Submitted && !isCoverValid && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{t("validationCoverRequired")}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions for Step 1 */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/70">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/instructor/courses`)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0F5244] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t("backToCourses")}</span>
              </button>

              <button
                type="button"
                onClick={handleContinueToCurriculum}
                className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md transition-all ${
                  isStep1Valid
                    ? "bg-[#0F5244] hover:bg-[#07382E] text-white cursor-pointer hover:shadow-lg hover:scale-[1.01]"
                    : "bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer shadow-none"
                }`}
              >
                <span>{t("continueToCurriculum")}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: CURRICULUM & VIDEOS BUILDER                       */}
        {/* ========================================================= */}
        {activeStep === "curriculum" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {t("curriculumBuilderTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  {t("curriculumBuilderSubtitle")}
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t("previewBtn")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isLockedForReview}
                  className={`px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                    isLockedForReview
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#0F5244]" />
                  )}
                  <span>{t("saveDraft")}</span>
                </button>

                {!isLockedForReview && (
                  <button
                    type="button"
                    onClick={addSection}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer w-fit"
                  >
                    <Plus size={16} />
                    <span>{t("addSectionBtn")}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Validation Banner if submitted with missing sections or videos */}
            {step2Submitted && !isStep2Valid && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="font-extrabold">
                    {t("validationFixErrorsPrompt")}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 font-medium">
                    {step2ErrorsList.map((errText, idx) => (
                      <li key={idx}>{errText}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Grid Layout: Left Sections List + Right Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* LEFT COLUMN: Sections & Lessons List */}
              <div className="lg:col-span-2 space-y-4">
                {sections.length === 0 ? (
                  <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle size={28} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">
                      {t("noSectionsAdded")}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {t("noSectionsAddedDesc")}
                    </p>
                    {!isLockedForReview && (
                      <button
                        type="button"
                        onClick={addSection}
                        className="mt-2 px-5 py-2.5 rounded-2xl bg-[#0F5244] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm"
                      >
                        <Plus size={16} />
                        <span>{t("addSectionBtn")}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  sections.map((section, sIdx) => {
                    const hasLessons =
                      section.lessons && section.lessons.length > 0;
                    return (
                      <div
                        key={section.id}
                        className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-2xs space-y-3.5 transition-all ${
                          !hasLessons && step2Submitted
                            ? "border-amber-300 bg-amber-50/10"
                            : "border-slate-200/90"
                        }`}
                      >
                        {/* Section Header Row */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <GripVertical
                              size={18}
                              className="text-slate-400 cursor-grab shrink-0"
                            />
                            <span className="font-black text-slate-900 text-sm sm:text-base truncate">
                              {section.title}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                              {t("lessonsCount", {
                                count: section.lessons.length,
                              })}
                            </span>
                          </div>

                          {!isLockedForReview && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Move Section Up / Down */}
                              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl">
                                <button
                                  type="button"
                                  disabled={sIdx === 0}
                                  onClick={() => moveSection(sIdx, "up")}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    sIdx === 0
                                      ? "opacity-30 cursor-not-allowed text-slate-400"
                                      : "text-slate-600 hover:text-[#0F5244] hover:bg-white"
                                  }`}
                                  title={
                                    isAr
                                      ? "نقل القسم للأعلى"
                                      : "Move section up"
                                  }
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  disabled={sIdx === sections.length - 1}
                                  onClick={() => moveSection(sIdx, "down")}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    sIdx === sections.length - 1
                                      ? "opacity-30 cursor-not-allowed text-slate-400"
                                      : "text-slate-600 hover:text-[#0F5244] hover:bg-white"
                                  }`}
                                  title={
                                    isAr
                                      ? "نقل القسم للأسفل"
                                      : "Move section down"
                                  }
                                >
                                  <ChevronDown size={14} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const newTitle = prompt(
                                    t("editSectionTitlePrompt"),
                                    section.title,
                                  );
                                  if (newTitle) {
                                    setSections(
                                      sections.map((s) =>
                                        s.id === section.id
                                          ? {
                                              ...s,
                                              title: newTitle,
                                              title_en: newTitle,
                                              title_ar: newTitle,
                                            }
                                          : s,
                                      ),
                                    );
                                  }
                                }}
                                className="p-2 text-slate-500 hover:text-[#0F5244] rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                                title={t("editSectionTitlePrompt")}
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSection(section.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Section Empty Warning Badge */}
                        {!hasLessons && (
                          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                            <AlertTriangle
                              size={15}
                              className="text-amber-600 shrink-0"
                            />
                            <span>{t("emptySectionWarning")}</span>
                          </div>
                        )}

                        {/* Sub-Lessons List */}
                        <div className="space-y-2">
                          {section.lessons.map((lesson, lIdx) => {
                            const hasVideo = Boolean(
                              lesson.video_url || lesson.video_public_id,
                            );
                            return (
                              <div
                                key={lesson.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border text-xs font-medium gap-3 transition-all ${
                                  !hasVideo
                                    ? "bg-rose-50/40 border-rose-200"
                                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <GripVertical
                                    size={16}
                                    className="text-slate-400 cursor-grab shrink-0"
                                  />
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                                      hasVideo
                                        ? "bg-emerald-100 text-[#0F5244]"
                                        : "bg-rose-100 text-rose-600"
                                    }`}
                                  >
                                    <PlayCircle size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-slate-900 font-bold block truncate">
                                      {isAr
                                        ? lesson.title_ar || lesson.title
                                        : lesson.title_en || lesson.title}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {hasVideo ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                          <Check size={10} />
                                          {lesson.video_public_id
                                            ? t("uploadedCloudinaryVideo")
                                            : t("externalVideoLink")}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-300">
                                          <AlertCircle size={10} />
                                          {t("noVideoWarning")}
                                        </span>
                                      )}

                                      {lesson.is_preview && (
                                        <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                          {t("freePreview")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                                  <span className="text-slate-500 text-xs font-mono">
                                    {lesson.duration ||
                                      `${lesson.duration_minutes || 5}:00`}
                                  </span>

                                  {!isLockedForReview ? (
                                    <>
                                      {/* Quick Toggle Free Preview */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleLessonPreview(
                                            section.id,
                                            lesson.id,
                                            Boolean(lesson.is_preview),
                                          )
                                        }
                                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                                          lesson.is_preview
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                        }`}
                                        title={
                                          isAr
                                            ? "تبديل المعاينة المجانية للدرس"
                                            : "Toggle Free Preview"
                                        }
                                      >
                                        <Eye
                                          size={11}
                                          className="inline mr-1 rtl:ml-1"
                                        />
                                        <span>{t("freePreview")}</span>
                                      </button>

                                      {/* Move Lesson Up / Down */}
                                      <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                                        <button
                                          type="button"
                                          disabled={lIdx === 0}
                                          onClick={() =>
                                            moveLesson(section.id, lIdx, "up")
                                          }
                                          className={`p-1 rounded transition-colors cursor-pointer ${
                                            lIdx === 0
                                              ? "opacity-30 cursor-not-allowed text-slate-400"
                                              : "text-slate-600 hover:text-[#0F5244] hover:bg-white"
                                          }`}
                                          title={
                                            isAr
                                              ? "نقل الدرس للأعلى"
                                              : "Move lesson up"
                                          }
                                        >
                                          <ChevronUp size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={
                                            lIdx === section.lessons.length - 1
                                          }
                                          onClick={() =>
                                            moveLesson(section.id, lIdx, "down")
                                          }
                                          className={`p-1 rounded transition-colors cursor-pointer ${
                                            lIdx === section.lessons.length - 1
                                              ? "opacity-30 cursor-not-allowed text-slate-400"
                                              : "text-slate-600 hover:text-[#0F5244] hover:bg-white"
                                          }`}
                                          title={
                                            isAr
                                              ? "نقل الدرس للأسفل"
                                              : "Move lesson down"
                                          }
                                        >
                                          <ChevronDown size={12} />
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditLessonModal(
                                            section.id,
                                            lesson,
                                          )
                                        }
                                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                          hasVideo
                                            ? "bg-slate-100 hover:bg-[#0F5244] hover:text-white text-slate-700"
                                            : "bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                                        }`}
                                      >
                                        <Edit2 size={12} />
                                        <span>
                                          {hasVideo
                                            ? t("editLesson")
                                            : t("fixLesson")}
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteLesson(section.id, lesson.id)
                                        }
                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Delete Lesson"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setShowPreviewModal(true)}
                                      className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 transition-all cursor-pointer"
                                    >
                                      <PlayCircle size={13} />
                                      <span>{t("previewBtn")}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Add Lesson Button inside section */}
                          {!isLockedForReview && (
                            <button
                              type="button"
                              onClick={() => openAddLessonModal(section.id)}
                              className="w-full mt-2 py-2.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-600 hover:border-[#0F5244] hover:text-[#0F5244] hover:bg-emerald-50/40 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Plus size={14} />
                              <span>{t("addVideoLesson")}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Add Another Section Button */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={addSection}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") addSection();
                  }}
                  className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-100/40 p-6 text-center hover:border-[#0F5244] hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                >
                  <Plus
                    size={22}
                    className="text-slate-500 group-hover:text-[#0F5244] transition-colors"
                  />
                  <span className="text-xs sm:text-sm font-extrabold text-slate-700 group-hover:text-[#0F5244]">
                    {t("clickToAddSection")}
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: Curriculum Checklist & Stats Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
                <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                  {t("checklistTitle")}
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-600">
                      {t("totalSections")}
                    </span>
                    <span className="font-black text-[#0F5244] text-sm">
                      {sections.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-600">
                      {t("totalLessons")}
                    </span>
                    <span className="font-black text-[#0F5244] text-sm">
                      {totalLessonsCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-600">
                      {t("totalDuration")}
                    </span>
                    <span className="font-black text-slate-800 text-sm">
                      {totalDurationMins} {t("minutes")}
                    </span>
                  </div>
                </div>

                {/* Validation Status Box */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div
                    className={`flex items-center gap-2 text-xs font-extrabold ${sections.length > 0 ? "text-emerald-700" : "text-rose-600"}`}
                  >
                    {sections.length > 0 ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span>{t("checklistSectionsPassed")}</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs font-extrabold ${totalLessonsCount > 0 && totalVideosAttachedCount === totalLessonsCount ? "text-emerald-700" : "text-rose-600"}`}
                  >
                    {totalLessonsCount > 0 &&
                    totalVideosAttachedCount === totalLessonsCount ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span>
                      {t("checklistVideosPassed")} ({totalVideosAttachedCount}/
                      {totalLessonsCount})
                    </span>
                  </div>
                </div>

                {/* Cover Thumbnail Preview */}
                {coverPreview && (
                  <div className="pt-2">
                    <span className="block text-[11px] font-extrabold text-slate-500 mb-1.5">
                      {t("courseCoverTitle")}
                    </span>
                    <div className="h-28 w-full rounded-2xl overflow-hidden border border-slate-200">
                      <Image
                        src={coverPreview}
                        alt="Cover"
                        width={300}
                        height={120}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Navigation for Step 2 */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setActiveStep("info");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t("backToInfo")}</span>
              </button>

              <button
                type="button"
                onClick={handleContinueToReview}
                className="px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{t("continueToReview")}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: REVIEW & PUBLISH VIEW                             */}
        {/* ========================================================= */}
        {activeStep === "review" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {t("reviewTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  {t("reviewSubtitle")}
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t("previewBtn")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#0F5244]" />
                  )}
                  <span>{t("saveDraft")}</span>
                </button>
              </div>
            </div>

            {/* Validation Checklist Alert Banner */}
            {isStep1Valid && isStep2Valid ? (
              <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black">{t("readyToPublish")}</h3>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    {t("allRequirementsMet")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3.5 shadow-2xs">
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="text-sm font-black">
                    {t("missingItemsAlert")}
                  </h3>
                  <div className="flex gap-2.5 flex-wrap">
                    {!isStep1Valid && (
                      <button
                        type="button"
                        onClick={() => setActiveStep("info")}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-2xs hover:bg-rose-700 cursor-pointer"
                      >
                        {t("goToStep1")}
                      </button>
                    )}
                    {!isStep2Valid && (
                      <button
                        type="button"
                        onClick={() => setActiveStep("curriculum")}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-2xs hover:bg-rose-700 cursor-pointer"
                      >
                        {t("goToStep2")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Course Summary Hero Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Cover Image */}
                <div className="relative w-full md:w-64 h-44 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs bg-slate-100">
                  {coverPreview ? (
                    <Image
                      src={coverPreview}
                      alt="Course Cover"
                      width={400}
                      height={250}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={36} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                    <span className="px-3 py-1 rounded-full bg-[#0F5244] text-white text-xs font-black shadow-md">
                      {Number(price) > 0 ? `$${price}` : t("freeCourse")}
                    </span>
                  </div>
                </div>

                {/* Course Main Details */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#0F5244] border border-emerald-200/80 text-xs font-extrabold">
                      {categoryDisplayName}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold uppercase">
                      {level}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold">
                      {language}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {titleEn}
                  </h2>
                  {titleAr && (
                    <h3 dir="rtl" className="text-lg font-bold text-slate-700">
                      {titleAr}
                    </h3>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">
                    {descEn}
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <BookOpen className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {t("totalSections")}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {sections.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <Film className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {t("totalLessons")}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {totalLessonsCount}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <Clock className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {t("totalDuration")}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {totalDurationMins} {t("minutes")}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <DollarSign className="w-5 h-5 text-[#0F5244] mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {t("priceLabel")}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    ${price}
                  </span>
                </div>
              </div>
            </div>

            {/* Curriculum Breakdown Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#0F5244]" />
                  <span>{t("curriculumSummary")}</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setActiveStep("curriculum")}
                  className="text-xs font-extrabold text-[#0F5244] hover:underline"
                >
                  {t("goToStep2")}
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((sec, sIdx) => (
                  <div
                    key={sec.id}
                    className="rounded-2xl border border-slate-200/80 p-4 space-y-3 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {sIdx + 1}. {sec.title}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        {t("lessonsCount", { count: sec.lessons.length })}
                      </span>
                    </div>

                    <div className="space-y-2 pl-4 rtl:pl-0 rtl:pr-4 border-l-2 rtl:border-l-0 rtl:border-r-2 border-slate-200">
                      {sec.lessons.map((les, lIdx) => {
                        const hasVideo = Boolean(
                          les.video_url || les.video_public_id,
                        );
                        return (
                          <div
                            key={les.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <PlayCircle
                                size={15}
                                className="text-[#0F5244] shrink-0"
                              />
                              <span className="font-bold text-slate-800 truncate">
                                {lIdx + 1}.{" "}
                                {isAr
                                  ? les.title_ar || les.title
                                  : les.title_en || les.title}
                              </span>
                              {les.is_preview && (
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                                  {t("preview")}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {hasVideo ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {t("videoAttached")}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  {t("noVideoWarning")}
                                </span>
                              )}
                              <span className="text-slate-400 font-mono text-[11px]">
                                {les.duration}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions for Step 3 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setActiveStep("curriculum");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t("backToCurriculum")}</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {isLockedForReview ? (
                  <div className="px-6 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-black flex items-center gap-2 select-none shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                    <span>{t("statusUnderReviewLockedNotice")}</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      className="px-5 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>{t("saveDraft")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePublishCourse}
                      disabled={isPublishing || !isStep1Valid || !isStep2Valid}
                      className={`px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2.5 transition-all shadow-md ${
                        isStep1Valid && isStep2Valid
                          ? "bg-[#0F5244] hover:bg-[#07382E] text-white cursor-pointer hover:shadow-xl hover:scale-[1.02]"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>{t("publishing")}</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>{t("publishCourse")}</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Edit / Video Upload Modal */}
      {editingLessonInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#0F5244] flex items-center justify-center">
                  <PlayCircle className="h-5 w-5 text-[#0F5244]" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingLessonInfo.isNew
                    ? t("addNewLesson")
                    : t("editLesson")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLessonInfo(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Title EN & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("lessonTitleEn")}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={
                      editingLessonInfo.lesson.title_en ??
                      editingLessonInfo.lesson.title ??
                      ""
                    }
                    onChange={(e) =>
                      setEditingLessonInfo({
                        ...editingLessonInfo,
                        lesson: {
                          ...editingLessonInfo.lesson,
                          title_en: e.target.value,
                          title: isAr
                            ? editingLessonInfo.lesson.title
                            : e.target.value,
                        },
                      })
                    }
                    placeholder={t("lessonTitleEnPlaceholder")}
                    className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("lessonTitleAr")}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingLessonInfo.lesson.title_ar ?? ""}
                    onChange={(e) =>
                      setEditingLessonInfo({
                        ...editingLessonInfo,
                        lesson: {
                          ...editingLessonInfo.lesson,
                          title_ar: e.target.value,
                          title: isAr
                            ? e.target.value
                            : editingLessonInfo.lesson.title,
                        },
                      })
                    }
                    placeholder={t("lessonTitleArPlaceholder")}
                    className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244] text-right"
                  />
                </div>
              </div>

              {/* Duration & Free Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("lessonDuration")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={editingLessonInfo.lesson.duration_minutes ?? 5}
                    onChange={(e) =>
                      setEditingLessonInfo({
                        ...editingLessonInfo,
                        lesson: {
                          ...editingLessonInfo.lesson,
                          duration_minutes: Number(e.target.value),
                          duration: `${e.target.value}:00`,
                        },
                      })
                    }
                    className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F5244]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        editingLessonInfo.lesson.is_preview ||
                        editingLessonInfo.lesson.isFreePreview,
                      )}
                      onChange={(e) =>
                        setEditingLessonInfo({
                          ...editingLessonInfo,
                          lesson: {
                            ...editingLessonInfo.lesson,
                            is_preview: e.target.checked,
                            isFreePreview: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-[#0F5244] focus:ring-[#0F5244] accent-[#0F5244]"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {t("freePreview")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Video Uploader Component */}
              <div className="pt-2">
                <LessonVideoUploader
                  courseId={courseId}
                  sectionId={editingLessonInfo.sectionId}
                  lessonId={
                    editingLessonInfo.isNew
                      ? undefined
                      : editingLessonInfo.lesson.id
                  }
                  initialVideoUrl={editingLessonInfo.lesson.video_url}
                  isAr={isAr}
                  lessonData={{
                    title_ar: editingLessonInfo.lesson.title_ar,
                    title_en: editingLessonInfo.lesson.title_en,
                    duration_minutes: editingLessonInfo.lesson.duration_minutes,
                    is_preview: editingLessonInfo.lesson.is_preview,
                  }}
                  onUploadComplete={(result) => {
                    setEditingLessonInfo((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        lesson: {
                          ...prev.lesson,
                          video_url: result.video_url,
                          video_public_id: result.public_id,
                          duration_minutes: result.duration
                            ? Math.round(result.duration / 60)
                            : prev.lesson.duration_minutes,
                          duration: result.duration
                            ? `${Math.round(result.duration / 60)}:00`
                            : prev.lesson.duration,
                        },
                      };
                    });
                  }}
                  onVideoRemove={() => {
                    setEditingLessonInfo((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        lesson: {
                          ...prev.lesson,
                          video_url: undefined,
                          video_public_id: undefined,
                        },
                      };
                    });
                  }}
                  onExternalUrlChange={(url) => {
                    setEditingLessonInfo((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        lesson: {
                          ...prev.lesson,
                          video_url: url,
                          video_public_id: undefined,
                        },
                      };
                    });
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingLessonInfo(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                {t("cancel")}
              </button>

              <button
                type="button"
                onClick={() => saveEditedLesson(editingLessonInfo.lesson)}
                className="px-5 py-2 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                {t("saveLesson")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Submitted Celebration Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#0F5244] flex items-center justify-center mx-auto shadow-sm">
              <Sparkles size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                {t("courseSubmittedSuccess")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {t("courseSubmittedSuccessDesc")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                router.push(`/${locale}/instructor/courses`);
              }}
              className="w-full py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer"
            >
              {t("backToCourses")}
            </button>
          </div>
        </div>
      )}

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
