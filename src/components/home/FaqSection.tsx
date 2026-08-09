"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const t = useTranslations("home");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      id: "faq-1",
      question: t("faq1Q"),
      answer: t("faq1A"),
    },
    {
      id: "faq-2",
      question: t("faq2Q"),
      answer: t("faq2A"),
    },
    {
      id: "faq-3",
      question: t("faq3Q"),
      answer: t("faq3A"),
    },
    {
      id: "faq-4",
      question: t("faq4Q"),
      answer: t("faq4A"),
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#FAFCFC] py-14 sm:py-20 border-t border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t("faqTitle")}
          </h2>
          <p className="mt-3 text-slate-500 text-sm sm:text-base font-medium">
            {t("faqSubtitle")}
          </p>
        </div>

        {/* Accordion Container */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                  isOpen
                    ? "bg-[#E6F9F3] border border-[#6CF8BB]/80 shadow-xs"
                    : "bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs"
                }`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                  {/* Chevron Icon (Left/Start) */}
                  <div
                    className={`p-1 rounded-full transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180 text-[#0D7A66]" : "text-[#2563EB]"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  {/* Content (Centered Question & Answer) */}
                  <div className="flex-1 text-center space-y-2 pr-2 sm:pr-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      {faq.question}
                    </h3>
                    {isOpen && (
                      <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed pt-1 animate-fadeIn">
                        {faq.answer}
                      </p>
                    )}
                  </div>

                  {/* Spacer for symmetry */}
                  <div className="w-6 shrink-0 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
