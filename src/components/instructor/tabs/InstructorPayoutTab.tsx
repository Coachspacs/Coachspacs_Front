"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CreditCard,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface InstructorPayoutTabProps {
  formData: {
    payoutMethod: string;
    bankIban: string;
    paypalEmail: string;
    autoPayout: boolean;
  };
  courses: any[];
  onSavePayout?: (payoutData: any) => Promise<void>;
}

export function InstructorPayoutTab({
  formData: initialData,
  courses,
  onSavePayout,
}: InstructorPayoutTabProps) {
  const tInst = useTranslations("instructorSettings");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [payoutMethod, setPayoutMethod] = useState<string>(
    initialData.payoutMethod || "bank"
  );
  const [bankIban, setBankIban] = useState<string>(initialData.bankIban || "");
  const [paypalEmail, setPaypalEmail] = useState<string>(
    initialData.paypalEmail || ""
  );
  const [autoPayout, setAutoPayout] = useState<boolean>(
    initialData.autoPayout ?? true
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onSavePayout) {
        await onSavePayout({
          payoutMethod,
          bankIban,
          paypalEmail,
          autoPayout,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {tInst("payoutAndBilling")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          {isAr
            ? "إدارة الحسابات البنكية، وسائل الدفع وجداول تحويل الأرباح"
            : "Manage your payout methods, billing information, and revenue schedules"}
        </p>
      </div>

      {/* Payout Settings Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-6"
      >
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {tInst("payoutMethod")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isAr
              ? "اختر الوسيلة المفضلة لاستلام أرباحك دورياً"
              : "Choose your preferred channel to receive your course earnings"}
          </p>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setPayoutMethod("bank")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
              payoutMethod === "bank"
                ? "border-[#0F5244] bg-[#0F5244]/5 text-slate-900"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                payoutMethod === "bank"
                  ? "bg-[#0F5244] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                {tInst("bankTransfer")}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                {isAr ? "تحويل مباشر إلى الحساب المصرفي (IBAN)" : "Direct wire via IBAN"}
              </p>
            </div>
            {payoutMethod === "bank" && (
              <CheckCircle2 className="w-5 h-5 text-[#0F5244] shrink-0" />
            )}
          </div>

          <div
            onClick={() => setPayoutMethod("paypal")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
              payoutMethod === "paypal"
                ? "border-[#0F5244] bg-[#0F5244]/5 text-slate-900"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                payoutMethod === "paypal"
                  ? "bg-[#0F5244] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-black text-slate-900">PayPal</h4>
              <p className="text-[11px] text-slate-500 truncate">
                {isAr ? "استلام سريع عبر البريد الإلكتروني" : "Fast payouts via PayPal"}
              </p>
            </div>
            {payoutMethod === "paypal" && (
              <CheckCircle2 className="w-5 h-5 text-[#0F5244] shrink-0" />
            )}
          </div>
        </div>

        {/* Dynamic Fields */}
        {payoutMethod === "bank" ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {tInst("bankIbanLabel")}
            </label>
            <input
              type="text"
              value={bankIban}
              onChange={(e) => setBankIban(e.target.value)}
              placeholder="SA00 0000 0000 0000 0000 0000"
              dir="ltr"
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 font-medium">
              {isAr
                ? "تأكد من إدخال رقم الآيبان الدولي بشكل صحيح مطابقاً لحسابك المصرفي"
                : "Ensure your IBAN matches your official banking registration"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {isAr ? "بريد PayPal الإلكتروني" : "PayPal Email"}
            </label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="youremail@example.com"
              dir="ltr"
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:ring-2 focus:ring-[#0F5244]/10 focus:outline-none transition-all"
            />
          </div>
        )}

        {/* Auto Payout Switch */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {tInst("autoPayout")}
            </h4>
            <p className="text-xs text-slate-500 font-normal">
              {tInst("autoPayoutSub")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoPayout(!autoPayout)}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              autoPayout ? "bg-[#0F5244]" : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform ${
                autoPayout
                  ? isAr
                    ? "-translate-x-6"
                    : "translate-x-6"
                  : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {isAr ? "تم حفظ إعدادات الدفع بنجاح" : "Payout settings updated!"}
            </span>
          )}
          <div className="ms-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#08382E] text-white text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving
                ? isAr
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isAr
                ? "حفظ إعدادات السحب"
                : "Save Payout Settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
