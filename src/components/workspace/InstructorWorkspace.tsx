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
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArchiveCourseModal } from "@/components/modals/ArchiveCourseModal";
import { ChangeEmailModal } from "@/components/modals/ChangeEmailModal";

interface InstructorWorkspaceProps {
  initialTab?: "overview" | "courses" | "students" | "payout" | "settings";
  onRoleSwitch?: (role: "student" | "instructor") => void;
}

export function InstructorWorkspace({ initialTab = "overview", onRoleSwitch }: InstructorWorkspaceProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tStudent = useTranslations("studentSettings");
  const tChangeEmail = useTranslations("changeEmailModal");

  // Active Workspace Section
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "students" | "payout" | "settings">(initialTab);
  const [studentSearch, setStudentSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<"all" | "active" | "archived">("active");

  // Account Approval Status (US-02)
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "pending" | "rejected">("approved");

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Modal State for Course Editor & Curriculum Builder
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [archiveModalCourseId, setArchiveModalCourseId] = useState<string | null>(null);

  // Instructor Courses State (US-08)
  const [courses, setCourses] = useState([
    {
      id: "c-1",
      titleAr: "دورة احتراف React 19 و Next.js App Router",
      titleEn: "React 19 & Next.js App Router Masterclass",
      category: "Development",
      level: "Intermediate",
      price: 49.99,
      studentsCount: 340,
      rating: 4.9,
      status: "published",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
      rejectionReason: "",
      sections: []
    },
    {
      id: "c-2",
      titleAr: "تطبيقات الذكاء الاصطناعي بلغة Python",
      titleEn: "Applied AI with Python",
      category: "Data Science",
      level: "Advanced",
      price: 79.99,
      studentsCount: 120,
      rating: 4.8,
      status: "pending_review",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
      rejectionReason: "",
      sections: []
    },
    {
      id: "c-3",
      titleAr: "دليل تصميم أنظمة UI/UX المتكاملة",
      titleEn: "Complete UI/UX Design System Guide",
      category: "Design",
      level: "Beginner",
      price: 39.99,
      studentsCount: 0,
      rating: 0.0,
      status: "rejected",
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop",
      rejectionReason: isAr
        ? "يرجى إضافة فيديو تعريفي بجودة HD وإضافة 3 دروس مجانية للمعاينة."
        : "Please upload HD promo video and add at least 3 free preview lessons.",
      sections: []
    },
    {
      id: "c-4",
      titleAr: "أساسيات البرمجة بلغة C++",
      titleEn: "C++ Programming Basics",
      category: "Development",
      level: "Beginner",
      price: 29.99,
      studentsCount: 85,
      rating: 4.5,
      status: "archived",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop",
      rejectionReason: "",
      sections: []
    }
  ]);

  // Enrolled Students Data (US-17)
  const [students] = useState([
    { id: "s-1", name: isAr ? "أحمد المحمد" : "Ahmad Al-Mohammad", email: "ahmad@example.com", course: "React 19 & Next.js Masterclass", date: "2026-02-08", progress: 85 },
    { id: "s-2", name: isAr ? "سارة خالد" : "Sarah Khaled", email: "sarah@example.com", course: "React 19 & Next.js Masterclass", date: "2026-02-05", progress: 100 },
    { id: "s-3", name: isAr ? "عمر الفاروق" : "Omar Al-Farooq", email: "omar@example.com", course: "Applied AI with Python", date: "2026-01-28", progress: 40 },
    { id: "s-4", name: isAr ? "ريم السالم" : "Reem Al-Salem", email: "reem@example.com", course: "C++ Programming Basics", date: "2026-01-20", progress: 60 },
  ]);

  // Pagination (US-17)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form State (Full Settings)
  const [formData, setFormData] = useState({
    fullName: isAr ? "د. طارق المنصور" : "Dr. Tarek Al-Mansoor",
    email: "tarek.mansoor@example.com",
    phone: "+966 50 987 6543",
    headline: isAr ? "خبير ذكاء اصطناعي ومدرب معتمد" : "AI Specialist & Certified Executive Coach",
    specialization: "Data Science & AI",
    experienceYears: "8",
    hourlyRate: "120",
    bio: isAr
      ? "خبرة أكثر من 8 سنوات في تصميم ونشر نماذج الذكاء الاصطناعي وتدريب أكثر من 15,000 طالب عبر العالم."
      : "8+ years designing AI models and training over 15,000 professionals worldwide.",
    payoutMethod: "bank",
    bankIban: "SA03 8000 0000 6080 1010 1000",
    paypalEmail: "tarek.mansoor@example.com",
    autoPayout: true,
    introVideoUrl: "https://youtube.com/watch?v=demo123",
    website: "https://tarekmansoor.ai",
    linkedin: "https://linkedin.com/in/tarekmansoor",
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
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
      <Header />

      <main className="flex-grow py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg ml-1 rtl:ml-0 rtl:mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Email Change Modal */}
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

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E8F3F1] border-2 border-emerald-200/80 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Instructor" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-3xl text-[#0F5244]">{formData.fullName.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{formData.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-extrabold">
                  👨‍🏫 {tInst("verifiedCoach")}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{formData.headline}</p>
              <p className="text-[11px] text-slate-400 font-medium pt-0.5">{formData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center sm:justify-end">
            {onRoleSwitch && (
              <div className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => onRoleSwitch("student")}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer"
                >
                  🎓 {tInst("studentHubBtn")}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-white text-[#0F5244] text-xs font-extrabold shadow-2xs"
                >
                  👨‍🏫 {tInst("coachHubBtn")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Approval Banner (US-02) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-start">
            <div className="p-2 rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  {tInst("approvalStatusTitle")}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-black">
                  {tInst("approvedBadge")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Workspace Layout: Left Sidebar + Right Content */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Vertical Sidebar Navigation Menu */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
            items={[
              { id: "overview", label: tInst("analyticsRevenue"), icon: LayoutDashboard },
              { id: "courses", label: tInst("courseLifecycle"), icon: BookOpen },
              { id: "students", label: tInst("enrolledStudentsNav"), icon: Users },
              { id: "payout", label: tInst("payoutAndBilling"), icon: CreditCard },
              { id: "settings", label: tInst("title"), icon: Settings },
            ]}
            user={{
              name: formData.fullName,
              role: tInst("roleInstructor"),
              avatarUrl: avatarPreview,
            }}
          />

          {/* Main Display Area */}
          <div className="flex-1 w-full bg-[#FFFFFF] rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-2xs">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-150">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tInst("instructorOverviewTitle")}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-xs font-bold text-slate-400 uppercase">{tInst("courses")}</span>
                    <div className="text-2xl font-black text-slate-900">{courses.length}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-700 uppercase">{tInst("enrolledStudentsNav")}</span>
                    <div className="text-2xl font-black text-indigo-900">460</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100">
                    <span className="text-xs font-bold text-teal-800 uppercase">{tInst("payoutAndBilling")}</span>
                    <div className="text-2xl font-black text-teal-950">$24,850</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                    <span className="text-xs font-bold text-amber-800 uppercase">{tInst("ratingLabel")}</span>
                    <div className="text-2xl font-black text-amber-900">4.85 ⭐</div>
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

                  {/* Course Filter Sub-Tabs (Active / Archived / All) */}
                  <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/60 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCourseFilter("active")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        courseFilter === "active"
                          ? "bg-white text-[#0F5244] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tInst("activeFilter")} ({courses.filter((c) => c.status !== "archived").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseFilter("archived")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        courseFilter === "archived"
                          ? "bg-white text-[#0F5244] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tInst("archivedFilter")} ({courses.filter((c) => c.status === "archived").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseFilter("all")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        courseFilter === "all"
                          ? "bg-white text-[#0F5244] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tInst("allCoursesFilter")} ({courses.length})
                    </button>
                  </div>
                </div>

                {courses.filter((c) => {
                  if (courseFilter === "active") return c.status !== "archived";
                  if (courseFilter === "archived") return c.status === "archived";
                  return true;
                }).length > 0 ? (
                  <div className="space-y-4">
                    {courses
                      .filter((c) => {
                        if (courseFilter === "active") return c.status !== "archived";
                        if (courseFilter === "archived") return c.status === "archived";
                        return true;
                      })
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-5 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all bg-white shadow-2xs"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                              <img src={c.image} alt={c.titleAr} className="w-full h-full object-cover" />
                              {c.status === "archived" && (
                                <span className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-[10px] font-black uppercase">
                                  {tInst("archivedBadge")}
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-extrabold text-slate-900">{isAr ? c.titleAr : c.titleEn}</h3>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                    c.status === "published"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : c.status === "pending_review"
                                      ? "bg-amber-100 text-amber-800"
                                      : c.status === "rejected"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </div>

                              {c.status === "rejected" && c.rejectionReason && (
                                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium mt-2">
                                  🚨 <strong>{tInst("rejectionReasonLabel")}</strong> {c.rejectionReason}
                                </div>
                              )}

                              <p className="text-xs text-slate-500 font-medium mt-1">
                                ${c.price} • {c.studentsCount} {tInst("enrolledStudentsCount")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            {(c.status === "draft" || c.status === "rejected") && (
                              <button
                                type="button"
                                onClick={() => handleSubmitForReview(c.id)}
                                className="px-4 py-2 rounded-xl bg-[#0F5244] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#07382E] transition-all cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span>{tInst("submitReviewBtn")}</span>
                              </button>
                            )}

                            {/* Archive / Unarchive Button */}
                            {c.status === "archived" ? (
                              <button
                                type="button"
                                onClick={() => handleArchiveCourse(c.id)}
                                title={tInst("unarchiveTitle")}
                                className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#0F5244] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>{tInst("unarchiveBtn")}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleArchiveCourse(c.id)}
                                title={tInst("archiveTitle")}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Archive className="h-3.5 w-3.5" />
                                <span>{tInst("archiveBtn")}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-12 px-6 rounded-3xl border border-dashed border-slate-200 text-center space-y-3 bg-slate-50/50">
                    <Archive className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="text-base font-extrabold text-slate-800">
                      {tInst("noArchivedCourses")}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {tInst("noArchivedCoursesNotice")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "students" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tInst("enrolledStudentsTitle")}
                </h2>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-start text-xs font-semibold">
                    <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th className="py-3.5 px-6 text-start">{tInst("studentCol")}</th>
                        <th className="py-3.5 px-6 text-start">{tInst("courseCol")}</th>
                        <th className="py-3.5 px-6 text-start">{tInst("progressCol")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedStudents.map((s) => (
                        <tr key={s.id}>
                          <td className="py-4 px-6 font-bold">{s.name}</td>
                          <td className="py-4 px-6 text-slate-700">{s.course}</td>
                          <td className="py-4 px-6 text-[#0F5244] font-extrabold">{s.progress}%</td>
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
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <p className="text-xs font-bold text-slate-700">{tInst("bankIbanLabel")}</p>
                  <p className="text-sm font-mono font-black text-slate-900">{formData.bankIban}</p>
                </div>
              </div>
            )}

            {/* SETTINGS TAB WITH COMPLETE PROPS AND ONCHANGE HANDLERS */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in duration-150">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tInst("title")}
                </h2>

                {/* Avatar Change Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group w-24 h-24 rounded-full bg-[#E8F3F1] border-2 border-emerald-200 overflow-hidden shrink-0 shadow-2xs cursor-pointer flex items-center justify-center"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-3xl text-[#0F5244]">{formData.fullName.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="h-6 w-6" />
                    </div>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />

                  <div className="space-y-1 text-center sm:text-start pt-1">
                    <h3 className="text-base font-black text-slate-900">{t("avatarTitle")}</h3>
                    <p className="text-xs text-slate-500 font-medium">{t("avatarSubtitle")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">{t("fullName")}</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">{tInst("specialization")}</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">{tInst("experienceYears")}</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="border-b border-slate-100" />

                {/* Password Change Section (US-03) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    {t("securityAndPassword")}
                  </h3>

                  {passwordError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">{t("currentPassword")}</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none rtl:pl-10 ltr:pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">{t("newPassword")}</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none rtl:pl-10 ltr:pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">{t("confirmPassword")}</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none rtl:pl-10 ltr:pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100" />

                <div className="flex justify-end">
                  <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-2xl bg-[#0F5244] text-white text-xs font-black shadow-sm active:scale-98 transition-all cursor-pointer">
                    {isSaving ? t("saving") : t("saveChanges")}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </main>

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

      <Footer />
    </div>
  );
}
