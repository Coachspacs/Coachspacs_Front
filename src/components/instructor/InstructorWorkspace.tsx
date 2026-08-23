"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  Star,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Archive,
  Send,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  PlayCircle,
  AlertTriangle,
  X,
  Camera,
  Briefcase,
  Building,
  Video,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw
} from "lucide-react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";

const ArchiveCourseModal = dynamic(() => import("@/components/modals/ArchiveCourseModal").then((mod) => mod.ArchiveCourseModal), { ssr: false });
const ChangeEmailModal = dynamic(() => import("@/components/modals/ChangeEmailModal").then((mod) => mod.ChangeEmailModal), { ssr: false });
const InstructorPendingModal = dynamic(() => import("@/components/modals/InstructorPendingModal").then((mod) => mod.InstructorPendingModal), { ssr: false });
import {
  mockInstructorWorkspaceCourses,
  mockInstructorWorkspaceStudents,
  mockInstructorWorkspaceProfile,
} from "@/lib/mockData";

interface InstructorWorkspaceProps {
  initialTab?: "overview" | "courses" | "students" | "payout" | "settings";
  hideSidebar?: boolean;
}

export function InstructorWorkspace({ initialTab = "overview", hideSidebar = true }: InstructorWorkspaceProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tStudent = useTranslations("studentSettings");
  const tChangeEmail = useTranslations("changeEmailModal");
  const tDash = useTranslations("instructorDashboard");

  const authUser = useSelector((state: RootState) => state.auth.user);

  // Account Approval Status (US-02)
  const initialStatus = (authUser?.approval_status === "pending" || authUser?.approvalStatus === "pending")
    ? "pending"
    : (authUser?.approval_status === "rejected" || authUser?.approvalStatus === "rejected")
    ? "rejected"
    : "approved";

  const [approvalStatus, setApprovalStatus] = useState<"approved" | "pending" | "rejected">(initialStatus);

  // Active Workspace Section - default to settings if not approved
  const defaultTab = (initialStatus !== "approved" && initialTab !== "settings") ? "settings" : initialTab;
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "students" | "payout" | "settings">(defaultTab);
  const [studentSearch, setStudentSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<"all" | "active" | "archived">("active");

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingFeatureName, setPendingFeatureName] = useState<string | undefined>(undefined);

  // Modal State for Course Editor & Curriculum Builder
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [archiveModalCourseId, setArchiveModalCourseId] = useState<string | null>(null);

  // Instructor Courses State (US-08)
  const [courses, setCourses] = useState(() =>
    mockInstructorWorkspaceCourses.map((c) => ({
      ...c,
      rejectionReason: isAr ? (c.rejectionReasonAr || "") : (c.rejectionReasonEn || ""),
    }))
  );

  // Enrolled Students Data (US-17)
  const [students] = useState(() =>
    mockInstructorWorkspaceStudents.map((s) => ({
      id: s.id,
      name: isAr ? s.nameAr : s.nameEn,
      email: s.email,
      course: s.course,
      date: s.date,
      progress: s.progress,
    }))
  );

  // Pagination (US-17)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form State (Full Settings)
  const [formData, setFormData] = useState({
    fullName: isAr ? mockInstructorWorkspaceProfile.fullNameAr : mockInstructorWorkspaceProfile.fullNameEn,
    email: mockInstructorWorkspaceProfile.email,
    phone: mockInstructorWorkspaceProfile.phone,
    headline: isAr ? mockInstructorWorkspaceProfile.headlineAr : mockInstructorWorkspaceProfile.headlineEn,
    specialization: mockInstructorWorkspaceProfile.specialization,
    experienceYears: mockInstructorWorkspaceProfile.experienceYears,
    hourlyRate: mockInstructorWorkspaceProfile.hourlyRate,
    bio: isAr ? mockInstructorWorkspaceProfile.bioAr : mockInstructorWorkspaceProfile.bioEn,
    payoutMethod: mockInstructorWorkspaceProfile.payoutMethod,
    bankIban: mockInstructorWorkspaceProfile.bankIban,
    paypalEmail: mockInstructorWorkspaceProfile.paypalEmail,
    autoPayout: mockInstructorWorkspaceProfile.autoPayout,
    introVideoUrl: mockInstructorWorkspaceProfile.introVideoUrl,
    website: mockInstructorWorkspaceProfile.website,
    linkedin: mockInstructorWorkspaceProfile.linkedin,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(tStudent("avatarSizeExceeded"));
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
      setToastMessage(tStudent("avatarUpdated"));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError(t("passwordsDoNotMatch"));
        return;
      }
      if (formData.newPassword.length < 8) {
        setPasswordError(t("passwordMinLength"));
        return;
      }
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    setToastMessage(t("changesSaved"));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmitForReview = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "pending_review", rejectionReason: "" } : c))
    );
    setToastMessage(tInst("courseSubmittedToast"));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleArchiveCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course && course.status !== "archived") {
      setArchiveModalCourseId(courseId);
    } else {
      confirmArchiveCourse(courseId);
    }
  };

  const confirmArchiveCourse = (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    const isCurrentlyArchived = targetCourse?.status === "archived";

    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, status: isCurrentlyArchived ? "published" : "archived" } : c
      )
    );

    if (isCurrentlyArchived) {
      setToastMessage(tInst("courseUnarchivedToast"));
    } else {
      setToastMessage(tInst("courseArchivedToast"));
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.course.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6">
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

      {/* Top Instructor Workspace Banner / Header Card (Only rendered standalone) */}
      {!hideSidebar && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-start">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#E8F3F1] border-2 border-emerald-200/80 overflow-hidden shadow-2xs flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Instructor" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-2xl sm:text-3xl text-[#0F5244]">{formData.fullName.charAt(0)}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900">{formData.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-extrabold flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{tInst("verifiedCoach")}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{formData.headline}</p>
              <p className="text-[11px] text-slate-400 font-medium pt-0.5">{formData.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Approval Banner (US-02) */}
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
                    : (isAr ? "قيد المراجعة" : "Under Review")}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {approvalStatus === "approved"
                ? tInst("approvedDescription")
                : approvalStatus === "rejected"
                ? tInst("rejectedDescription")
                : (isAr
                    ? "طلب انضمامك كمدرب قيد التدقيق حالياً من قبل الإدارة. ستصلك رسالة تأكيد عبر البريد فور الاعتماد."
                    : tInst("pendingDescription"))}
            </p>
          </div>
        </div>
      </div>

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
              { id: "settings", label: t("accountSettings"), icon: Settings },
            ]}
            user={{
              name: formData.fullName,
              role: tInst("roleInstructor"),
              avatarUrl: avatarPreview,
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
                  <div className="text-2xl font-black text-[#0F5244]">1,240</div>
                </div>
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100">
                  <span className="text-xs font-bold text-teal-800 uppercase">{tInst("payoutAndBilling")}</span>
                  <div className="text-2xl font-black text-teal-950">$24,850</div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-xs font-bold text-amber-800 uppercase">{tInst("ratingLabel")}</span>
                  <div className="text-2xl font-black text-amber-900 flex items-center gap-1">
                    <span>4.85</span>
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500 inline shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COURSE MANAGER TAB */}
          {activeTab === "courses" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tInst("lifecycleManagementTitle")}
                </h2>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setCourseFilter("active")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        courseFilter === "active" ? "bg-white text-[#0F5244] shadow-2xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tInst("activeFilter")} ({courses.filter((c) => c.status !== "archived").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseFilter("archived")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        courseFilter === "archived" ? "bg-white text-[#0F5244] shadow-2xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tInst("archivedFilter")} ({courses.filter((c) => c.status === "archived").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseFilter("all")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        courseFilter === "all" ? "bg-white text-[#0F5244] shadow-2xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tInst("allCoursesFilter")} ({courses.length})
                    </button>
                  </div>

                  <Link
                    href={`/${locale}/instructor/courses/new`}
                    className="px-4 py-2 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{tDash("createNewCourse")}</span>
                  </Link>
                </div>
              </div>

              {/* Course Cards List */}
              <div className="space-y-4">
                {courses
                  .filter((c) => {
                    if (courseFilter === "active") return c.status !== "archived";
                    if (courseFilter === "archived") return c.status === "archived";
                    return true;
                  })
                  .map((c) => (
                    <div key={c.id} className="p-4 sm:p-6 rounded-3xl border border-slate-200/80 bg-slate-50/40 hover:bg-white transition-all space-y-4 shadow-2xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img src={c.image} alt={c.titleEn} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-200" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                                {isAr ? c.titleAr : c.titleEn}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                  c.status === "published"
                                    ? "bg-emerald-100 text-[#0F5244]"
                                    : c.status === "pending_review"
                                    ? "bg-amber-100 text-amber-800"
                                    : c.status === "rejected"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>

                            {c.status === "rejected" && c.rejectionReason && (
                              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium mt-2 flex items-start gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong>{tInst("rejectionReasonLabel")}</strong> {c.rejectionReason}
                                </div>
                              </div>
                            )}

                            <p className="text-xs text-slate-500 font-medium mt-1">
                              ${c.price} • {c.studentsCount} {tInst("enrolledStudentsCount")}
                            </p>
                          </div>
                        </div>

                        {/* Course Action Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {(c.status === "draft" || c.status === "rejected") && (
                            <button
                              type="button"
                              onClick={() => handleSubmitForReview(c.id)}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              {tInst("submitReviewBtn")}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleArchiveCourse(c.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              c.status === "archived"
                                ? "bg-emerald-50 text-[#0F5244] border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                            title={c.status === "archived" ? tInst("unarchiveTitle") : tInst("archiveTitle")}
                          >
                            {c.status === "archived" ? tInst("unarchiveBtn") : tInst("archiveBtn")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {courses.filter((c) => (courseFilter === "archived" ? c.status === "archived" : c.status !== "archived")).length === 0 && (
                  <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <Archive className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">{tInst("noArchivedCourses")}</p>
                    <p className="text-xs text-slate-400 mt-1">{tInst("noArchivedCoursesNotice")}</p>
                  </div>
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
                <table className="w-full text-start text-xs font-semibold text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-start">{tInst("studentCol")}</th>
                      <th className="px-4 py-3 text-start">{tInst("courseCol")}</th>
                      <th className="px-4 py-3 text-start">{tInst("progressCol")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedStudents.map((student) => (
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

      <InstructorPendingModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        featureName={pendingFeatureName}
      />
    </div>
  );
}
