"use client";

import React, { useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  User,
  Camera,
  Mail,
  Briefcase,
  Globe,
  Linkedin,
  Clock,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";

interface InstructorSettingsTabProps {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    headline: string;
    specialization: string;
    experienceYears: number;
    hourlyRate: string;
    bio: string;
    website: string;
    linkedin: string;
  };
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSaveSettings: (e: React.FormEvent) => void;
  isSaving: boolean;
  onOpenEmailModal: () => void;
}

export function InstructorSettingsTab({
  formData,
  avatarPreview,
  onAvatarChange,
  onInputChange,
  onSaveSettings,
  isSaving,
  onOpenEmailModal,
}: InstructorSettingsTabProps) {
  const t = useTranslations("account");
  const tInst = useTranslations("instructorSettings");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={onSaveSettings}
      className="space-y-8 animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {tInst("title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {tInst("subtitle")}
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
              ? "يُفضل صورة مربعة واضحة بحجم لا يقل عن 400x400 بكسل بصيغة PNG أو JPG"
              : "Recommended: square portrait at least 400x400px in PNG or JPG"}
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

      {/* Personal Info Grid */}
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

        {/* Specialization */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {tInst("specialization")}
          </label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={onInputChange}
            placeholder={isAr ? "مثال: الذكاء الاصطناعي، البرمجة..." : "e.g. Fullstack Web, AI Engineering"}
            className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
          />
        </div>

        {/* Experience Years */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {tInst("experienceYears")}
          </label>
          <input
            type="number"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={onInputChange}
            min={0}
            max={50}
            className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
          />
        </div>

        {/* Headline */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            {tInst("headlineLabel")}
          </label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={onInputChange}
            placeholder={isAr ? "عنوان احترافي يظهر بجانب اسمك" : "Professional title shown on your profile"}
            className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            {t("bio")}
          </label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={onInputChange}
            placeholder={isAr ? "نبذة تعريفية مختصرة عن مسيرتك وخبراتك..." : "Short bio about your background, experience and passion..."}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Website Link */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t("website")}
          </label>
          <div className="relative">
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={onInputChange}
              placeholder="https://yourwebsite.com"
              dir="ltr"
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 rtl:pr-10 ltr:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
            />
            <Globe className="absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* LinkedIn Link */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            LinkedIn
          </label>
          <div className="relative">
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={onInputChange}
              placeholder="https://linkedin.com/in/username"
              dir="ltr"
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 rtl:pr-10 ltr:pl-10 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
            />
            <Linkedin className="absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 w-4 h-4 text-slate-400" />
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
