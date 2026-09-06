"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Settings,
  Plus,
  Star,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Archive,
  AlertTriangle,
  X,
  AlertCircle,
  Search,
  Loader2,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Eye,
  Send,
  Sparkles,
  TrendingUp,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { updateUser } from "@/features/auth/slice";
import { userService } from "@/services/userService";
import { tokenManager } from "@/lib/tokenManager";
import { Sidebar } from "@/components/layout/Sidebar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { instructorCourseService } from "@/services/instructorCourseService";
import { courseService } from "@/services/courseService";
import {
  getSavedInstructorOverrides,
  normalizeInstructorSlug,
  getSavedCourseStatus,
  saveCourseStatus,
  removeCourseStatus,
} from "@/lib/instructorProfile";

import { ArchiveCourseModal } from "@/components/modals/ArchiveCourseModal";
import { DeleteCourseModal } from "@/components/modals/DeleteCourseModal";
import { ChangeEmailModal } from "@/components/modals/ChangeEmailModal";
import { InstructorPendingModal } from "@/components/modals/InstructorPendingModal";
import {
  CourseIncompleteModal,
  IncompleteItem,
} from "@/components/modals/CourseIncompleteModal";
import { CourseCard } from "@/components/course/CourseCard";
import { Toast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  InstructorOverviewTab,
  InstructorCoursesTab,
  InstructorStudentsTab,
  InstructorPayoutTab,
  InstructorSettingsTab,
} from "./tabs";

interface InstructorWorkspaceProps {
  initialTab?: "overview" | "courses" | "students" | "payout" | "settings";
  hideSidebar?: boolean;
}

