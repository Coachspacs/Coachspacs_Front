"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { updateUser } from "@/features/auth/slice";
import { userService } from "@/services/userService";
import { authService, getApiErrorMessage } from "@/services/auth";
import { enrollmentService } from "@/services/enrollmentService";
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
  CreditCard,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { normalizeInstructorSlug } from "@/lib/instructorProfile";
import { CartView } from "@/components/cart/CartView";
import { OrderHistoryView } from "@/components/orders/OrderHistoryView";
import { ChangeEmailModal } from "@/components/modals/ChangeEmailModal";
import { CourseCard } from "@/components/course/CourseCard";
import { Toast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  StudentOverviewTab,
  StudentCoursesTab,
  StudentCertificatesTab,
  StudentSettingsTab,
} from "./tabs";

function getSafeCourseImage(course: any): string {
  const defaultCover = "/images/courses/course-leadership.png";
  if (!course) return defaultCover;
  const candidates = [
    course.image,
    course.cover_image,
    course.thumbnail,
    course.coverImage,
  ];
  for (const c of candidates) {
    if (
      typeof c === "string" &&
      c.trim().length > 0 &&
      !c.includes("example.com")
    ) {
      return c.trim();
    }
    if (
      c &&
      typeof c === "object" &&
      typeof c.src === "string" &&
      c.src.trim().length > 0 &&
      !c.src.includes("example.com")
    ) {
      return c.src.trim();
    }
  }
  return defaultCover;
}

function getSafeAvatar(avatar: any): string | null {
  if (typeof avatar === "string" && avatar.trim().length > 0) {
    return avatar.trim();
  }
  if (
    avatar &&
    typeof avatar === "object" &&
    typeof avatar.src === "string" &&
    avatar.src.trim().length > 0
  ) {
    return avatar.src.trim();
  }
  return null;
}

interface StudentWorkspaceProps {
  initialTab?:
    | "overview"
    | "courses"
    | "certificates"
    | "orders"
    | "cart"
    | "settings";
  hideSidebar?: boolean;
}

