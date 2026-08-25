"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { updateUser } from "@/features/auth/slice";
import { userService } from "@/services/userService";
import { authService, getApiErrorMessage } from "@/services/auth";
import {
  updatePublicInstructorOverrides,
  getSavedInstructorOverrides,
  normalizeInstructorSlug,
} from "@/lib/mockInstructors";
import {
  User,
  Lock,
  CreditCard,
  Camera,
  CheckCircle2,
  AlertCircle,
  Globe,
  Building,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Briefcase,
  Award,
  Sparkles,
  HelpCircle,
  Eye,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";
import { SkillSelector } from "@/components/ui/SkillSelector";

const ChangeEmailModal = dynamic(
  () => import("@/components/modals/ChangeEmailModal").then((mod) => mod.ChangeEmailModal),
  { ssr: false }
);

type SettingsTab = "profile" | "socials" | "payout" | "security";

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

  // Active Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Avatar & File ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Email Change Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form State initialized with realistic dynamic defaults
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || "Mohammed Katanani",
    email: user?.email || "instructor@coachspace.com",
    phone: user?.phone || user?.phone_number || "+966 50 123 4567",
    headline: user?.headline || "Certified Master Coach & Senior Tech Lead",
    specialization: user?.specialization || "Software Architecture & Executive Leadership",
    experienceYears: (user as any)?.experienceYears ?? 8,
    bio:
      user?.bio ||
      "Dedicated professional instructor on CoachSpace committed to delivering world-class educational experiences, real-world project skills, and career mentorship.",
    skills: ["System Design", "Next.js", "React.js", "Cloud Architecture", "Clean Code & Architecture"],

    // Optional rate and location
    hourlyRate: "",
    location: "Riyadh, Saudi Arabia",

    // Social Links (Optional)
    website: "",
    linkedin: "",
    twitter: "",
    github: "",
    socialEmail: user?.email || "",

    // Payout & Billing
    payoutMethod: "bank",
    bankIban: (user as any)?.bankIban || "SA0380000000608010167519",
    paypalEmail: user?.email || "instructor@coachspace.com",

    // Security
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileFetchedRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    // 1. Fetch saved instructor overrides on mount
    const activeSlug = normalizeInstructorSlug(user?.fullName || user?.name || "Mohammed Katanani");
    const savedOverrides = {
      ...getSavedInstructorOverrides("global"),
      ...getSavedInstructorOverrides("inst-mohammed-katanani"),
      ...getSavedInstructorOverrides("mohammed-katanani"),
      ...(activeSlug ? getSavedInstructorOverrides(activeSlug) : {}),
      ...(activeSlug ? getSavedInstructorOverrides(`inst-${activeSlug}`) : {}),
    };

    let globalActive: any = {};
    if (typeof window !== "undefined") {
      try {
        globalActive = JSON.parse(localStorage.getItem("coachspace_active_instructor_profile") || "{}");
      } catch (e) {
        globalActive = {};
      }
    }

    const merged = { ...globalActive, ...savedOverrides };

    if (Object.keys(merged).length > 0) {
      setFormData((prev) => ({
        ...prev,
        fullName: (merged.name as string) || (user?.fullName || user?.name || prev.fullName),
        headline: (merged.headline as string) || prev.headline,
        specialization: (merged.specialization as string) || prev.specialization,
        experienceYears: (merged.experienceYears as number) ?? prev.experienceYears,
        bio: (merged.bio as string) || prev.bio,
        skills: Array.isArray(merged.skills) && merged.skills.length > 0 ? merged.skills : prev.skills,
        hourlyRate: merged.hourlyRate !== undefined ? merged.hourlyRate : prev.hourlyRate,
        location: merged.location !== undefined ? merged.location : prev.location,
        website: merged.socials?.website !== undefined ? merged.socials.website : prev.website,
        linkedin: merged.socials?.linkedin !== undefined ? merged.socials.linkedin : prev.linkedin,
        twitter: merged.socials?.twitter !== undefined ? merged.socials.twitter : prev.twitter,
        github: merged.socials?.github !== undefined ? merged.socials.github : prev.github,
        socialEmail: merged.socials?.email !== undefined ? merged.socials.email : prev.socialEmail,
      }));

      if (merged.avatar) {
        setAvatarPreview(merged.avatar);
      }
    }

    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar, user?.fullName, user?.name]);

  // Fetch full user profile from backend API once
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
            fullName: profData.full_name || profData.fullName || prev.fullName,
            email: profData.email || prev.email,
            phone: profData.phone_number || profData.phone || prev.phone,
          }));
          if (profData.avatar) {
            setAvatarPreview(profData.avatar);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const msg = getApiErrorMessage(
        err,
        tInst("avatarUploadFailed"),
        isAr
      );
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsUploadingAvatar(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    dispatch(updateUser({ avatar: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setErrorMessage(null);

    // Password validation
    if (formData.newPassword || formData.confirmPassword) {
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
        experienceYears: Number(formData.experienceYears) || 0,
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
          localStorage.setItem("coachspace_active_instructor_profile", JSON.stringify(profileUpdates));
        } catch (e) {
          console.warn("Could not save to localStorage", e);
        }
      }

      updatePublicInstructorOverrides("global", profileUpdates);
      updatePublicInstructorOverrides("inst-mohammed-katanani", profileUpdates);
      updatePublicInstructorOverrides("mohammed-katanani", profileUpdates);
      updatePublicInstructorOverrides("inst-tariq-al-mansoor", profileUpdates);
      updatePublicInstructorOverrides("tariq-al-mansoor", profileUpdates);
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
        })
      );

      setToastMessage(tInst("profileSavedToast"));
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        tInst("profileSaveFailed"),
        isAr
      );
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const publicProfileSlug = normalizeInstructorSlug(
    formData.fullName || user?.fullName || user?.name || "instructor"
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 font-sans" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#0F5244] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#45D1B4] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-3 duration-200">
          <AlertCircle className="h-4 w-4 text-white shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Change Email Modal */}
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

      {/* Soft Top Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/70 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-100 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-[#0F5244]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {tInst("profileSettingsTitle")}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#0F5244] text-[11px] font-bold border border-emerald-100">
                {tInst("approvedBadge")}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {tInst("profileSettingsDesc")}
            </p>
          </div>
        </div>

        {/* View Public Profile Link */}
        <Link
          href={`/${locale}/instructors/${publicProfileSlug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          <span>{tInst("viewPublicProfile")}</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Main Settings Card */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Calm Underline Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-100 pb-3 overflow-x-auto">
            {[
              { id: "profile", label: tInst("tabBasicInfo"), icon: User },
              { id: "socials", label: tInst("tabSocialLinks"), icon: Globe },
              { id: "payout", label: tInst("tabPayout"), icon: CreditCard },
              { id: "security", label: tInst("tabSecurity"), icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
                    active
                      ? "text-[#0F5244]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#0F5244]" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F5244] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ================= SECTION 1: BASIC INFO & BIO ================= */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Soft Avatar Box */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-20 h-20 rounded-full bg-[#E6F3EF] border-2 border-slate-200 shadow-2xs overflow-hidden shrink-0 cursor-pointer flex items-center justify-center"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span suppressHydrationWarning className="select-none font-bold text-2xl text-[#0F5244]">
                      {(mounted ? formData.fullName : "").trim().charAt(0).toUpperCase() || "U"}
                    </span>
                  )}

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-full">
                    <Camera className="h-5 w-5" />
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
                  <h3 className="text-sm font-bold text-slate-800">
                    {t("avatarTitle")}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    {tInst("avatarHint")}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {tInst("uploadPhotoBtn")}
                    </button>

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        {tStudent("removePhoto")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("fullNameLabel")} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Mohammed Katanani"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 transition-all"
                  />
                </div>

                {/* Specialization */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("specializationLabel")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Software Architecture"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 transition-all"
                    />
                    <Briefcase className="h-4 w-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("headlineLabel")}
                  </label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    placeholder="e.g. Certified Master Coach & Tech Lead"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 transition-all"
                  />
                </div>

                {/* Years of Experience */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("experienceYearsLabel")} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="experienceYears"
                      min={0}
                      max={60}
                      value={formData.experienceYears}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 8"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 transition-all"
                    />
                    <Award className="h-4 w-4 text-amber-500 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("phoneNumber")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                  />
                </div>

                {/* Account Email */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      {t("emailAddress")} (Login)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="text-xs font-bold text-[#0F5244] hover:underline cursor-pointer"
                    >
                      {t("change")}
                    </button>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 text-xs font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>

                {/* Hourly Rate (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("hourlyRateLabel")}
                  </label>
                  <input
                    type="text"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    placeholder={tInst("hourlyRatePlaceholder")}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none transition-all"
                  />
                </div>

                {/* Location (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("locationLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
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

              {/* ================= TAG PICKER & DYNAMIC SUGGESTIONS ================= */}
              <SkillSelector
                selectedSkills={formData.skills}
                onChange={(newSkills) => setFormData((prev) => ({ ...prev, skills: newSkills }))}
                maxSkills={6}
                isAr={isAr}
                label={tInst("selectedSkillsLabel")}
              />

              {/* Bio Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {tInst("bioLabel")} *
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  placeholder={tInst("bioPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/10 transition-all resize-none leading-relaxed"
                />
              </div>

            </div>
          )}

          {/* ================= SECTION 2: SOCIAL LINKS ================= */}
          {activeTab === "socials" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                <HelpCircle className="h-4 w-4 text-[#0F5244] shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                  {tInst("socialLinksHint")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Website */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("websiteUrlLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                    <Globe className="h-4 w-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("linkedinUrlLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                    <Linkedin className="h-4 w-4 text-[#0077B5] absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Twitter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("twitterUrlLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/username"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                    <Twitter className="h-4 w-4 text-[#1DA1F2] absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Public Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("publicEmailLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="socialEmail"
                      value={formData.socialEmail}
                      onChange={handleChange}
                      placeholder="contact@example.com"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                    <Mail className="h-4 w-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* GitHub */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("githubUrlLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                    <Github className="h-4 w-4 text-slate-800 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= SECTION 3: PAYOUT & BILLING ================= */}
          {activeTab === "payout" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  {tInst("payoutMethod")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label
                    className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      formData.payoutMethod === "bank"
                        ? "border-[#0F5244] bg-emerald-50/40"
                        : "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="bank"
                      checked={formData.payoutMethod === "bank"}
                      onChange={handleChange}
                      className="accent-[#0F5244]"
                    />
                    <Building className="h-4 w-4 text-[#0F5244]" />
                    <span className="text-xs font-bold text-slate-800">
                      {tInst("bankTransfer")}
                    </span>
                  </label>

                  <label
                    className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      formData.payoutMethod === "paypal"
                        ? "border-[#0F5244] bg-emerald-50/40"
                        : "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="paypal"
                      checked={formData.payoutMethod === "paypal"}
                      onChange={handleChange}
                      className="accent-[#0F5244]"
                    />
                    <Globe className="h-4 w-4 text-[#0F5244]" />
                    <span className="text-xs font-bold text-slate-800">PayPal</span>
                  </label>
                </div>
              </div>

              {formData.payoutMethod === "bank" ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("bankIbanLabel")}
                  </label>
                  <input
                    type="text"
                    name="bankIban"
                    value={formData.bankIban}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {tInst("paypalEmailLabel")}
                  </label>
                  <input
                    type="email"
                    name="paypalEmail"
                    value={formData.paypalEmail}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>
              )}

            </div>
          )}

          {/* ================= SECTION 4: SECURITY ================= */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {passwordError && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("currentPassword")}
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("newPassword")}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("confirmPassword")}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-b border-slate-100" />

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <p className="text-xs text-slate-400 font-medium order-2 sm:order-1">
              {tInst("saveNotice")}
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 order-1 sm:order-2 active:scale-95"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{tInst("savingBtn")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#45D1B4]" />
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