export function InstructorWorkspace({
  initialTab = "courses",
  hideSidebar = true,
}: InstructorWorkspaceProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tStudent = useTranslations("studentSettings");
  const tChangeEmail = useTranslations("changeEmailModal");
  const tDash = useTranslations("instructorDashboard");
  const tIncomplete = useTranslations("courseIncompleteModal");

  const authUser = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const approvalStatus: "approved" | "pending" | "rejected" =
    (authUser?.instructorStatus as any) || "approved";

  const initialStatus = approvalStatus;

  // Active Workspace Section - default to settings if not approved
  const defaultTab =
    initialStatus !== "approved" && initialTab !== "settings"
      ? "settings"
      : initialTab;
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "students" | "payout" | "settings"
  >(defaultTab);
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<
    "all" | "active" | "published" | "pending_review" | "draft" | "archived"
  >("active");

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingFeatureName, setPendingFeatureName] = useState<
    string | undefined
  >(undefined);
  const [archiveModalCourseId, setArchiveModalCourseId] = useState<
    string | null
  >(null);
  const [deleteModalCourse, setDeleteModalCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [incompleteModalData, setIncompleteModalData] = useState<{
    isOpen: boolean;
    courseId: string;
    courseTitle?: string;
    missingItems: IncompleteItem[];
  }>({
    isOpen: false,
    courseId: "",
    courseTitle: "",
    missingItems: [],
  });

  // Instructor Courses State
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(
    null,
  );

  // Fetch real instructor courses strictly for the authenticated instructor
  const fetchMyCourses = useCallback(async () => {
    if (!tokenManager.hasSession()) {
      setCourses([]);
      setIsLoadingCourses(false);
      return;
    }

    setIsLoadingCourses(true);
    try {
      const data = await instructorCourseService.getMyCourses();
      const list = Array.isArray(data) ? data : data?.results || [];

      const realCourses = list.map((c: any) => {
        const rawStatus = String(c.status || "").toLowerCase();
        const savedStatus = getSavedCourseStatus(c.id);
        let normalizedStatus:
          | "published"
          | "pending_review"
          | "draft"
          | "rejected"
          | "archived" = "draft";
        if (
          rawStatus === "pending_review" ||
          rawStatus === "pending" ||
          rawStatus === "under_review" ||
          rawStatus === "in_review"
        ) {
          normalizedStatus = "pending_review";
        } else if (
          rawStatus === "published" ||
          rawStatus === "approved" ||
          (c.is_published && rawStatus !== "draft" && rawStatus !== "rejected")
        ) {
          removeCourseStatus(c.id);
          normalizedStatus = "published";
        } else if (rawStatus === "rejected" || rawStatus === "declined") {
          removeCourseStatus(c.id);
          normalizedStatus = "rejected";
        } else if (rawStatus === "archived") {
          normalizedStatus = "archived";
        } else if (savedStatus === "pending_review") {
          normalizedStatus = "pending_review";
        } else {
          normalizedStatus = "draft";
        }

        return {
          id: String(c.id),
          title: isAr
            ? c.title_ar || c.title_en || c.title
            : c.title_en || c.title_ar || c.title,
          titleEn: c.title_en || c.title || tInst("untitledCourse"),
          titleAr: c.title_ar || c.title || tInst("untitledCourse"),
          studentsCount: Number(c.students_count || c.total_students || 0),
          rating: Number(c.rating || 0),
          reviewsCount: Number(c.reviews_count || c.reviewsCount || 0),
          revenue: Number(
            c.revenue ||
              (c.price ? Number(c.price) * (c.students_count || 0) : 0),
          ),
          status: normalizedStatus,
          price: Number(c.price) || 0,
          level: c.level || "Beginner",
          image:
            c.cover_image ||
            c.coverImage ||
            (typeof c.image === "string" &&
            !c.image.includes("unsplash.com/photo-1516321318423")
              ? c.image
              : ""),
          rejectionReason:
            (isAr ? c.rejection_reason_ar : c.rejection_reason_en) ||
            c.rejection_reason ||
            c.rejectionReason ||
            c.reject_reason ||
            c.admin_feedback ||
            c.review_feedback ||
            c.feedback ||
            c.reason ||
            c.rejection_comment ||
            "",
          sections: c.sections || [],
          enrolledStudents: Array.isArray(c.enrolled_students)
            ? c.enrolled_students
            : Array.isArray(c.students)
              ? c.students
              : [],
          isReal: true,
        };
      });

      // Set the authenticated instructor's real courses
      setCourses(realCourses);

      // Dynamically populate enrolled students across all courses
      const allDynamicStudents: any[] = [];
      realCourses.forEach((c: any) => {
        const count = Number(c.studentsCount || 0);
        if (
          Array.isArray(c.enrolledStudents) &&
          c.enrolledStudents.length > 0
        ) {
          c.enrolledStudents.forEach((st: any, idx: number) => {
            allDynamicStudents.push({
              id: String(st.id || `${c.id}-st-${idx + 1}`),
              courseId: String(c.id),
              name:
                st.full_name ||
                st.name ||
                st.email?.split("@")[0] ||
                (isAr ? `طالب مسجل ${idx + 1}` : `Student ${idx + 1}`),
              email: st.email || `student${idx + 1}@example.com`,
              avatar: st.avatar || null,
              course: isAr ? c.titleAr : c.titleEn,
              date: st.enrolled_at
                ? new Date(st.enrolled_at).toLocaleDateString(
                    isAr ? "ar-EG" : "en-US",
                  )
                : isAr
                  ? "منذ يومين"
                  : "2 days ago",
              progress: typeof st.progress === "number" ? st.progress : 65,
              status: st.is_completed ? "completed" : "active",
            });
          });
        }
      });
      setStudents(allDynamicStudents);
    } catch (err) {
      console.warn("Could not fetch instructor courses from backend API:", err);
      setCourses([]);
      setStudents([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Enrolled Students Data & Drawer State
  const [students, setStudents] = useState<any[]>([]);
  const [expandedCourseStudentsId, setExpandedCourseStudentsId] = useState<
    string | null
  >(null);

  // Avatar & Profile State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    authUser?.avatar || null,
  );

  // Form State
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || authUser?.phone_number || "",
    headline: authUser?.headline || "",
    specialization: authUser?.specialization || "",
    experienceYears: (authUser as any)?.experienceYears || 0,
    hourlyRate: "",
    bio: authUser?.bio || "",
    payoutMethod: "bank",
    bankIban: (authUser as any)?.bankIban || "",
    paypalEmail: authUser?.email || "",
    autoPayout: true,
    introVideoUrl: "",
    website: "",
    linkedin: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const isSettingsInitializedRef = useRef(false);

  useEffect(() => {
    if (isSettingsInitializedRef.current) return;
    if (!authUser) return;

    const userFullName = authUser?.fullName || authUser?.name || "";
    const activeSlug = userFullName
      ? normalizeInstructorSlug(userFullName)
      : "";
    const overrides = activeSlug
      ? {
          ...(getSavedInstructorOverrides(activeSlug) || {}),
          ...(getSavedInstructorOverrides(`inst-${activeSlug}`) || {}),
        }
      : {};

    const rawHeadline = authUser?.headline || overrides.headline || "";
    const isStudentHeadline =
      !rawHeadline ||
      rawHeadline.toLowerCase().includes("student") ||
      rawHeadline.includes("طالب");
    const safeHeadline = isStudentHeadline
      ? tInst("defaultHeadline")
      : rawHeadline;

    setFormData((prev) => ({
      ...prev,
      fullName:
        authUser?.fullName || authUser?.name || overrides.name || prev.fullName,
      headline: safeHeadline || prev.headline,
      email: authUser?.email || prev.email,
    }));
    setAvatarPreview(authUser?.avatar || overrides.avatar || null);
    isSettingsInitializedRef.current = true;
  }, [authUser]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateMyProfile({
        full_name: formData.fullName.trim(),
        phone_number: (formData as any).phone?.trim() || undefined,
        preferred_language: locale,
      });

      dispatch(
        updateUser({
          fullName: updated.full_name || formData.fullName.trim(),
          name: updated.full_name || formData.fullName.trim(),
          phone: updated.phone_number || undefined,
          phone_number: updated.phone_number || undefined,
          preferred_language: updated.preferred_language || locale,
          preferredLanguage: updated.preferred_language || locale,
        }),
      );

      setToastMessage(tInst("profileSavedToast"));
    } catch (err: any) {
      console.warn("[InstructorWorkspace] Error saving profile:", err);
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (isAr
          ? "فشل حفظ الملف الشخصي. يرجى المحاولة مرة أخرى."
          : "Failed to save profile. Please try again.");
      setToastMessage(
        typeof errorMsg === "string" ? errorMsg : tInst("profileSavedToast"),
      );
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    try {
      const updated = await userService.uploadAvatar(file);
      if (updated?.avatar) {
        setAvatarPreview(updated.avatar);
        dispatch(updateUser({ avatar: updated.avatar }));
      }
      setToastMessage(
        isAr
          ? "تم تحديث الصورة الشخصية بنجاح"
          : "Profile picture updated successfully",
      );
    } catch (err) {
      console.warn("Could not upload avatar:", err);
    }
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      setSubmittingCourseId(courseId);

      // 1. Fetch full course details to inspect all sections, lessons, and cover image
      let detailedCourse = courses.find(
        (c) => String(c.id) === String(courseId),
      );
      try {
        const fetched =
          await instructorCourseService.getInstructorCourse(courseId);
        if (fetched) {
          detailedCourse = {
            ...detailedCourse,
            ...fetched,
            sections: fetched.sections || detailedCourse?.sections || [],
            cover_image:
              fetched.cover_image ||
              fetched.coverImage ||
              detailedCourse?.image,
          };
        }
      } catch (fetchErr) {
        console.warn(
          "Could not fetch full course for validation check:",
          fetchErr,
        );
      }

      // 2. Comprehensive Course Completeness Validation (Image, Sections, Lessons, Videos)
      const hasCover = Boolean(
        detailedCourse?.cover_image ||
        detailedCourse?.coverImage ||
        (detailedCourse?.image &&
          typeof detailedCourse.image === "string" &&
          !detailedCourse.image.includes("unsplash.com/photo-1516321318423")),
      );

      const sections = detailedCourse?.sections || [];
      const hasSections = Array.isArray(sections) && sections.length > 0;
      const hasLessons =
        hasSections &&
        sections.every(
          (s: any) => Array.isArray(s.lessons) && s.lessons.length > 0,
        );
      const hasVideos =
        hasLessons &&
        sections.every((s: any) =>
          s.lessons.every((l: any) =>
            Boolean(l.video_url || l.video_public_id || l.videoUrl),
          ),
        );

      const checklist: IncompleteItem[] = [
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

      const isIncomplete = checklist.some((item) => !item.isComplete);
      if (isIncomplete) {
        setIncompleteModalData({
          isOpen: true,
          courseId: String(courseId),
          courseTitle:
            (isAr
              ? detailedCourse?.titleAr || detailedCourse?.title
              : detailedCourse?.titleEn || detailedCourse?.title) || "",
          missingItems: checklist,
        });
        return;
      }

      const previousCourse = courses.find(
        (c) => String(c.id) === String(courseId),
      );
      const previousStatus = previousCourse?.status || "draft";

      // Persist pending_review locally so it stays across refetches
      saveCourseStatus(courseId, "pending_review");

      // Optimistic local update: immediately switch to pending_review and clear actions
      setCourses((prev) =>
        prev.map((c) =>
          String(c.id) === String(courseId)
            ? { ...c, status: "pending_review", rejectionReason: "" }
            : c,
        ),
      );

      try {
        await instructorCourseService.submitForReview(courseId);
        setToastMessage(tInst("courseSubmittedToast"));
        await fetchMyCourses();
      } catch (err: any) {
        console.error("Could not submit course for review via API:", err);
        removeCourseStatus(courseId);
        // Revert on actual API failure
        setCourses((prev) =>
          prev.map((c) =>
            String(c.id) === String(courseId)
              ? { ...c, status: previousStatus }
              : c,
          ),
        );
        const errorMsg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          tInst("submitReviewFailed");
        setToastMessage(errorMsg);
      }
    } finally {
      setSubmittingCourseId(null);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleArchiveCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course || course.status === "pending_review") return;
    if (course.status !== "archived") {
      setArchiveModalCourseId(courseId);
    } else {
      confirmArchiveCourse(courseId);
    }
  };

  const confirmArchiveCourse = async (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse || targetCourse.status === "pending_review") return;
    const isCurrentlyArchived = targetCourse?.status === "archived";
    const nextStatus = isCurrentlyArchived ? "published" : "archived";

    try {
      await instructorCourseService.updateCourse(courseId, {
        status: nextStatus,
      });
      if (isCurrentlyArchived) {
        setToastMessage(tInst("courseUnarchivedToast"));
      } else {
        setToastMessage(tInst("courseArchivedToast"));
      }
      fetchMyCourses();
    } catch (err: any) {
      console.warn("Could not archive/unarchive course via API:", err);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: nextStatus } : c)),
      );
      if (isCurrentlyArchived) {
        setToastMessage(tInst("courseUnarchivedToast"));
      } else {
        setToastMessage(tInst("courseArchivedToast"));
      }
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const confirmDeleteCourse = async () => {
    if (!deleteModalCourse) return;
    const courseId = deleteModalCourse.id;
    const targetCourse = courses.find((c) => String(c.id) === String(courseId));
    if (targetCourse?.status === "pending_review") {
      setDeleteModalCourse(null);
      return;
    }
    setIsDeletingCourse(true);
    try {
      const res = await instructorCourseService.deleteCourse(courseId);

      if (res.status === 204) {
        // 204 No Content: Course had no enrollments and was permanently deleted
        setToastMessage(tInst("courseDeletedToast"));
        setCourses((prev) =>
          prev.filter((c) => String(c.id) !== String(courseId)),
        );
      } else if (res.archived || res.status === 200) {
        // 200 OK: Course had enrollments -> automatically archived
        setToastMessage(tInst("courseArchivedNotice"));
        setCourses((prev) =>
          prev.map((c) =>
            String(c.id) === String(courseId)
              ? { ...c, status: "archived" }
              : c,
          ),
        );
      } else {
        setToastMessage(tInst("courseDeletedToast"));
        setCourses((prev) =>
          prev.filter((c) => String(c.id) !== String(courseId)),
        );
      }

      // Re-fetch courses from backend
      await fetchMyCourses();
    } catch (err: any) {
      console.error("Delete course error:", err);
      const status = err?.response?.status;
      if (status === 401) {
        setToastMessage(tInst("deleteCourseUnauthorized"));
      } else if (status === 403) {
        setToastMessage(tInst("deleteCourseForbidden"));
      } else {
        const errorDetail =
          err?.response?.data?.detail || err?.response?.data?.message;
        setToastMessage(errorDetail || tInst("deleteCourseError"));
      }
    } finally {
      setIsDeletingCourse(false);
      setDeleteModalCourse(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getCourseStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return tInst("statusPublished");
      case "pending_review":
        return tInst("statusPendingReview");
      case "draft":
        return tInst("statusDraft");
      case "rejected":
        return tInst("statusRejected");
      case "archived":
        return tInst("statusArchived");
      default:
        return status;
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.course.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  return (
    <div
      className="w-full space-y-4 sm:space-y-6 font-sans"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Change Email Modal */}
      {showEmailModal && (
        <ChangeEmailModal
          isOpen={showEmailModal}
          currentEmail={formData.email}
          onClose={() => setShowEmailModal(false)}
          onConfirmEmailChange={(newEmail: string) => {
            setFormData((prev) => ({ ...prev, email: newEmail }));
            setToastMessage(tChangeEmail("success"));
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />
      )}

      {/* Top Instructor Workspace Banner / Header Card (Only rendered standalone) */}
      {!hideSidebar && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-start">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E6F3EF] border-2 border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Instructor"
                    width={80}
                    height={80}
                    unoptimized
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="font-extrabold text-2xl text-[#0F5244]">
                    {formData.fullName.charAt(0)}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900">
                  {formData.fullName}
                </h1>
                <VerifiedBadge size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {formData.headline}
              </p>
              <p className="text-[11px] text-slate-400 font-medium pt-0.5">
                {formData.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Approval Banner (Only rendered standalone) */}
      {!hideSidebar && (
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-start">
            <div
              className={`p-2 rounded-2xl border shrink-0 ${
                approvalStatus === "approved"
                  ? "bg-emerald-50 text-[#0F5244] border-emerald-200"
                  : approvalStatus === "rejected"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {approvalStatus === "approved" ? (
                <ShieldCheck className="h-5 w-5" />
              ) : approvalStatus === "rejected" ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  {tInst("approvalStatusTitle")}
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    approvalStatus === "approved"
                      ? "bg-emerald-100 text-[#0F5244] border border-emerald-200"
                      : approvalStatus === "rejected"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200/90 inline-flex items-center gap-1.5"
                  }`}
                >
                  {approvalStatus === "pending" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <span>
                    {approvalStatus === "approved"
                      ? tInst("approvedBadge")
                      : approvalStatus === "rejected"
                        ? tInst("rejectedBadge")
                        : tInst("underReviewBadge")}
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {approvalStatus === "approved"
                  ? tInst("approvedDescription")
                  : approvalStatus === "rejected"
                    ? tInst("rejectedDescription")
                    : tInst("pendingNotice")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div
        className={
          hideSidebar
            ? "w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-10 shadow-2xs"
            : "flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-10 items-start"
        }
      >
        {!hideSidebar && (
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tabId: string) => {
              if (approvalStatus !== "approved" && tabId !== "settings") {
                const tabLabels: Record<string, string> = {
                  overview: tInst("analyticsRevenue"),
                  courses: tInst("courseLifecycle"),
                  students: tInst("enrolledStudentsNav"),
                  payout: tInst("payoutAndBilling"),
                };
                setPendingFeatureName(tabLabels[tabId] || tabId);
                setShowPendingModal(true);
                return;
              }
              setActiveTab(tabId as any);
            }}
            items={[
              {
                id: "overview",
                label: tInst("analyticsRevenue"),
                icon: LayoutDashboard,
              },
              {
                id: "courses",
                label: tInst("courseLifecycle"),
                icon: BookOpen,
              },
              {
                id: "students",
                label: tInst("enrolledStudentsNav"),
                icon: Users,
              },
              {
                id: "payout",
                label: tInst("payoutAndBilling"),
                icon: CreditCard,
              },
              { id: "settings", label: t("accountSettings"), icon: Settings },
            ]}
            user={{
              name: formData.fullName,
              role: tInst("roleInstructor"),
              avatarUrl: avatarPreview,
              isApproved: approvalStatus === "approved",
            }}
          />
        )}

        {/* Display Area */}
        <div
          className={
            hideSidebar
              ? "w-full"
              : "flex-1 w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-10 shadow-2xs"
          }
        >
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <InstructorOverviewTab courses={courses} />
              </motion.div>
            )}

            {activeTab === "courses" && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <InstructorCoursesTab
                  courses={courses}
                  isLoadingCourses={isLoadingCourses}
                  courseFilter={courseFilter}
                  setCourseFilter={setCourseFilter}
                  courseSearch={courseSearch}
                  setCourseSearch={setCourseSearch}
                  students={students}
                  expandedCourseStudentsId={expandedCourseStudentsId}
                  setExpandedCourseStudentsId={setExpandedCourseStudentsId}
                  handleSubmitForReview={handleSubmitForReview}
                  submittingCourseId={submittingCourseId}
                  handleArchiveCourse={handleArchiveCourse}
                  setDeleteModalCourse={setDeleteModalCourse}
                />
              </motion.div>
            )}

            {activeTab === "students" && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <InstructorStudentsTab
                  students={students}
                  studentSearch={studentSearch}
                  setStudentSearch={setStudentSearch}
                  isLoading={isLoadingCourses}
                />
              </motion.div>
            )}

            {activeTab === "payout" && (
              <motion.div
                key="payout"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <InstructorPayoutTab
                  formData={formData}
                  courses={courses}
                  onSavePayout={async (payoutData) => {
                    setFormData((prev) => ({ ...prev, ...payoutData }));
                    setToastMessage(
                      isAr
                        ? "تم حفظ إعدادات الدفع بنجاح"
                        : "Payout settings saved successfully",
                    );
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <InstructorSettingsTab
                  formData={formData}
                  avatarPreview={avatarPreview}
                  onAvatarChange={handleAvatarChange}
                  onInputChange={handleInputChange}
                  onSaveSettings={handleSaveSettings}
                  isSaving={isSaving}
                  onOpenEmailModal={() => setShowEmailModal(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ArchiveCourseModal
        isOpen={!!archiveModalCourseId}
        onClose={() => setArchiveModalCourseId(null)}
        onConfirm={() => {
          if (archiveModalCourseId) {
            confirmArchiveCourse(archiveModalCourseId);
          }
        }}
        courseTitle={
          courses.find((c) => c.id === archiveModalCourseId)?.[
            isAr ? "titleAr" : "titleEn"
          ]
        }
      />

      <DeleteCourseModal
        isOpen={!!deleteModalCourse}
        onClose={() => {
          if (!isDeletingCourse) setDeleteModalCourse(null);
        }}
        onConfirm={confirmDeleteCourse}
        courseTitle={deleteModalCourse?.title}
        isLoading={isDeletingCourse}
      />

      <InstructorPendingModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        featureName={pendingFeatureName}
      />

      <CourseIncompleteModal
        isOpen={incompleteModalData.isOpen}
        onClose={() =>
          setIncompleteModalData((prev) => ({ ...prev, isOpen: false }))
        }
        courseId={incompleteModalData.courseId}
        courseTitle={incompleteModalData.courseTitle}
        missingItems={incompleteModalData.missingItems}
      />
    </div>
  );
}