export function StudentWorkspace({
  initialTab = "overview",
  hideSidebar = true,
}: StudentWorkspaceProps) {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const t = useTranslations("account");
  const tStudent = useTranslations("studentSettings");
  const tWs = useTranslations("studentWorkspace");
  const tChangeEmail = useTranslations("changeEmailModal");
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Active Workspace Section
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "certificates" | "orders" | "cart" | "settings"
  >(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<
    "all" | "in_progress" | "completed"
  >("all");

  // Keep activeTab in sync if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Read URL query parameter for course filter (e.g. ?filter=in_progress)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const f = params.get("filter");
      if (f === "in_progress" || f === "completed" || f === "all") {
        setCourseFilter(f as any);
      }
    }
  }, [pathname]);

  const handleNavigateTab = (
    tab: "overview" | "courses" | "certificates" | "orders" | "cart" | "settings",
    filter?: "all" | "in_progress" | "completed"
  ) => {
    if (filter) {
      setCourseFilter(filter);
    }
    setActiveTab(tab);
    const targetUrl = `/${locale}/student/${tab === "overview" ? "" : tab}${filter ? `?filter=${filter}` : ""}`;
    router.push(targetUrl);
  };

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
    certificateName:
      user?.fullName || user?.name || tStudent("defaultCertificateName"),
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
      const userFullName =
        user.fullName || user.name || user.email?.split("@")[0] || "";
      const userEmail = user.email || "";
      setFormData((prev) => ({
        ...prev,
        fullName: userFullName || prev.fullName,
        email: userEmail || prev.email,
        certificateName: userFullName || prev.certificateName,
      }));
      setAvatarPreview(getSafeAvatar(user.avatar));
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Enrolled Courses Data
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Load enrolled courses from API with localStorage fallback
  useEffect(() => {
    async function fetchLiveEnrollments() {
      setIsLoadingCourses(true);
      const defaultCover = "/images/courses/course-leadership.png";

      try {
        const enrollments = await enrollmentService.getMyEnrollments();
        if (Array.isArray(enrollments)) {
          const mapped = enrollments.map((enr: any) => {
            const c = enr.course || {};
            const total = c.total_lessons || enr.total_lessons || 10;
            const progress = enr.progress_percent ?? 0;
            const validImg = getSafeCourseImage(c);

            return {
              id: c.id || enr.course_id || enr.id,
              enrollmentId: enr.id,
              title: isAr ? c.title_ar || c.title : c.title_en || c.title,
              instructor:
                typeof c.instructor === "object"
                  ? c.instructor?.name || c.instructor?.full_name
                  : c.instructor || "CoachSpace Instructor",
              instructorId:
                typeof c.instructor === "object" ? c.instructor?.id : undefined,
              image: validImg,
              cover_image: validImg,
              coverImage: validImg,
              thumbnail: validImg,
              progress,
              totalLessons: total,
              completedLessons:
                enr.completed_lessons?.length ||
                Math.round((progress / 100) * total),
              isCompleted: Boolean(enr.is_completed || progress >= 100),
              certificateId:
                enr.certificate?.id ||
                enr.certificate?.certificate_code ||
                (progress >= 100 ? `CERT-${enr.id}` : null),
            };
          });
          setCourses(mapped);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "coachspace_enrolled_courses",
              JSON.stringify(mapped),
            );
          }
          setIsLoadingCourses(false);
          return;
        }
      } catch (err) {
        console.warn(
          "[StudentWorkspace] Live enrollments fetch skipped / fallback to local:",
          err,
        );
      }

      // Fallback to localStorage
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("coachspace_enrolled_courses");
          if (saved) {
            const list = JSON.parse(saved);
            if (Array.isArray(list) && list.length > 0) {
              const sanitized = list.map((item: any) => {
                const img = getSafeCourseImage(item);
                return {
                  ...item,
                  image: img,
                  thumbnail: img,
                  cover_image: img,
                  coverImage: img,
                };
              });
              setCourses(sanitized);
            }
          }
        } catch (err) {
          console.warn(
            "[StudentWorkspace] Could not load enrolled courses:",
            err,
          );
        }
      }
      setIsLoadingCourses(false);
    }

    fetchLiveEnrollments();
  }, [isAr]);

  // Order History Data
  const [orders] = useState<any[]>([]);

  // Cart Data
  const [cartItems, setCartItems] = useState<any[]>([]);

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setToastMessage(tWs("cartItemRemoved"));
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(tStudent("avatarSizeExceeded"));
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    try {
      const res = await userService.uploadAvatar(file);
      if (res?.avatar) {
        setAvatarPreview(res.avatar);
        dispatch(updateUser({ avatar: res.avatar }));
        setToastMessage(tStudent("avatarUpdated"));
      }
    } catch (err: any) {
      console.warn("[StudentWorkspace] uploadAvatar error:", err?.message);
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
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
    try {
      if (formData.currentPassword && formData.newPassword) {
        await authService.changePassword({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        });
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      const updated = await userService.updateMyProfile({
        full_name: formData.fullName.trim(),
        phone_number: formData.phone?.trim() || undefined,
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

      setToastMessage(t("changesSaved"));
    } catch (err: any) {
      console.warn("[StudentWorkspace] Error saving settings:", err);
      const msg = getApiErrorMessage(
        err,
        t("saveChangesFailed") ||
          (isAr ? "فشل حفظ التغييرات" : "Failed to save changes"),
        isAr,
      );
      setToastMessage(msg);
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Email Change Modal */}
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

      {/* Top Student Header Card (Only rendered if standalone / not wrapped in StudentLayoutClient) */}
      {!hideSidebar && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-start">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#E8F3F1] border-2 border-emerald-200/80 overflow-hidden shadow-2xs flex items-center justify-center">
                {getSafeAvatar(avatarPreview) ? (
                  <Image
                    src={getSafeAvatar(avatarPreview)!}
                    alt="Student"
                    width={96}
                    height={96}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-black text-2xl sm:text-3xl text-[#0F5244]">
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
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-extrabold">
                  {(user?.role || "").toLowerCase() === "instructor" ||
                  (user?.role || "").toLowerCase() === "coach"
                    ? tWs("instructorAccount")
                    : tWs("studentAccount")}
                </span>
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

      {/* Master Workspace Layout */}
      <div
        className={
          hideSidebar
            ? "w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-8 shadow-2xs"
            : "flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-10 items-start"
        }
      >
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
        <div
          className={
            hideSidebar
              ? "w-full"
              : "flex-1 w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-8 shadow-2xs"
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
                <StudentOverviewTab
                  courses={courses}
                  isLoading={isLoadingCourses}
                  onNavigateTab={handleNavigateTab}
                />
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
                <StudentCoursesTab
                  courses={courses}
                  isLoading={isLoadingCourses}
                  initialFilter={courseFilter}
                />
              </motion.div>
            )}

            {activeTab === "certificates" && (
              <motion.div
                key="certificates"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <StudentCertificatesTab courses={courses} />
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <OrderHistoryView />
              </motion.div>
            )}

            {activeTab === "cart" && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <CartView items={cartItems} onRemoveItem={handleRemoveFromCart} />
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
                <StudentSettingsTab
                  formData={formData}
                  avatarPreview={avatarPreview}
                  onAvatarChange={handleAvatarFileChange}
                  onInputChange={handleInputChange}
                  onSaveSettings={handleSaveSettings}
                  isSaving={isSaving}
                  onOpenEmailModal={() => setShowEmailModal(true)}
                  passwordError={passwordError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
