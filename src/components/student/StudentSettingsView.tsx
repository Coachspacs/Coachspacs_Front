"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { updateUser } from "@/features/auth/slice";
import { userService } from "@/services/userService";
import { authService, getApiErrorMessage } from "@/services/auth";
import {
  User,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

import { ChangeEmailModal } from "@/components/modals/ChangeEmailModal";

type SettingsTab = "profile" | "security";

export function StudentSettingsView() {
  const dispatch = useDispatch();
  const t = useTranslations("account");
  const tStudent = useTranslations("studentSettings");
  const tChangeEmail = useTranslations("changeEmailModal");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector((state: RootState) => state.auth);

  // Active Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Avatar & File ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password Visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Change Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Success celebration trigger
  const [isSavedCelebration, setIsSavedCelebration] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || user?.phone_number || "",
    headline: user?.headline || "",
    learningGoal: "",
    preferredCategory: "Data Science",
    videoSpeed: "1x",
    certificateName: user?.fullName || user?.name || "",

    // Security
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileFetchedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial sync from Redux state on first mount
    if (user && !profileFetchedRef.current) {
      const userFullName = user.fullName || user.name || (user.email ? user.email.split("@")[0] : "");
      const userEmail = user.email || "";
      const userPhone = user.phone || user.phone_number || "";
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || userFullName,
        email: prev.email || userEmail,
        phone: prev.phone || userPhone,
        certificateName: prev.certificateName || userFullName,
        headline: prev.headline || user.headline || "",
      }));
      setAvatarPreview(user.avatar || null);
    }

    // 2. Fetch authentic database profile ONCE from backend API
    if (!profileFetchedRef.current) {
      profileFetchedRef.current = true;
      userService
        .getMyProfile()
        .then((profileRes) => {
          if (!isMounted || !profileRes) return;
          const profData = (profileRes as any)?.user || profileRes;
          if (profData) {
            const profFullName = profData.full_name || profData.fullName || profData.name || "";
            const profEmail = profData.email || "";
            const profPhone = profData.phone_number || profData.phone || "";
            const profAvatar = profData.avatar || profData.avatar_url || profData.profile_picture || null;

            setFormData((prev) => ({
              ...prev,
              fullName: profFullName || prev.fullName,
              email: profEmail || prev.email,
              phone: profPhone || prev.phone,
              certificateName: profFullName || prev.certificateName,
              headline: profData.headline || prev.headline,
            }));

            setAvatarPreview(profAvatar || null);

            dispatch(
              updateUser({
                fullName: profFullName,
                name: profFullName,
                email: profEmail,
                phone: profPhone,
                phone_number: profPhone,
                avatar: profAvatar,
                preferred_language: profData.preferred_language,
                preferredLanguage: profData.preferred_language,
              })
            );
          }
        })
        .catch((err) => {
          console.warn("[StudentSettingsView] getMyProfile fetch info:", err?.message);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [user, dispatch]);

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Real-time Password Strength Calculator
  const passwordStrength = useMemo(() => {
    const pwd = formData.newPassword;
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: tStudent("weakPassword"), color: "bg-rose-500", text: "text-rose-600" };
      case 2:
        return { score: 2, label: tStudent("fairPassword"), color: "bg-amber-500", text: "text-amber-600" };
      case 3:
        return { score: 3, label: tStudent("goodPassword"), color: "bg-emerald-500", text: "text-emerald-600" };
      case 4:
        return { score: 4, label: tStudent("strongPassword"), color: "bg-emerald-600", text: "text-emerald-700" };
      default:
        return { score: 0, label: "", color: "bg-slate-200", text: "text-slate-400" };
    }
  }, [formData.newPassword, tStudent]);

  // Avatar File Change (Supports JPG, PNG, WebP up to 5MB)
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(tStudent("avatarSizeExceeded"));
      setTimeout(() => setErrorMessage(null), 4000);
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
        setToastMessage(tStudent("avatarUpdated"));
      }
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        t("avatarUploadFailed"),
        isAr
      );
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsUploadingAvatar(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setToastMessage(null);
    setPasswordError(null);

    // Frontend validation: Passwords
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword.length < 8) {
        setPasswordError(t("passwordMinLength"));
        setIsSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError(t("passwordsDoNotMatch"));
        setIsSaving(false);
        return;
      }
    }

    try {
      // 1. Password change request
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

      // 2. Profile update request (PUT /api/users/me)
      const updatedProfile = await userService.updateMyProfile({
        full_name: formData.fullName.trim(),
        phone_number: formData.phone.trim(),
        preferred_language: locale,
      });

      // Update Redux state
      dispatch(
        updateUser({
          fullName: updatedProfile.full_name || formData.fullName,
          name: updatedProfile.full_name || formData.fullName,
          phone: updatedProfile.phone_number || formData.phone,
          phoneNumber: updatedProfile.phone_number || formData.phone,
          preferredLanguage: updatedProfile.preferred_language || locale,
          headline: formData.headline,
        })
      );

      // Trigger Celebration State
      setIsSavedCelebration(true);
      setToastMessage(t("changesSaved"));
      setTimeout(() => {
        setIsSavedCelebration(false);
        setToastMessage(null);
      }, 3500);
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        t("saveChangesFailed"),
        isAr
      );
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const tabsConfig = [
    {
      id: "profile" as SettingsTab,
      label: t("profile"),
      icon: User,
      badge: tStudent("basicInfoBadge"),
    },
    {
      id: "security" as SettingsTab,
      label: t("security"),
      icon: Lock,
      badge: tStudent("securityBadge"),
    },
  ];

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-extrabold text-white">{toastMessage}</p>
            <p className="text-[11px] text-slate-400">{tStudent("accountDetailsUpdated")}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-3 bg-rose-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <AlertCircle className="h-5 w-5 text-white shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailModal && (
        <ChangeEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          currentEmail={formData.email}
          onConfirmEmailChange={(newEmail: string) => {
            setFormData((prev) => ({ ...prev, email: newEmail }));
            setToastMessage(tChangeEmail("success"));
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />
      )}

      {/* Main Settings Card */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
          
          {/* ================= ULTRA-MODERN HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-extrabold">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>{tStudent("hubTitle")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {tStudent("title")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
                {tStudent("subtitle")}
              </p>
            </div>
          </div>

          {/* ================= SLEEK SEGMENTED TAB NAVIGATION ================= */}
          <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1.5 sm:gap-2 overflow-x-auto border border-slate-200/60 backdrop-blur-xs scrollbar-none no-scrollbar w-full">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex-1 min-w-fit sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                    active
                      ? "bg-white text-emerald-800 shadow-sm border border-emerald-200/80 font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-bold"
                  }`}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    active ? "bg-emerald-50 text-emerald-700" : "bg-transparent text-slate-400 group-hover:text-slate-600"
                  }`}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ================= TAB 1: PROFILE ================= */}
          {activeTab === "profile" && (
            <div key="profile" className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Avatar Upload Card with Interactive Hover */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-slate-50/70 to-emerald-50/30 border border-emerald-100/90 shadow-2xs">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-white border-2 border-emerald-300 overflow-hidden shrink-0 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center transition-transform duration-300 hover:scale-105"
                >
                  {avatarPreview ? (
                    <Image
                      suppressHydrationWarning
                      src={avatarPreview}
                      alt="Avatar"
                      width={112}
                      height={112}
                      unoptimized
                      onError={() => setAvatarPreview(null)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span suppressHydrationWarning className="select-none font-black text-2xl sm:text-3xl lg:text-4xl text-emerald-700">
                      {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}

                  {/* Camera overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white gap-1">
                    <Camera className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce" />
                    <span className="text-[10px] font-extrabold">{tStudent("edit")}</span>
                  </div>

                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />

                <div className="space-y-1.5 sm:space-y-2 text-center sm:text-start flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {t("avatarTitle")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                    {t("avatarSubtitle")}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {tStudent("avatarAllowedFormats")}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-extrabold shadow-2xs hover:shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="h-3.5 w-3.5 text-emerald-600" />
                      <span>
                        {avatarPreview
                          ? t("changePhoto")
                          : tStudent("uploadPhoto")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Details Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-700">
                    {t("fullName")}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full h-11 sm:h-12 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-extrabold text-slate-700">
                      {t("emailAddress")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-black text-emerald-700 transition-colors cursor-pointer"
                    >
                      {t("change")}
                    </button>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full h-11 sm:h-12 rounded-xl border border-slate-200/90 bg-slate-100/70 px-4 text-xs sm:text-sm font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-700">
                    {t("phoneNumber")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-11 sm:h-12 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-700">
                    {t("headline")}
                  </label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    placeholder={tStudent("defaultHeadline")}
                    className="w-full h-11 sm:h-12 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                  />
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB 2: SECURITY ================= */}
          {activeTab === "security" && (
            <div key="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {passwordError && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-700">
                    {t("currentPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 sm:h-12 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-auto rtl:left-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-700">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 sm:h-12 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-auto rtl:left-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Real-time Interactive Password Strength Meter */}
                  {formData.newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-transparent"} flex-1`} />
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-transparent"} flex-1`} />
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-transparent"} flex-1`} />
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.color : "bg-transparent"} flex-1`} />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">{tStudent("strengthLabel")}</span>
                        <span className={`font-black ${passwordStrength.text}`}>{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-slate-700">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 sm:h-12 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-auto rtl:left-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          <div className="border-b border-slate-100" />

          {/* ================= BOTTOM ACTION BAR ================= */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`relative overflow-hidden px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-70 ${
                isSavedCelebration
                  ? "bg-emerald-700 shadow-emerald-500/30 scale-105"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-md active:scale-95"
              }`}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("saving")}</span>
                </>
              ) : isSavedCelebration ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300 animate-in zoom-in-50 duration-200" />
                  <span>{tStudent("saved")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 opacity-70" />
                  <span>{t("saveChanges")}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
