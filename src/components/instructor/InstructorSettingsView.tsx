"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  User,
  Lock,
  CreditCard,
  Video,
  Camera,
  CheckCircle2,
  AlertCircle,
  Globe,
  ShieldCheck,
  Trash2,
  Building,
} from "lucide-react";
import dynamic from "next/dynamic";

const ChangeEmailModal = dynamic(() => import("@/components/modals/ChangeEmailModal").then((mod) => mod.ChangeEmailModal), { ssr: false });

type SettingsTab = "profile" | "payout" | "media" | "security";

// Instructor Settings View Component
export function InstructorSettingsView() {
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

  // Email Change Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || tInst("defaultFullName"),
    email: user?.email || "instructor@coachspace.com",
    phone: "+966 50 987 6543",
    headline: tInst("defaultHeadline"),
    specialization: "Data Science & AI",
    experienceYears: 10,
    hourlyRate: 85,
    bio: tInst("defaultBio"),
    payoutMethod: "bank",
    bankIban: "SA0380000000608010167519",
    paypalEmail: user?.email || "instructor@paypal.com",
    autoPayout: true,
    introVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    website: "https://tarek-mansoor.com",
    linkedin: "https://linkedin.com/in/tarekmansoor",

    // Security
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      const userFullName = user.fullName || user.name || user.email?.split("@")[0] || "";
      const userEmail = user.email || "";
      setFormData((prev) => ({
        ...prev,
        fullName: userFullName || prev.fullName,
        email: userEmail || prev.email,
        paypalEmail: userEmail || prev.paypalEmail,
      }));
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

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
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    setToastMessage(t("changesSaved"));
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-2.5 bg-[#0F5244] text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Email Verification Modal */}
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

      {/* Account Approval Status Banner */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-start">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-[#0F5244] border border-emerald-200 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                {tInst.has("approvalStatusTitle") ? tInst("approvalStatusTitle") : (isAr ? "حالة توثيق المدرب" : "Instructor Verification Status")}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] text-[11px] font-extrabold">
                {tInst.has("approvedBadge") ? tInst("approvedBadge") : (isAr ? "موثق ونشط" : "Verified & Active")}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {tInst.has("approvedDescription") ? tInst("approvedDescription") : (isAr ? "حسابك كمدرب موثق وجاهز لنشر الدورات واستلام المستحقات المالية." : "Your instructor account is verified and ready to publish courses and receive payouts.")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Card Content */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-2xs">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {tInst.has("settingsTitle") ? tInst("settingsTitle") : (isAr ? "حساب وإعدادات المدرب" : "Instructor Account & Settings")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {tInst.has("settingsSubtitle") ? tInst("settingsSubtitle") : (isAr ? "إدارة الملف الشخصي العام للمدرب، وسائل استلام الأرباح، وأمان الحساب." : "Manage your public instructor profile, payment methods, and account security.")}
            </p>
          </div>

          {/* Sub-Navigation Pills for Instructor Settings Sections */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto">
            {[
              { id: "profile", label: isAr ? "الملف الشخصي" : "Profile", icon: User },
              { id: "payout", label: tInst.has("payoutAndBilling") ? tInst("payoutAndBilling") : (isAr ? "استلام الأرباح والدفع" : "Payout & Billing"), icon: CreditCard },
              { id: "media", label: tInst.has("mediaAndLinks") ? tInst("mediaAndLinks") : (isAr ? "الوسائط والروابط" : "Media & Links"), icon: Video },
              { id: "security", label: isAr ? "الأمان" : "Security", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-[#0F5244] text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-emerald-300" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

            {/* TAB 1: PROFILE */}

            {/* TAB 1: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in duration-150">
                
                {/* Avatar Upload (US-05: 5MB limit, JPG/PNG/WebP) */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 border-2 border-slate-200/80 overflow-hidden shrink-0 shadow-2xs cursor-pointer flex items-center justify-center"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="select-none font-black text-3xl sm:text-4xl text-[#0F5244]">
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
                      {tStudent("avatarAllowedFormats")}
                    </p>

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{tStudent("removePhoto")}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-b border-slate-100" />

                {/* Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {t("fullName")}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">
                        {t("emailAddress")}
                      </label>
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
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-100/60 px-4 text-xs sm:text-sm font-semibold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {t("phoneNumber")}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {t("headline")}
                    </label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {tInst("specialization")}
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {tInst("experienceYears")}
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                    />
                  </div>

                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    {tInst("bio")}
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all resize-none"
                  />
                </div>

              </div>
            )}

            {/* TAB 2: PAYOUT */}
            {activeTab === "payout" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="space-y-4">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    {tInst("payoutMethod")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${formData.payoutMethod === "bank" ? "border-[#0F5244] bg-emerald-50/40" : "border-slate-200 bg-slate-50/40"}`}>
                      <input
                        type="radio"
                        name="payoutMethod"
                        value="bank"
                        checked={formData.payoutMethod === "bank"}
                        onChange={handleChange}
                        className="accent-[#0F5244]"
                      />
                      <Building className="h-5 w-5 text-[#0F5244]" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800">{tInst("bankTransfer")}</span>
                    </label>

                    <label className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${formData.payoutMethod === "paypal" ? "border-[#0F5244] bg-emerald-50/40" : "border-slate-200 bg-slate-50/40"}`}>
                      <input
                        type="radio"
                        name="payoutMethod"
                        value="paypal"
                        checked={formData.payoutMethod === "paypal"}
                        onChange={handleChange}
                        className="accent-[#0F5244]"
                      />
                      <Globe className="h-5 w-5 text-[#0F5244]" />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800">PayPal</span>
                    </label>
                  </div>
                </div>

                {formData.payoutMethod === "bank" ? (
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {tInst("bankIbanLabel")}
                    </label>
                    <input
                      type="text"
                      name="bankIban"
                      value={formData.bankIban}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold font-mono text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {tInst("paypalEmailLabel")}
                    </label>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={formData.paypalEmail}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MEDIA & LINKS */}
            {activeTab === "media" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    {tInst("introVideoUrl")}
                  </label>
                  <input
                    type="url"
                    name="introVideoUrl"
                    value={formData.introVideoUrl}
                    onChange={handleChange}
                    className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {tInst("website")}
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {tInst("linkedin")}
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {t("currentPassword")}
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {t("newPassword")}
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {t("confirmPassword")}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-b border-slate-100" />

            {/* Bottom Action */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
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
        </div>

    </div>
  );
}
