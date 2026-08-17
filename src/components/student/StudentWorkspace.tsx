"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Receipt,
  ShoppingCart,
  Settings,
  User,
  Lock,
  GraduationCap,
  Play,
  CheckCircle2,
  Download,
  Trash2,
  ArrowRight,
  Search,
  Camera,
  X,
  Send,
  UserCheck,
  Bell,
  Sparkles,
  Key,
  AlertCircle,
  Eye,
  EyeOff,
  CreditCard
} from "lucide-react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/Sidebar";

const CartView = dynamic(() => import("@/components/cart/CartView").then((mod) => mod.CartView));
const OrderHistoryView = dynamic(() => import("@/components/orders/OrderHistoryView").then((mod) => mod.OrderHistoryView));
const ChangeEmailModal = dynamic(() => import("@/components/modals/ChangeEmailModal").then((mod) => mod.ChangeEmailModal), { ssr: false });

interface StudentWorkspaceProps {
  initialTab?: "overview" | "courses" | "certificates" | "orders" | "cart" | "settings";
  hideSidebar?: boolean;
}

export function StudentWorkspace({ initialTab = "overview", hideSidebar = true }: StudentWorkspaceProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("account");
  const tStudent = useTranslations("studentSettings");
  const tWs = useTranslations("studentWorkspace");
  const tChangeEmail = useTranslations("changeEmailModal");
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector((state: RootState) => state.auth);

  // Active Workspace Section
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "certificates" | "orders" | "cart" | "settings">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<"all" | "in_progress" | "completed">("all");

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form State (Full Account Profile & Password)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || tStudent("defaultFullName"),
    email: user?.email || "student@coachspace.com",
    phone: "+966 55 123 4567",
    headline: tStudent("defaultHeadline"),
    location: tStudent("defaultLocation"),
    learningGoal: tStudent("defaultLearningGoal"),
    preferredCategory: "Data Science",
    videoSpeed: "1x",
    certificateName: user?.fullName || user?.name || tStudent("defaultCertificateName"),
    publicProfile: true,

    // Password Change (US-03)
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    // Preferences
    emailCourseUpdates: true,
    emailPromotions: true,
  });

  useEffect(() => {
    if (user) {
      const userFullName = user.fullName || user.name || user.email?.split("@")[0] || "";
      const userEmail = user.email || "";
      setFormData((prev) => ({
        ...prev,
        fullName: userFullName || prev.fullName,
        email: userEmail || prev.email,
        certificateName: userFullName || prev.certificateName,
      }));
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Enrolled Courses Data
  const [courses] = useState([
    {
      id: "course-1",
      slug: "react-nextjs-masterclass",
      title: isAr ? "دورة احتراف React 19 و Next.js App Router" : "React 19 & Next.js App Router Masterclass",
      instructor: isAr ? "محمد الكتاناني" : "Mohamed Katanani",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
      progress: 75,
      lastLessonTitle: isAr ? "الدرس 12: إدارة الحالة بالحاوية المتقدمة" : "Lesson 12: Advanced State Management",
      isCompleted: false,
    },
    {
      id: "course-2",
      slug: "ui-ux-design-system",
      title: isAr ? "بناء أنظمة التصميم الاحترافية UI/UX باستخدام Figma" : "Building Professional UI/UX Design Systems with Figma",
      instructor: isAr ? "د. طارق المنصور" : "Dr. Tarek Al-Mansoor",
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop",
      progress: 100,
      lastLessonTitle: isAr ? "مشروع التخرج: نظام تصميم متكامل" : "Capstone Project: Design System",
      isCompleted: true,
      certificateId: "CERT-892401",
    },
    {
      id: "course-3",
      slug: "python-machine-learning",
      title: isAr ? "أساسيات الذكاء الاصطناعي وتعلم الآلة بلغة Python" : "Python Machine Learning & AI Fundamentals",
      instructor: isAr ? "د. طارق المنصور" : "Dr. Tarek Al-Mansoor",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
      progress: 30,
      lastLessonTitle: isAr ? "الدرس 4: تنظيف ومعالجة البيانات" : "Lesson 4: Data Cleaning",
      isCompleted: false,
    },
  ]);

  // Order History Data
  const [orders] = useState([
    {
      id: "ORD-98214",
      date: "2026-02-10",
      courses: [isAr ? "دورة احتراف React 19 و Next.js" : "React 19 & Next.js Masterclass"],
      totalAmount: 49.99,
      status: "completed",
    },
    {
      id: "ORD-74102",
      date: "2026-01-15",
      courses: [isAr ? "بناء أنظمة التصميم Figma" : "UI/UX Design Systems"],
      totalAmount: 39.99,
      status: "completed",
    },
  ]);

  // Cart Data
  const [cartItems, setCartItems] = useState([
    {
      id: "course-4",
      title: isAr ? "احتراف الأمن السيبراني واختبار الاختراق" : "Cybersecurity & Penetration Testing",
      instructor: isAr ? "سارة الأحمد" : "Sarah Al-Ahmad",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop",
    },
  ]);

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setToastMessage(tWs("cartItemRemoved"));
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-2.5 bg-[#0F5244] text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
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

      {/* Top Student Header Card (Only rendered if standalone / not wrapped in StudentLayoutClient) */}
      {!hideSidebar && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-start">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#E8F3F1] border-2 border-emerald-200/80 overflow-hidden shadow-2xs flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-2xl sm:text-3xl text-[#0F5244]">{formData.fullName.charAt(0)}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900">{formData.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-extrabold">
                  {tWs("studentAccount")}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{formData.headline}</p>
              <p className="text-[11px] text-slate-400 font-medium pt-0.5">{formData.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Master Workspace Layout */}
      <div className={hideSidebar ? "w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-10 shadow-2xs" : "flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-10 items-start"}>
        {!hideSidebar && (
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tabId: string) => setActiveTab(tabId as any)}
            user={{
              name: formData.fullName,
              role: tStudent("roleStudent"),
              avatarUrl: avatarPreview,
            }}
          />
        )}

        {/* Main Display Area */}
        <div className={hideSidebar ? "w-full" : "flex-1 w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-10 shadow-2xs"}>
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {tWs("overviewSubtitle")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">{tWs("enrolled")}</span>
                  <div className="text-2xl font-black text-slate-900">{courses.length} {tWs("courses")}</div>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/60 space-y-1">
                  <span className="text-xs font-bold text-[#0F5244] uppercase">{tWs("certificatesCount")}</span>
                  <div className="text-2xl font-black text-[#0F5244]">{courses.filter(c => c.isCompleted).length} {tWs("earned")}</div>
                </div>
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200/60 space-y-1">
                  <span className="text-xs font-bold text-teal-800 uppercase">{tWs("hoursStudied")}</span>
                  <div className="text-2xl font-black text-teal-900">38.5 {tWs("hrs")}</div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0F5244] text-white space-y-4 shadow-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                  <h3 className="text-sm font-extrabold text-emerald-200 uppercase tracking-wider">
                    {tWs("continueLearning")}
                  </h3>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg sm:text-xl font-black">{courses[0].title}</h4>
                    <p className="text-xs text-emerald-100 mt-1 font-medium">{courses[0].lastLessonTitle}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("courses")}
                    className="px-6 py-3 rounded-2xl bg-white text-[#0F5244] hover:bg-emerald-50 text-xs font-black flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer shadow-2xs"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>{tWs("myCoursesBtn")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MY COURSES TAB */}
          {activeTab === "courses" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tWs("enrolledCourses")}
                </h2>

                {/* Course Filter Sub-Tabs */}
                <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCourseFilter("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      courseFilter === "all"
                        ? "bg-white text-[#0F5244] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tWs("all")} ({courses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseFilter("in_progress")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      courseFilter === "in_progress"
                        ? "bg-white text-[#0F5244] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tWs("inProgress")} ({courses.filter(c => !c.isCompleted).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseFilter("completed")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      courseFilter === "completed"
                        ? "bg-white text-[#0F5244] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tWs("completed")} ({courses.filter(c => c.isCompleted).length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {courses
                  .filter((course) => {
                    if (courseFilter === "in_progress") return !course.isCompleted;
                    if (courseFilter === "completed") return course.isCompleted;
                    return true;
                  })
                  .map((course) => (
                    <div
                      key={course.id}
                      className="h-full flex flex-col justify-between rounded-3xl border border-slate-200/80 p-5 hover:shadow-md transition-all bg-white"
                    >
                      <div className="space-y-4">
                        <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          <span
                            className={`absolute top-3 right-3 rtl:right-auto rtl:left-3 px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-xs ${
                              course.isCompleted ? "bg-emerald-600" : "bg-slate-900/80"
                            }`}
                          >
                            {course.isCompleted ? tWs("completedPercent") : `${course.progress}%`}
                          </span>
                        </div>

                        <div className="space-y-1 min-h-[3.25rem] flex flex-col justify-start">
                          <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">{course.title}</h3>
                          <p className="text-xs text-slate-500 font-medium">{course.instructor}</p>
                        </div>
                      </div>

                      {/* Bottom Footer Section (Progress Bar + Actions aligned at exact same bottom level) */}
                      <div className="mt-auto pt-4 space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-extrabold text-slate-500">
                            <span>{tWs("progressLabel")}</span>
                            <span className={course.isCompleted ? "text-emerald-700 font-black" : "text-[#0F5244] font-black"}>
                              {course.progress}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                course.isCompleted ? "bg-emerald-500" : "bg-[#0F5244]"
                              }`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab("courses")}
                            className="flex-1 py-2.5 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>{course.isCompleted ? tWs("completedStatus") : tWs("enrolledStatus")}</span>
                          </button>

                          {course.isCompleted && (
                            <Link
                              href={`/${locale}/student/certificates/${course.certificateId || "CERT-892401"}`}
                              className="px-4 py-2.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-[#0F5244] text-xs font-extrabold flex items-center gap-1.5 transition-all"
                            >
                              <Award className="h-4 w-4" />
                              <span>{tWs("certificateBtn")}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === "certificates" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {tWs("earnedCertificatesTitle")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.filter((c) => c.isCompleted).map((cert) => (
                  <div key={cert.id} className="p-6 rounded-3xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-[#0F5244]" />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{cert.title}</h4>
                        <span className="text-xs text-slate-400 font-mono">{cert.certificateId}</span>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/student/certificates/${cert.certificateId || "CERT-123"}`}
                      className="w-full py-2.5 rounded-2xl bg-[#0F5244] text-white text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>{tWs("downloadPdf")}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && <OrderHistoryView />}

          {/* CART TAB */}
          {activeTab === "cart" && (
            <CartView
              items={cartItems}
              onRemoveItem={handleRemoveFromCart}
            />
          )}

          {/* FULL ACCOUNT PROFILE & SETTINGS TAB */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in duration-150">
              
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {tStudent("title")}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {tStudent("subtitle")}
                </p>
              </div>

              {/* Avatar Change Section (5MB Limit) */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E8F3F1] border-2 border-emerald-200/80 overflow-hidden shrink-0 shadow-2xs cursor-pointer flex items-center justify-center"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-3xl sm:text-4xl text-[#0F5244]">
                      {formData.fullName.charAt(0)}
                    </span>
                  )}

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="h-6 w-6" />
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />

                <div className="space-y-1 text-center sm:text-start pt-1">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {t("avatarTitle")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                    {t("avatarSubtitle")}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium pt-1">
                    {tWs("avatarLimitNotice")}
                  </p>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{tWs("removePhoto")}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="border-b border-slate-100" />

              {/* Personal Information Fields */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  {t("personalDetails")}
                </h3>

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
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">{t("emailAddress")}</label>
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        className="text-xs font-extrabold text-[#0F5244] hover:underline cursor-pointer"
                      >
                        {t("change")}
                      </button>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-100 px-4 text-xs font-semibold text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">{t("phoneNumber")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">{t("headline")}</label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

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

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-[#FFFFFF] text-xs sm:text-sm font-extrabold shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t("saving")}</span>
                    </>
                  ) : (
                    <span>{t("saveChanges")}</span>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
