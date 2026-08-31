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
  User,
  Sparkles,
  TrendingUp,
  Layers,
  Check,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { tokenManager } from "@/lib/tokenManager";
import { Sidebar } from "@/components/layout/Sidebar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { instructorCourseService } from "@/services/instructorCourseService";
import { courseService } from "@/services/courseService";
import { getSavedInstructorOverrides, normalizeInstructorSlug, getSavedCourseStatus, saveCourseStatus, removeCourseStatus } from "@/lib/mockInstructors";

import { ArchiveCourseModal } from "@/components/modals/ArchiveCourseModal";
import { DeleteCourseModal } from "@/components/modals/DeleteCourseModal";
import { ChangeEmailModal } from "@/components/modals/ChangeEmailModal";
import { InstructorPendingModal } from "@/components/modals/InstructorPendingModal";
import { CourseIncompleteModal, IncompleteItem } from "@/components/modals/CourseIncompleteModal";

interface InstructorWorkspaceProps {
  initialTab?: "overview" | "courses" | "students" | "payout" | "settings";
  hideSidebar?: boolean;
}

export function InstructorWorkspace({ initialTab = "courses", hideSidebar = true }: InstructorWorkspaceProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tStudent = useTranslations("studentSettings");
  const tChangeEmail = useTranslations("changeEmailModal");
  const tDash = useTranslations("instructorDashboard");

  const authUser = useSelector((state: RootState) => state.auth.user);

  const approvalStatus: "approved" | "pending" | "rejected" =
    (authUser?.instructorStatus as any) || "approved";

  const initialStatus = approvalStatus;

  // Active Workspace Section - default to settings if not approved
  const defaultTab = initialStatus !== "approved" && initialTab !== "settings" ? "settings" : initialTab;
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "students" | "payout" | "settings">(defaultTab);
  const [studentSearch, setStudentSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<"all" | "active" | "published" | "pending_review" | "draft" | "archived">("active");

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingFeatureName, setPendingFeatureName] = useState<string | undefined>(undefined);
  const [archiveModalCourseId, setArchiveModalCourseId] = useState<string | null>(null);
  const [deleteModalCourse, setDeleteModalCourse] = useState<{ id: string; title: string } | null>(null);
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
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(null);

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
        let normalizedStatus: "published" | "pending_review" | "draft" | "rejected" | "archived" = "draft";
        if (
          rawStatus === "pending_review" ||
          rawStatus === "pending" ||
          rawStatus === "under_review" ||
          rawStatus === "in_review"
        ) {
          normalizedStatus = "pending_review";
        } else if (rawStatus === "published" || rawStatus === "approved" || (c.is_published && rawStatus !== "draft" && rawStatus !== "rejected")) {
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
          title: isAr ? c.title_ar || c.title_en || c.title : c.title_en || c.title_ar || c.title,
          titleEn: c.title_en || c.title || "Course",
          titleAr: c.title_ar || c.title || "دورة",
          studentsCount: Number(c.students_count || c.total_students || 0),
          rating: Number(c.rating || 0),
          reviewsCount: Number(c.reviews_count || c.reviewsCount || 0),
          revenue: Number(c.revenue || (c.price ? Number(c.price) * (c.students_count || 0) : 0)),
          status: normalizedStatus,
          price: Number(c.price) || 0,
          level: c.level || "Beginner",
          image:
            c.cover_image ||
            c.coverImage ||
            (typeof c.image === "string" && !c.image.includes("unsplash.com/photo-1516321318423") ? c.image : ""),
          rejectionReason: isAr ? c.rejection_reason_ar || "" : c.rejection_reason_en || "",
          sections: c.sections || [],
          isReal: true,
        };
      });

      // Set the authenticated instructor's real courses
      setCourses(realCourses);
    } catch (err) {
      console.warn("Could not fetch instructor courses from backend API:", err);
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Enrolled Students Data
  const [students] = useState<any[]>([]);

  // Avatar & Profile State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(authUser?.avatar || null);

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

  useEffect(() => {
    const userFullName = authUser?.fullName || authUser?.name || "";
    const activeSlug = userFullName ? normalizeInstructorSlug(userFullName) : "";
    const overrides = activeSlug
      ? {
          ...(getSavedInstructorOverrides(activeSlug) || {}),
          ...(getSavedInstructorOverrides(`inst-${activeSlug}`) || {}),
        }
      : {};

    setFormData((prev) => ({
      ...prev,
      fullName: authUser?.fullName || authUser?.name || overrides.name || prev.fullName,
      headline: authUser?.headline || overrides.headline || prev.headline,
      email: authUser?.email || prev.email,
    }));
    setAvatarPreview(authUser?.avatar || overrides.avatar || null);
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    setToastMessage(tInst("profileSavedToast"));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      setSubmittingCourseId(courseId);

      // 1. Fetch full course details to inspect all sections, lessons, and cover image
      let detailedCourse = courses.find((c) => String(c.id) === String(courseId));
      try {
        const fetched = await instructorCourseService.getInstructorCourse(courseId);
        if (fetched) {
          detailedCourse = {
            ...detailedCourse,
            ...fetched,
            sections: fetched.sections || detailedCourse?.sections || [],
            cover_image: fetched.cover_image || fetched.coverImage || detailedCourse?.image,
          };
        }
      } catch (fetchErr) {
        console.warn("Could not fetch full course for validation check:", fetchErr);
      }

      // 2. Comprehensive Course Completeness Validation (Image, Sections, Lessons, Videos)
      const hasCover = Boolean(
        detailedCourse?.cover_image ||
        detailedCourse?.coverImage ||
        (detailedCourse?.image && typeof detailedCourse.image === "string" && !detailedCourse.image.includes("unsplash.com/photo-1516321318423"))
      );

      const sections = detailedCourse?.sections || [];
      const hasSections = Array.isArray(sections) && sections.length > 0;
      const hasLessons = hasSections && sections.every((s: any) => Array.isArray(s.lessons) && s.lessons.length > 0);
      const hasVideos = hasLessons && sections.every((s: any) =>
        s.lessons.every((l: any) => Boolean(l.video_url || l.video_public_id || l.videoUrl))
      );

      const checklist: IncompleteItem[] = [
        {
          id: "cover",
          labelAr: "صورة غلاف الدورة",
          labelEn: "Course Cover Image",
          descriptionAr: "إرفاق صورة جذابة بدقة عالية لغلاف الدورة التدريبية.",
          descriptionEn: "Upload a high-quality cover thumbnail for the course.",
          isComplete: hasCover,
        },
        {
          id: "sections",
          labelAr: "أقسام الدورة (Sections)",
          labelEn: "Course Sections",
          descriptionAr: "إضافة قسم واحد على الأقل لتنظيم المنهج التدريبي.",
          descriptionEn: "Add at least one curriculum section to organize content.",
          isComplete: hasSections,
        },
        {
          id: "lessons",
          labelAr: "دروس المنهج (Lessons)",
          labelEn: "Curriculum Lessons",
          descriptionAr: "إضافة الدروس التابعة لكل قسم تدريبي في الدورة.",
          descriptionEn: "Add lesson topics inside each curriculum section.",
          isComplete: hasLessons,
        },
        {
          id: "videos",
          labelAr: "فيديوهات الشرح لكل درس",
          labelEn: "Lesson Video Content",
          descriptionAr: "رفع وإرفاق فيديو الشرح التعليمي لجميع الدروس المضافة.",
          descriptionEn: "Upload or attach video recordings for all lessons.",
          isComplete: hasVideos,
        },
      ];

      const isIncomplete = checklist.some((item) => !item.isComplete);
      if (isIncomplete) {
        setIncompleteModalData({
          isOpen: true,
          courseId: String(courseId),
          courseTitle: (isAr ? detailedCourse?.titleAr || detailedCourse?.title : detailedCourse?.titleEn || detailedCourse?.title) || "",
          missingItems: checklist,
        });
        return;
      }

      const previousCourse = courses.find((c) => String(c.id) === String(courseId));
      const previousStatus = previousCourse?.status || "draft";

      // Persist pending_review locally so it stays across refetches
      saveCourseStatus(courseId, "pending_review");

      // Optimistic local update: immediately switch to pending_review and clear actions
      setCourses((prev) =>
        prev.map((c) => (String(c.id) === String(courseId) ? { ...c, status: "pending_review", rejectionReason: "" } : c))
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
          prev.map((c) => (String(c.id) === String(courseId) ? { ...c, status: previousStatus } : c))
        );
        const errorMsg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          (isAr ? "فشل إرسال الكورس للمراجعة. يرجى التحقق من الاتصال والمحاولة مرة أخرى." : "Failed to submit course for review. Please try again.");
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
      await instructorCourseService.updateCourse(courseId, { status: nextStatus });
      if (isCurrentlyArchived) {
        setToastMessage(tInst("courseUnarchivedToast"));
      } else {
        setToastMessage(tInst("courseArchivedToast"));
      }
      fetchMyCourses();
    } catch (err: any) {
      console.warn("Could not archive/unarchive course via API:", err);
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, status: nextStatus } : c
        )
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
        setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
      } else if (res.archived || res.status === 200) {
        // 200 OK: Course had enrollments -> automatically archived
        setToastMessage(tInst("courseArchivedNotice"));
        setCourses((prev) =>
          prev.map((c) =>
            String(c.id) === String(courseId) ? { ...c, status: "archived" } : c
          )
        );
      } else {
        setToastMessage(tInst("courseDeletedToast"));
        setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
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
        const errorDetail = err?.response?.data?.detail || err?.response?.data?.message;
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
      s.course.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6 font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
                  <span className="font-extrabold text-2xl text-[#0F5244]">{formData.fullName.charAt(0)}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900">{formData.fullName}</h1>
                <VerifiedBadge size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium">{formData.headline}</p>
              <p className="text-[11px] text-slate-400 font-medium pt-0.5">{formData.email}</p>
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
      <div className={hideSidebar ? "w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-10 shadow-2xs" : "flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-10 items-start"}>
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
              { id: "overview", label: tInst("analyticsRevenue"), icon: LayoutDashboard },
              { id: "courses", label: tInst("courseLifecycle"), icon: BookOpen },
              { id: "students", label: tInst("enrolledStudentsNav"), icon: Users },
              { id: "payout", label: tInst("payoutAndBilling"), icon: CreditCard },
              { id: "profile", label: tInst("profileNav") || t("profile"), icon: User },
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
        <div className={hideSidebar ? "w-full" : "flex-1 w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-10 shadow-2xs"}>
          
          {/* OVERVIEW / ANALYTICS TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {tInst("instructorOverviewTitle")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs font-bold text-[#0F5244] uppercase">{tInst("enrolledStudentsNav")}</span>
                  <div className="text-2xl font-black text-[#0F5244]">
                    {courses.reduce((acc, curr) => acc + Number(curr.studentsCount || 0), 0)}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100">
                  <span className="text-xs font-bold text-teal-800 uppercase">{tInst("payoutAndBilling")}</span>
                  <div className="text-2xl font-black text-teal-950">
                    ${courses.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-xs font-bold text-amber-800 uppercase">{tInst("ratingLabel")}</span>
                  <div className="text-2xl font-black text-amber-900 flex items-center gap-1">
                    <span>
                      {courses.filter((c) => Number(c.reviewsCount || 0) > 0).length > 0
                        ? (
                            courses
                              .filter((c) => Number(c.reviewsCount || 0) > 0)
                              .reduce((acc, curr) => acc + Number(curr.rating || 0), 0) /
                            courses.filter((c) => Number(c.reviewsCount || 0) > 0).length
                          ).toFixed(1)
                        : "—"}
                    </span>
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500 inline shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COURSE MANAGER & LIFECYCLE TAB */}
          {activeTab === "courses" && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
              
              {/* 1. Executive Gradient Hero Header Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06241E] via-[#0F5244] to-[#0A3D33] text-white p-6 sm:p-8 shadow-xl border border-emerald-700/40">
                {/* Ambient Decorative Background Glows */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                      <span>{tInst("lifecycleManagementTitle")}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                      {isAr ? "إدارة دورة حياة وتطوير الكورسات" : "Course Lifecycle Management"}
                    </h2>

                    <p className="text-xs sm:text-sm text-emerald-100/80 font-medium leading-relaxed">
                      {tInst("lifecycleManagementSubtitle")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/${locale}/instructor/courses/new`}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/25 active:scale-98 transition-all shrink-0 cursor-pointer group"
                    >
                      <Plus className="h-4 w-4 stroke-[3] transition-transform group-hover:rotate-90" />
                      <span>{tDash("createNewCourse")}</span>
                    </Link>
                  </div>
                </div>

                {/* 2. Integrated Metric Highlights Grid */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-700/40">
                  {/* Metric 1: Total */}
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-emerald-200 text-xs font-bold mb-1">
                      <span>{isAr ? "إجمالي الكورسات" : "Total Courses"}</span>
                      <Layers className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{courses.length}</div>
                  </div>

                  {/* Metric 2: Published */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-emerald-300 text-xs font-bold mb-1">
                      <span>{tInst("statusPublished")}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-200">
                      {courses.filter((c) => c.status === "published").length}
                    </div>
                  </div>

                  {/* Metric 3: Pending Review */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/15 backdrop-blur-md border border-amber-400/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-amber-200 text-xs font-bold mb-1">
                      <span>{tInst("statusPendingReview")}</span>
                      <Clock className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-200">
                      {courses.filter((c) => c.status === "pending_review").length}
                    </div>
                  </div>

                  {/* Metric 4: Drafts */}
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-200 text-xs font-bold mb-1">
                      <span>{tInst("statusDraft")}</span>
                      <Edit2 className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {courses.filter((c) => c.status === "draft" || c.status === "rejected").length}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Segmented Filter Control Bar */}
              <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 flex-wrap">
                  {/* Filter: Active */}
                  <button
                    type="button"
                    onClick={() => setCourseFilter("active")}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      courseFilter === "active"
                        ? "bg-[#0F5244] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{tInst("activeFilter")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        courseFilter === "active"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {courses.filter((c) => c.status !== "archived").length}
                    </span>
                  </button>

                  {/* Filter: Published */}
                  <button
                    type="button"
                    onClick={() => setCourseFilter("published")}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      courseFilter === "published"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{tInst("statusPublished")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        courseFilter === "published"
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {courses.filter((c) => c.status === "published").length}
                    </span>
                  </button>

                  {/* Filter: Pending Review */}
                  <button
                    type="button"
                    onClick={() => setCourseFilter("pending_review")}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      courseFilter === "pending_review"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{tInst("statusPendingReview")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        courseFilter === "pending_review"
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {courses.filter((c) => c.status === "pending_review").length}
                    </span>
                  </button>

                  {/* Filter: Drafts */}
                  <button
                    type="button"
                    onClick={() => setCourseFilter("draft")}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      courseFilter === "draft"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{tInst("statusDraft")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        courseFilter === "draft"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {courses.filter((c) => c.status === "draft" || c.status === "rejected").length}
                    </span>
                  </button>

                  {/* Filter: Archived */}
                  <button
                    type="button"
                    onClick={() => setCourseFilter("archived")}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      courseFilter === "archived"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{tInst("archivedFilter")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        courseFilter === "archived"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {courses.filter((c) => c.status === "archived").length}
                    </span>
                  </button>

                  {/* Filter: All */}
                  <button
                    type="button"
                    onClick={() => setCourseFilter("all")}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      courseFilter === "all"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{tInst("allCoursesFilter")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        courseFilter === "all"
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {courses.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* 4. Course Cards List */}
              <div className="space-y-4">
                {isLoadingCourses ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white shadow-2xs space-y-4 animate-pulse"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200 shrink-0" />
                            <div className="space-y-2">
                              <div className="h-4 w-48 sm:w-64 bg-slate-200 rounded-lg" />
                              <div className="h-3 w-28 bg-slate-200 rounded-md" />
                              <div className="h-3 w-36 bg-slate-200 rounded-md" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                            <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : courses.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-emerald-200/80 rounded-3xl p-8 space-y-4 bg-gradient-to-b from-emerald-50/30 to-slate-50/50">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#0F5244] mx-auto flex items-center justify-center border border-emerald-200/80 shadow-2xs">
                      <BookOpen className="w-8 h-8 text-[#0F5244]" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {tDash("noCoursesYetTitle")}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {tDash("noCoursesYetSubtitle")}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/instructor/courses/new`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-900/15 transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>{tDash("createNewCourse")}</span>
                    </Link>
                  </div>
                ) : courses.filter((c) => {
                    if (courseFilter === "active") return c.status !== "archived";
                    if (courseFilter === "published") return c.status === "published";
                    if (courseFilter === "pending_review") return c.status === "pending_review";
                    if (courseFilter === "draft") return c.status === "draft" || c.status === "rejected";
                    if (courseFilter === "archived") return c.status === "archived";
                    return true;
                  }).length === 0 ? (
                  <div className="text-center py-14 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3 shadow-2xs">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <Archive className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                      {courseFilter === "archived"
                        ? tInst("noArchivedCourses")
                        : (isAr ? "لا توجد دورات في هذا التصنيف حالياً" : "No courses found in this tab")}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {courseFilter === "archived"
                        ? tInst("noArchivedCoursesNotice")
                        : (isAr ? "يمكنك تبديل التصفية أو إنشاء دورة جديدة." : "Try choosing another filter tab or create a new course.")}
                    </p>
                  </div>
                ) : (
                  courses
                    .filter((c) => {
                      if (courseFilter === "active") return c.status !== "archived";
                      if (courseFilter === "published") return c.status === "published";
                      if (courseFilter === "pending_review") return c.status === "pending_review";
                      if (courseFilter === "draft") return c.status === "draft" || c.status === "rejected";
                      if (courseFilter === "archived") return c.status === "archived";
                      return true;
                    })
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-white hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 space-y-4 shadow-2xs group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                            {/* Course Cover Thumbnail */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200/90 shadow-2xs bg-slate-100 flex items-center justify-center">
                              {c.image ? (
                                <Image
                                  src={c.image}
                                  alt={c.titleEn || c.title}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1 p-1 text-center">
                                  <ImageIcon className="w-5 h-5 text-slate-300" />
                                  <span className="text-[9px] font-bold text-slate-400 leading-tight">
                                    {isAr ? "بدون غلاف" : "No cover"}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0F5244] transition-colors line-clamp-1">
                                  {isAr ? c.titleAr || c.title : c.titleEn || c.title}
                                </h3>

                                {/* Status Pill Badge */}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-2xs ${
                                    c.status === "published"
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90"
                                      : c.status === "pending_review"
                                      ? "bg-amber-50 text-amber-800 border border-amber-200/90"
                                      : c.status === "rejected"
                                      ? "bg-rose-50 text-rose-800 border border-rose-200/90"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {c.status === "published" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  {c.status === "pending_review" && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
                                  {c.status === "rejected" && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                                  <span>
                                    {c.status === "published"
                                      ? tInst("statusPublished")
                                      : c.status === "pending_review"
                                      ? `${tInst("statusUnderReview")}`
                                      : c.status === "rejected"
                                      ? tInst("statusRejected")
                                      : tInst("statusDraft")}
                                  </span>
                                </span>
                              </div>

                              {/* Rejection Alert */}
                              {c.status === "rejected" && c.rejectionReason && (
                                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div>
                                    <strong>{tInst("rejectionReasonLabel")}</strong> {c.rejectionReason}
                                  </div>
                                </div>
                              )}

                              {/* Metadata Row */}
                              <div className="flex items-center gap-3 text-xs text-slate-500 font-bold flex-wrap pt-0.5">
                                <span className="text-slate-900 font-black text-sm">
                                  ${Number(c.price || 0).toFixed(2)}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{c.studentsCount} {tInst("enrolledStudentsCount")}</span>
                                </span>
                                {c.status === "published" && Number(c.reviewsCount || 0) > 0 && Number(c.rating || 0) > 0 ? (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="inline-flex items-center gap-1 text-amber-600 font-black">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      <span>{Number(c.rating).toFixed(1)}</span>
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Course Action Buttons Area */}
                          <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
                            {c.status === "pending_review" ? (
                              /* Pending Review State: ZERO Action Buttons, only clear official status */
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-black select-none shadow-2xs">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>{tInst("waitingForAdminReview")}</span>
                              </div>
                            ) : (
                              /* Active/Draft/Rejected States: Allow permitted actions */
                              <>
                                {(c.status === "draft" || c.status === "rejected") && (
                                  <button
                                    type="button"
                                    disabled={submittingCourseId === c.id}
                                    onClick={() => handleSubmitForReview(c.id)}
                                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                                  >
                                    {submittingCourseId === c.id ? (
                                      <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                      <Send size={13} />
                                    )}
                                    <span>
                                      {submittingCourseId === c.id
                                        ? isAr
                                          ? "جاري الإرسال..."
                                          : "Submitting..."
                                        : tInst("submitReviewBtn")}
                                    </span>
                                  </button>
                                )}

                                {c.status === "published" && (
                                  <Link
                                    href={`/${locale}/courses/${c.slug || c.id}`}
                                    target="_blank"
                                    className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Eye size={13} />
                                    <span>{tInst("viewLiveBtn")}</span>
                                  </Link>
                                )}

                                <Link
                                  href={`/${locale}/instructor/courses/create?id=${c.id}`}
                                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Edit2 size={13} />
                                  <span>{tInst("editBtn")}</span>
                                </Link>

                                {c.status !== "rejected" && (
                                  <button
                                    type="button"
                                    onClick={() => handleArchiveCourse(c.id)}
                                    className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                      c.status === "archived"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                        : "bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-900"
                                    }`}
                                    title={c.status === "archived" ? tInst("unarchiveTitle") : tInst("archiveTitle")}
                                  >
                                    {c.status === "archived" ? tInst("unarchiveBtn") : tInst("archiveBtn")}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setDeleteModalCourse({ id: String(c.id), title: isAr ? c.titleAr || c.title : c.titleEn || c.title })}
                                  className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
                                  title={tInst("deleteCourseTitle")}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* ENROLLED STUDENTS TAB */}
          {activeTab === "students" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tInst("enrolledStudentsTitle")}
                </h2>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder={tDash("searchStudentPlaceholder")}
                    className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/60 rtl:pr-9 ltr:pl-9 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto rounded-3xl border border-slate-200/80">
                {filteredStudents.length === 0 ? (
                  <div className="py-12 text-center bg-white p-6 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-sm font-extrabold text-slate-700">
                      {tInst("noEnrolledStudents")}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {tInst("noEnrolledStudentsDesc")}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-start text-xs font-semibold text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3 text-start">{tInst("studentCol")}</th>
                        <th className="px-4 py-3 text-start">{tInst("courseCol")}</th>
                        <th className="px-4 py-3 text-start">{tInst("progressCol")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900">{student.name}</td>
                          <td className="px-4 py-3 text-slate-600">{student.course}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-extrabold">
                              {student.progress}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* PAYOUT TAB */}
          {activeTab === "payout" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {tInst("payoutAndBilling")}
              </h2>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">{tInst("autoPayout")}</h3>
                  <p className="text-xs text-slate-500 font-medium">{tInst("autoPayoutSub")}</p>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  <p><strong>{tInst("payoutMethod")}:</strong> {formData.payoutMethod === "bank" ? tInst("bankTransfer") : "PayPal"}</p>
                  <p className="mt-1"><strong>{tInst("bankIbanLabel")}</strong> {formData.bankIban}</p>
                </div>
              </div>
            </div>
          )}

          {/* FULL INSTRUCTOR SETTINGS TAB */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{tInst("title")}</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{tInst("subtitle")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">{t("fullName")}</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">{tInst("specialization")}</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-2xl bg-[#0F5244] text-white text-xs font-black shadow-sm active:scale-98 transition-all cursor-pointer">
                  {isSaving ? t("saving") : t("saveChanges")}
                </button>
              </div>
            </form>
          )}

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
          courses.find((c) => c.id === archiveModalCourseId)?.[isAr ? "titleAr" : "titleEn"]
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
        onClose={() => setIncompleteModalData((prev) => ({ ...prev, isOpen: false }))}
        courseId={incompleteModalData.courseId}
        courseTitle={incompleteModalData.courseTitle}
        missingItems={incompleteModalData.missingItems}
      />
    </div>
  );
}
