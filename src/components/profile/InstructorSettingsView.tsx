"use client";

import React, { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Lock,
  CreditCard,
  Video,
  Camera,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Globe,
  Mail,
  Send,
  X,
  ShieldCheck,
  UserCheck,
  Trash2,
  Building,
  Clock,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChangeEmailModal } from "@/components/modals/ChangeEmailModal";

interface InstructorSettingsViewProps {
  onRoleSwitch?: (role: "student" | "instructor") => void;
}

export function InstructorSettingsView({ onRoleSwitch }: InstructorSettingsViewProps) {
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const tStudent = useTranslations("studentSettings");
  const tChangeEmail = useTranslations("changeEmailModal");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector((state: RootState) => state.auth);

  const approvalStatus = (user?.approval_status || user?.approvalStatus || "pending").toLowerCase();
  const isApproved = approvalStatus === "approved";
  const isRejected = approvalStatus === "rejected";
  const isPending = !isApproved && !isRejected;

  // Active Tab
  const [activeTab, setActiveTab] = useState<"profile" | "payout" | "media" | "security">("profile");

  // Avatar & File ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Email Change Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || tInst("defaultFullName"),
    email: user?.email || "tarek.mansoor@example.com",
    phone: "+966 50 987 6543",
    headline: user?.headline || tInst("defaultHeadline"),
    specialization: "Data Science & AI",
    experienceYears: 10,
    hourlyRate: 85,
    bio: user?.bio || tInst("defaultBio"),
    payoutMethod: "bank",
    bankIban: "SA0380000000608010167519",
    paypalEmail: user?.email || "instructor@paypal.com",
    autoPayout: true,
    introVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    website: "https://tarek-mansoor.com",
    linkedin: "https://linkedin.com/in/tarekmansoor",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#FAFCFB] flex flex-col font-sans">
      <Header />

      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-6">

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
          onConfirmEmailChange={(newEmail: string) => {
            setFormData((prev) => ({ ...prev, email: newEmail }));
            setToastMessage(tChangeEmail("success"));
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />

        {/* Account Approval Status Banner */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-start">
            <div
              className={`p-2.5 rounded-2xl border shrink-0 ${
                isApproved
                  ? "bg-emerald-50 text-[#0F5244] border-emerald-200"
                  : isRejected
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200/80"
              }`}
            >
              {isApproved ? (
                <ShieldCheck className="h-5 w-5" />
              ) : isRejected ? (
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
                {isApproved ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F5244] border border-emerald-200 text-[11px] font-extrabold inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>{tInst("approvedBadge")}</span>
                  </span>
                ) : isRejected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-extrabold inline-flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-rose-600" />
                    <span>{tInst("rejectedBadge")}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/90 text-[11px] font-bold inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{isAr ? "قيد المراجعة" : "Under Review"}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isApproved
                  ? tInst("approvedDescription")
                  : isRejected
                  ? tInst("rejectedDescription")
                  : (isAr
                      ? "طلب انضمامك كمدرب قيد التدقيق حالياً من قبل الإدارة. ستصلك رسالة تأكيد عبر البريد فور الاعتماد."
                      : tInst("pendingDescription"))}
              </p>
            </div>
          </div>
        </div>

        {/* Role Segment Toggle Bar */}
        {onRoleSwitch && (
          <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 px-3">
              <UserCheck className="h-4 w-4 text-[#0F5244]" />
              <span>{tStudent("activeRoleLabel")}</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onRoleSwitch("student")}
                className="px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer"
              >
                {tStudent("roleStudent")}
              </button>
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg bg-white text-[#0F5244] text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
              >
                {tStudent("roleInstructor")}
              </button>
            </div>
          </div>
        )}

        {/* Layout: Sidebar + Main Content */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">

          {/* Vertical Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
            items={[
              { id: "profile", label: tInst("instructorProfile"), icon: Briefcase },
              { id: "payout", label: tInst("payoutAndBilling"), icon: CreditCard },
              { id: "media", label: t("socialLinks"), icon: Video },
              { id: "security", label: t("security"), icon: Lock },
            ]}
            user={{
              name: formData.fullName,
              role: isAr ? "مدرب" : "Instructor",
              avatarUrl: avatarPreview,
            }}
          />

          {/* Main Card Content */}
          <div className="flex-1 w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-2xs">
            <form onSubmit={handleSave} className="space-y-8">

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {tInst("title")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {tInst("subtitle")}
                </p>
              </div>

              {/* TAB 1: INSTRUCTOR PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-8 animate-in fade-in duration-150">

                  {/* Avatar Upload (5MB limit - US-05) */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 border-2 border-slate-200/80 overflow-hidden shrink-0 shadow-2xs cursor-pointer flex items-center justify-center"
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span suppressHydrationWarning className="select-none font-black text-3xl sm:text-4xl text-[#0F5244]">
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
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 cursor-pointer transition-all"
                      >
                        <option value="Data Science & AI">Data Science & AI</option>
                        <option value="Web Development">Web Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Leadership & Management">Leadership & Management</option>
                      </select>
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

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">
                        {tInst("hourlyRate")}
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                      />
                    </div>

                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      {t("bio")}
                    </label>
                    <textarea
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all leading-relaxed"
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: PAYOUT & BILLING */}
              {activeTab === "payout" && (
                <div className="space-y-6 animate-in fade-in duration-150">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">
                        {tInst("payoutMethod")}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, payoutMethod: "bank" }))}
                          className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.payoutMethod === "bank"
                            ? "border-[#0F5244] bg-[#E8F3F1] text-[#0F5244]"
                            : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <Building className="h-4 w-4" />
                          <span>{tInst("bankTransfer")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, payoutMethod: "paypal" }))}
                          className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.payoutMethod === "paypal"
                            ? "border-[#0F5244] bg-[#E8F3F1] text-[#0F5244]"
                            : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>PayPal</span>
                        </button>
                      </div>
                    </div>

                    {formData.payoutMethod === "bank" ? (
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs sm:text-sm font-bold text-slate-700">
                          {tInst("bankIban")}
                        </label>
                        <input
                          type="text"
                          name="bankIban"
                          value={formData.bankIban}
                          onChange={handleChange}
                          className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs sm:text-sm font-bold text-slate-700">
                          {tInst("paypalEmail")}
                        </label>
                        <input
                          type="email"
                          name="paypalEmail"
                          value={formData.paypalEmail}
                          onChange={handleChange}
                          className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                        />
                      </div>
                    )}

                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {tInst("autoPayout")}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {tInst("autoPayoutSub")}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        name="autoPayout"
                        checked={formData.autoPayout}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0F5244]" />
                    </label>
                  </div>

                </div>
              )}

              {/* TAB 3: MEDIA & SOCIALS */}
              {activeTab === "media" && (
                <div className="space-y-6 animate-in fade-in duration-150">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">
                        {tInst("introVideoUrl")}
                      </label>
                      <input
                        type="url"
                        name="introVideoUrl"
                        value={formData.introVideoUrl}
                        onChange={handleChange}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">
                        {t("website")}
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                      />
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: SECURITY (US-03) */}
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
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
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
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
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
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
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

      </main>

      <Footer />
    </div>
  );
}
