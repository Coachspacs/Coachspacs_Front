"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Mail, X, Send, AlertCircle, CheckCircle2 } from "lucide-react";

export interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEmailChange: (newEmail: string) => void;
  currentEmail?: string;
}

export function ChangeEmailModal({
  isOpen,
  onClose,
  onConfirmEmailChange,
  currentEmail = "",
}: ChangeEmailModalProps) {
  const t = useTranslations("changeEmailModal");
  const locale = useLocale() || "en";
  const isAr = locale === "ar";

  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setNewEmail("");
    setError(null);
    setIsSending(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      setError(t("invalidEmailError"));
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError(t("emailMatchesCurrentError"));
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onConfirmEmailChange(newEmail);
      handleClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 text-[#0F5244]">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0F5244] shrink-0 shadow-2xs">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {t("title")}
              </h3>
              {currentEmail && (
                <p className="text-xs font-semibold text-slate-400">
                  {t("currentEmail")} <span className="text-slate-600 font-bold">{currentEmail}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content / Form */}
        {isSending ? (
          <div className="py-8 px-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-3">
            <Send className="h-8 w-8 text-[#0F5244] mx-auto animate-bounce" />
            <p className="text-sm font-extrabold text-[#0F5244]">
              {t("sending")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              {t("notice")}
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">
                {t("newEmailLabel")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={t("newEmailPlaceholder")}
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 pl-11 rtl:pl-4 rtl:pr-11 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0F5244] focus:outline-none focus:ring-2 focus:ring-[#0F5244]/15 transition-all"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 text-xs font-extrabold hover:bg-slate-100 cursor-pointer transition-all active:scale-98"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F5244] hover:bg-[#07382E] text-white text-xs sm:text-sm font-extrabold cursor-pointer shadow-xs hover:shadow-md transition-all active:scale-98 flex items-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{t("submitBtn")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
