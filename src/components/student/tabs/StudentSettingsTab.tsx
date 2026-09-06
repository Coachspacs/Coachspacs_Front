"use client";

import React, { useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  User,
  Camera,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

interface StudentSettingsTabProps {
  formData: {
    fullName: string;
    email: string;
    headline: string;
    learningGoal: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSaveSettings: (e: React.FormEvent) => void;
  isSaving: boolean;
  onOpenEmailModal: () => void;
  passwordError?: string | null;
}

export function StudentSettingsTab({
  formData,
  avatarPreview,
  onAvatarChange,
  onInputChange,
  onSaveSettings,
  isSaving,
  onOpenEmailModal,
  passwordError,
}: StudentSettingsTabProps) {
  const t = useTranslations("account");
  const tStudent = useTranslations("studentSettings");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form
      onSubmit={onSaveSettings}
      className="space-y-8 animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {tStudent("title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {tStudent("subtitle")}
        </p>
      </div>

      {/* Avatar Section */}
      <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-[#0F5244]/10 text-[#0F5244] border-2 border-[#0F5244]/20 flex items-center justify-center font-black text-2xl overflow-hidden shadow-xs">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={formData.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              formData.fullName.charAt(0) || <User className="w-10 h-10" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 end-0 p-2 rounded-full bg-[#0F5244] text-white shadow-md hover:bg-[#08382E] transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />
        </div>

        <div className="space-y-1 text-center sm:text-start flex-1">
          <h4 className="text-sm font-black text-slate-900">
            {isAr ? "صورة الملف الشخصي" : "Profile Picture"}
          </h4>
          <p className="text-xs text-slate-500">
            {isAr
              ? "يُفضل صورة مربعة واضحة بحجم لا يقل عن 400x400 بكسل"
              : "Recommended: square image at least 400x400px"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0F5244] hover:underline cursor-pointer"
          >
            {isAr ? "رفع صورة جديدة" : "Upload new picture"}
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-5">
        <h3 className="text-sm sm:text-base font-black text-slate-900">
          {isAr ? "البيانات الشخصية" : "Personal Information"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {t("fullName")}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              required
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                {t("email")}
              </label>
              <button
                type="button"
                onClick={onOpenEmailModal}
                className="text-[11px] font-bold text-[#0F5244] hover:underline cursor-pointer"
              >
                {isAr ? "تغيير البريد" : "Change Email"}
              </button>
            </div>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-100/70 px-4 text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
              <Mail className="absolute top-1/2 -translate-y-1/2 end-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              {isAr ? "المسمى الوظيفي أو الاهتمام" : "Headline or Interests"}
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={onInputChange}
              placeholder={isAr ? "مثال: شغوف بتعلم تطوير الويب والذكاء الاصطناعي" : "e.g. Aspiring Web Developer & AI enthusiast"}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
            />
          </div>

          {/* Learning Goal */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              {isAr ? "هدفك التعليمي الأساسي" : "Primary Learning Goal"}
            </label>
            <textarea
              name="learningGoal"
              rows={3}
              value={formData.learningGoal}
              onChange={onInputChange}
              placeholder={isAr ? "ما هو هدفك من الانضمام للكورسات في Coach Space؟" : "What is your main goal in Coach Space?"}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="space-y-5 pt-4 border-t border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            {t("changePassword")}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isAr
              ? "اترك الحقول فارغة إذا كنت لا ترغب بتغيير كلمة المرور"
              : "Leave blank if you do not wish to change your password"}
          </p>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
            {passwordError}
          </div>
        )}

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
                value={formData.currentPassword || ""}
                onChange={onInputChange}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 rtl:pr-4 ltr:pl-4 rtl:pl-10 ltr:pr-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                value={formData.newPassword || ""}
                onChange={onInputChange}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 rtl:pr-4 ltr:pl-4 rtl:pl-10 ltr:pr-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {t("confirmNewPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword || ""}
                onChange={onInputChange}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 rtl:pr-4 ltr:pl-4 rtl:pl-10 ltr:pr-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs font-black shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("saving")}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{t("saveChanges")}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
