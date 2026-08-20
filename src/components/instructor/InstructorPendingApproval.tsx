"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  Settings,
  LogOut,
  Mail,
  AlertCircle,
  Bell,
  Info
} from "lucide-react";
import { RootState } from "@/lib/store";
import { authService } from "@/services/auth";
import { updateUser, logout } from "@/features/auth/slice";

export function InstructorPendingApproval() {
  const locale = useLocale() || "en";
  const isAr = locale === "ar";
  const tInst = useTranslations("instructorSettings");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "info" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setFeedback(null);

    try {
      const { user: updatedUser, approval_status } = await authService.syncCurrentUserProfile();
      dispatch(updateUser(updatedUser));

      if (approval_status === "approved") {
        setFeedback({
          type: "success",
          message: tInst("statusApprovedNow") || (isAr ? "تم اعتماد حسابك بنجاح! جاري الانتقال للوحة التحكم..." : "Account approved! Redirecting to dashboard..."),
        });
        setTimeout(() => {
          router.push(`/${locale}/instructor/dashboard`);
        }, 1000);
      } else if (approval_status === "rejected") {
        setFeedback({
          type: "error",
          message: tInst("rejectedDescription") || (isAr ? "تم رفض الطلب. يرجى التواصل مع الدعم الفني." : "Application rejected. Please contact support."),
        });
      } else {
        setFeedback({
          type: "info",
          message: isAr
            ? "طلبك ما زال قيد المراجعة من قبل الإدارة."
            : "Your application is still under review.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "info",
        message: isAr
          ? "طلبك قيد المراجعة حالياً."
          : "Your application is currently under review.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${locale}/login`);
  };

  const fullName = (mounted ? (user?.fullName || user?.name) : "") || (isAr ? "المدرب" : "Instructor");
  const email = (mounted ? user?.email : "") || "instructor@coachspace.com";
  const avatarPreview = mounted ? (user?.avatar || null) : null;

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-10 animate-in fade-in duration-200 font-sans" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-100 overflow-hidden">
        
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* User Identity & Brand Status Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={fullName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span suppressHydrationWarning className="font-black text-xl text-slate-700">{fullName.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 bg-amber-500 text-white p-1 rounded-full border-2 border-white shadow-2xs">
                  <Clock className="w-3 h-3" />
                </div>
              </div>

              {/* Name & Brand State Tag */}
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 suppressHydrationWarning className="text-base sm:text-lg font-black text-slate-900">{fullName}</h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{isAr ? "قيد المراجعة" : "Under Review"}</span>
                  </span>
                </div>
                <p suppressHydrationWarning className="text-xs text-slate-400 font-medium">{email}</p>
              </div>
            </div>

            {/* Settings & Logout shortcuts */}
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/instructor/settings`}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title={tInst("settingsTitle")}
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer"
                title={tNav("logout")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Important Notification Callout Box (Subtle & Clean) */}
          <div className="rounded-2xl bg-amber-50/40 border border-amber-200/50 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100/70 text-amber-600 shrink-0 mt-0.5 border border-amber-200/50 shadow-2xs">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    {isAr ? "إشعار إداري: طلب الحساب قيد المراجعة" : "Important Notice: Application Under Review"}
                  </h2>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/60 border border-amber-200/50 px-2 py-0.5 rounded-full">
                    {isAr ? "تنبيه رسمي" : "Official Notice"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed pt-0.5">
                  {isAr
                    ? "طلب انضمامك كمدرب قيد التدقيق حالياً من قبل فريق الإدارة. ستصلك رسالة تأكيد عبر البريد الإلكتروني فور اعتماد الحساب."
                    : "Your instructor application is currently under review by our administration. You will receive an email confirmation once approved."}
                </p>
              </div>
            </div>

            {/* 2 Clean & Focused Metric Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{isAr ? "وقت المراجعة: 24 - 48 ساعة عمل" : "Review Time: 24 - 48 business hours"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{isAr ? "إشعار فوري عبر البريد الإلكتروني" : "Instant Email Notification"}</span>
              </div>
            </div>
          </div>

          {/* Live Status Feedback Toast */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-150 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : feedback.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : feedback.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
              <span>{isChecking ? (isAr ? "جاري الفحص..." : "Checking...") : (isAr ? "فحص وتحديث الحالة" : "Check Status")}</span>
            </button>

            <Link
              href={`/${locale}/instructor/settings`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? "تعديل الملف الشخصي" : "Edit Profile"}</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
