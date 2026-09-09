"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/lib/store";
import { updateUser } from "@/features/auth/slice";
import { userService } from "@/services/userService";
import { authService, getApiErrorMessage } from "@/services/auth";
import {
  updatePublicInstructorOverrides,
  getSavedInstructorOverrides,
  normalizeInstructorSlug,
} from "@/lib/instructorProfile";
import {
  User,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Globe,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Briefcase,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
  Loader2,
  Check,
  Clock,
} from "lucide-react";
import { SkillSelector } from "@/components/ui/SkillSelector";
import { ChangeEmailModal } from "@/components/modals/ChangeEmailModal";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

type SettingsTab = "profile" | "security";

export function InstructorSettingsView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tStudent = useTranslations("studentSettings");
  const tChangeEmail = useTranslations("changeEmailModal");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const { user } = useSelector((state: RootState) => state.auth);
  const approvalStatus = (
    user?.approval_status ||
    (user as any)?.approvalStatus ||
    (user as any)?.instructorStatus ||
    "approved"
  ).toLowerCase();
  const isApproved = approvalStatus === "approved";

  // Active Tab: 2 clean tabs only
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Avatar & File ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Email Change Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Guard so we only initialize from backend/localStorage ONCE and never overwrite user while editing
  const isInitializedRef = useRef(false);

  // Form State initialized with dynamic auth user data
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    headline: string;
    specialization: string;
    experienceYears: number | string;
    bio: string;
    skills: string[];
    hourlyRate: string;
    location: string;
    website: string;
    linkedin: string;
    twitter: string;
    github: string;
    socialEmail: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || user?.phone_number || "",
    headline: user?.headline || "",
    specialization: user?.specialization || "",
    experienceYears: (user as any)?.experienceYears ?? 0,
    bio: user?.bio || "",
    skills: Array.isArray((user as any)?.skills) ? (user as any).skills : [],
    hourlyRate: (user as any)?.hourlyRate || "",
    location: (user as any)?.location || "",

    // Social Links
    website: (user as any)?.website || "",
    linkedin: (user as any)?.linkedin || "",
    twitter: (user as any)?.twitter || "",
    github: (user as any)?.github || "",
    socialEmail: user?.email || "",

    // Security
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileFetchedRef = useRef(false);

  // 1. Initial load effect - runs ONLY ONCE when user data is ready
  useEffect(() => {
    setMounted(true);
    if (isInitializedRef.current) return;
    if (!user && typeof window === "undefined") return;

    const userFullName = user?.fullName || user?.name || "";
    const activeSlug = userFullName ? normalizeInstructorSlug(userFullName) : "";
    const savedOverrides = activeSlug
      ? {
          ...(getSavedInstructorOverrides(activeSlug) || {}),
          ...(getSavedInstructorOverrides(`inst-${activeSlug}`) || {}),
        }
      : {};

    let globalProfile: any = {};
    try {
      const raw = localStorage.getItem("coachspace_active_instructor_profile");
      if (raw) globalProfile = JSON.parse(raw);
    } catch {}

    const merged = { ...globalProfile, ...savedOverrides };
    const rawHeadline = user?.headline ?? merged.headline ?? "";
    const isGenericHeadline =
      !rawHeadline ||
      rawHeadline.toLowerCase().includes("student") ||
      rawHeadline.includes("طالب") ||
      rawHeadline.toLowerCase().includes("certified instructor") ||
      rawHeadline.includes("مدرب معتمد") ||
      rawHeadline.includes("مدرب موثوق") ||
      rawHeadline.includes("مدرب وخبير معتمد");

    setFormData({
      fullName:
        user?.fullName || user?.name || merged.name || merged.fullName || "",
      email: user?.email || merged.email || "",
      phone: user?.phone || user?.phone_number || merged.phone || "",
      headline: isGenericHeadline ? "" : rawHeadline,
      specialization: user?.specialization ?? merged.specialization ?? "",
      experienceYears:
        (user as any)?.experienceYears ?? merged.experienceYears ?? 0,
      bio: user?.bio ?? merged.bio ?? "",
      skills:
        Array.isArray((user as any)?.skills) && (user as any).skills.length > 0
          ? (user as any).skills
          : Array.isArray(merged.skills)
          ? merged.skills
          : [],
      hourlyRate: (user as any)?.hourlyRate ?? merged.hourlyRate ?? "",
      location: (user as any)?.location ?? merged.location ?? "",
      website: merged.socials?.website ?? (user as any)?.website ?? "",
      linkedin: merged.socials?.linkedin ?? (user as any)?.linkedin ?? "",
      twitter: merged.socials?.twitter ?? (user as any)?.twitter ?? "",
      github: merged.socials?.github ?? (user as any)?.github ?? "",
      socialEmail: merged.socials?.email ?? user?.email ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    if (user?.avatar || merged.avatar) {
      setAvatarPreview(user?.avatar || merged.avatar || null);
    }

    isInitializedRef.current = true;
  }, [user]);

  // 2. Fetch full user profile from backend API once
  useEffect(() => {
    if (!mounted || profileFetchedRef.current) return;
    profileFetchedRef.current = true;

    async function fetchProfile() {
      try {
        const profile = await userService.getMyProfile();
        if (profile) {
          const profData = (profile as any)?.user || profile;
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || profData.full_name || profData.fullName || "",
            email: prev.email || profData.email || "",
            phone: prev.phone || profData.phone_number || profData.phone || "",
          }));
          const backendAvatar =
            profData.avatar ||
            profData.avatar_url ||
            profData.profile_picture ||
            null;
          if (backendAvatar) {
            setAvatarPreview(backendAvatar);
          }
        }
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.response?.status !== 403) {
          console.warn("[InstructorSettingsView] getMyProfile fetch:", err?.message);
        }
      }
    }
    fetchProfile();
  }, [mounted]);

  // Handle all inputs - allows clearing numbers without stuck 0
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
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
      setToastMessage(tStudent("avatarSizeError"));
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setIsUploadingAvatar(true);

    try {
      const res = await userService.uploadAvatar(file);
      if (res?.avatar) {
        setAvatarPreview(res.avatar);
        dispatch(updateUser({ avatar: res.avatar }));
        setToastMessage(tInst("avatarUpdatedSuccess"));
      }
    } catch (err: any) {
      const msg = getApiErrorMessage(err, tInst("avatarUploadFailed"), isAr);
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsUploadingAvatar(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setErrorMessage(null);

    // Only validate password if user actually typed a password change
    const hasPasswordInput = Boolean(
      formData.newPassword.trim() ||
      formData.confirmPassword.trim() ||
      formData.currentPassword.trim()
    );

    if (hasPasswordInput) {
      if (!formData.currentPassword.trim()) {
        setPasswordError(
          isAr
            ? "يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور"
            : "Current password is required to set a new password",
        );
        setActiveTab("security");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError(t("passwordsDoNotMatch"));
        setActiveTab("security");
        return;
      }
      if (formData.newPassword.length < 8) {
        setPasswordError(t("passwordMinLength"));
        setActiveTab("security");
        return;
      }
    }

    setIsSaving(true);

    try {
      if (hasPasswordInput && formData.currentPassword && formData.newPassword) {
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

      const cleanWebsite = formData.website?.trim() || "";
      const cleanLinkedin = formData.linkedin?.trim() || "";
      const cleanTwitter = formData.twitter?.trim() || "";
      const cleanGithub = formData.github?.trim() || "";
      const cleanSocialEmail = formData.socialEmail?.trim() || "";

      const userFullName = formData.fullName.trim();
      const currentSlug = normalizeInstructorSlug(userFullName) || "instructor";

      const profileUpdates = {
        name: userFullName,
        nameAr: userFullName,
        headline: formData.headline.trim(),
        headlineAr: formData.headline.trim(),
        specialization: formData.specialization.trim(),
        specializationAr: formData.specialization.trim(),
        experienceYears:
          formData.experienceYears === "" ? 0 : Number(formData.experienceYears),
        bio: formData.bio.trim(),
        bioAr: formData.bio.trim(),
        skills: formData.skills,
        skillsAr: formData.skills,
        hourlyRate: formData.hourlyRate?.trim() || undefined,
        hourlyRateAr: formData.hourlyRate?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        locationAr: formData.location?.trim() || undefined,
        avatar: avatarPreview || user?.avatar || undefined,
        socials: {
          website: cleanWebsite,
          linkedin: cleanLinkedin,
          twitter: cleanTwitter,
          github: cleanGithub,
          email: cleanSocialEmail,
        },
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "coachspace_active_instructor_profile",
            JSON.stringify(profileUpdates),
          );
          if (currentSlug) {
            localStorage.setItem(
              `coachspace_inst_profile_${currentSlug}`,
              JSON.stringify(profileUpdates),
            );
          }
        } catch (e) {
          console.warn("Could not save to localStorage", e);
        }
      }

      updatePublicInstructorOverrides("global", profileUpdates);
      if (currentSlug) {
        updatePublicInstructorOverrides(currentSlug, profileUpdates);
        updatePublicInstructorOverrides(`inst-${currentSlug}`, profileUpdates);
      }
      if (user?.id) {
        updatePublicInstructorOverrides(user.id, profileUpdates);
        updatePublicInstructorOverrides(`inst-${user.id}`, profileUpdates);
      }

      try {
        await userService.updateMyProfile({
          full_name: formData.fullName.trim(),
          phone_number: formData.phone.trim(),
          preferred_language: locale,
        });
      } catch (apiErr) {
        console.warn("Backend profile update info:", apiErr);
      }

      dispatch(
        updateUser({
          fullName: formData.fullName.trim(),
          name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          phoneNumber: formData.phone.trim(),
          headline: formData.headline.trim(),
          bio: formData.bio.trim(),
          specialization: formData.specialization.trim(),
          avatar: avatarPreview || user?.avatar,
        }),
      );

      setToastMessage(tInst("profileSavedToast"));
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, tInst("profileSaveFailed"), isAr);
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const publicProfileSlug = normalizeInstructorSlug(
    formData.fullName || user?.fullName || user?.name || "instructor",
  );

  return (
    <div
      className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#0F5244] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold backdrop-blur-md"
          >
            <CheckCircle2 className="h-4 w-4 text-[#45D1B4] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold backdrop-blur-md"
          >
            <AlertCircle className="h-4 w-4 text-white shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Email Modal */}
      {showEmailModal && (
        <ChangeEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          currentEmail={formData.email}
          onConfirmEmailChange={(newEmail: string) => {
            setFormData((prev) => ({ ...prev, email: newEmail }));
            setToastMessage(tChangeEmail("success"));
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />
      )}

      {/* Unified Sleek Main Settings Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t("accountSettings")}
              </h1>
              {isApproved ? (
                <VerifiedBadge size="md" />
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 text-[11px] font-bold">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>{tInst("underReviewBadge")}</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isAr
                ? "إدارة بياناتك الشخصية، النبذة التعريفية، وحماية حسابك في مكان واحد وبكل سهولة."
                : "Manage your personal profile, biography, and security settings seamlessly."}
            </p>
          </div>

          {/* View Public Profile Link */}
          <Link
            href={`/${locale}/instructors/${publicProfileSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>{tInst("viewPublicProfile")}</span>
            <ExternalLink className="h-3 w-3 text-slate-400 rtl:rotate-180" />
          </Link>
        </div>

        {/* 2 Clean Tab Buttons */}
        <div className="flex items-center gap-2 px-6 sm:px-8 pt-4 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 pb-3.5 px-2 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === "profile"
                ? "border-[#0F5244] text-[#0F5244]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <User className="h-4 w-4" />
            <span>{isAr ? "الملف التعريفي والبيانات" : "Profile & Details"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 pb-3.5 px-2 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === "security"
                ? "border-[#0F5244] text-[#0F5244]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>{isAr ? "الأمان وكلمة المرور" : "Security & Password"}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          <AnimatePresence mode="wait">
            {/* ================= TAB 1: PROFILE & DETAILS ================= */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                {/* Clean Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                  <div className="relative group w-20 h-20 rounded-full bg-[#0F5244]/10 text-[#0F5244] border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {avatarPreview ? (
                      <Image
                        suppressHydrationWarning
                        src={avatarPreview}
                        alt="Avatar"
                        width={80}
                        height={80}
                        unoptimized
                        onError={() => setAvatarPreview(null)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        suppressHydrationWarning
                        className="select-none font-bold text-2xl text-[#0F5244]"
                      >
                        {(mounted ? formData.fullName : "")
                          .trim()
                          .charAt(0)
                          .toUpperCase() || "U"}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />

                  <div className="space-y-1 text-center sm:text-start flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                      {t("avatarTitle")}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal">
                      {isAr
                        ? "صورة واضحة بحجم أقصى 5 ميجابايت بصيغة JPG أو PNG أو WebP."
                        : "Clear square photo up to 5MB (JPG, PNG, or WebP)."}
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F5244]" />
                        ) : (
                          <Camera className="h-3.5 w-3.5 text-slate-500" />
                        )}
                        <span>{tInst("uploadPhotoBtn")}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-bold text-slate-700"
                    >
                      {tInst("fullNameLabel")} *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Mohammed Katanani"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Specialization */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="specialization"
                      className="block text-xs font-bold text-slate-700"
                    >
                      {tInst("specializationLabel")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Software Architecture"
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
                      />
                      <Briefcase className="h-4 w-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="headline"
                      className="block text-xs font-bold text-slate-700"
                    >
                      {tInst("headlineLabel")}
                    </label>
                    <input
                      type="text"
                      id="headline"
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      placeholder="e.g. Certified Master Coach & Tech Lead"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Experience Years */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="experienceYears"
                      className="block text-xs font-bold text-slate-700"
                    >
                      {tInst("experienceYearsLabel")}
                    </label>
                    <input
                      type="number"
                      id="experienceYears"
                      name="experienceYears"
                      min={0}
                      max={50}
                      value={formData.experienceYears}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold text-slate-700"
                    >
                      {t("phoneNumber")}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+962 7XXXXXXXX"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="location"
                      className="block text-xs font-bold text-slate-700"
                    >
                      {tInst("locationLabel")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder={tInst("locationPlaceholder")}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                      />
                      <MapPin className="h-4 w-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Bio Textarea */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bio"
                    className="block text-xs font-bold text-slate-700"
                  >
                    {tInst("bioLabel")}
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder={tInst("bioPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Skills */}
                <SkillSelector
                  selectedSkills={formData.skills}
                  onChange={(newSkills) =>
                    setFormData((prev) => ({ ...prev, skills: newSkills }))
                  }
                  maxSkills={6}
                  isAr={isAr}
                  label={tInst("selectedSkillsLabel")}
                />

                {/* Streamlined Social Links */}
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                      {isAr ? "روابط الحسابات المهنية (اختياري)" : "Professional Links (Optional)"}
                    </h3>
                    <p className="text-xs text-slate-400 font-normal">
                      {isAr
                        ? "تظهر هذه الروابط في صفحتك العامة لتعزيز ثقة الطلاب والمهتمين."
                        : "These links will appear on your public profile to build credibility."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Website */}
                    <div className="relative">
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder={isAr ? "الموقع الشخصي (https://...)" : "Personal Website"}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-9 rtl:pr-3.5 rtl:pl-9 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                      />
                      <Globe className="h-4 w-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3 pointer-events-none" />
                    </div>

                    {/* LinkedIn */}
                    <div className="relative">
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder={isAr ? "رابط حساب لينكد إن" : "LinkedIn Profile URL"}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-9 rtl:pr-3.5 rtl:pl-9 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                      />
                      <Linkedin className="h-4 w-4 text-[#0077B5] absolute right-3 rtl:right-auto rtl:left-3 top-3 pointer-events-none" />
                    </div>

                    {/* GitHub */}
                    <div className="relative">
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder={isAr ? "رابط جيت هب (GitHub)" : "GitHub Profile URL"}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-9 rtl:pr-3.5 rtl:pl-9 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                      />
                      <Github className="h-4 w-4 text-slate-800 absolute right-3 rtl:right-auto rtl:left-3 top-3 pointer-events-none" />
                    </div>

                    {/* Twitter */}
                    <div className="relative">
                      <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        placeholder={isAr ? "رابط إكس / تويتر" : "X / Twitter URL"}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-9 rtl:pr-3.5 rtl:pl-9 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                      />
                      <Twitter className="h-4 w-4 text-[#1DA1F2] absolute right-3 rtl:right-auto rtl:left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= TAB 2: SECURITY & PASSWORD ================= */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {passwordError && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* Login Email */}
                <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {t("emailAddress")} (Login)
                      </h4>
                      <p className="text-xs text-slate-500 font-normal">
                        {isAr
                          ? "البريد الإلكتروني المعتمد لتسجيل الدخول واستلام الإشعارات الرسمية."
                          : "Primary email used for sign-in and platform notifications."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F5244] hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                    >
                      {t("change")}
                    </button>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 text-xs font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>

                {/* Change Password */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      {isAr ? "تغيير كلمة المرور" : "Change Password"}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {isAr
                        ? "اترك الحقول فارغة إذا كنت لا ترغب بتغيير كلمة المرور الحالية."
                        : "Leave fields empty if you don't wish to change your current password."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {t("currentPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 rtl:right-auto rtl:left-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {t("newPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 rtl:right-auto rtl:left-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {t("confirmPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 rtl:right-auto rtl:left-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-medium order-2 sm:order-1 text-center sm:text-start">
              {tInst("saveNotice")}
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 order-1 sm:order-2 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{tInst("savingBtn")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#45D1B4]" />
                  <span>{tInst("saveChangesBtn")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
