"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Sparkles,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Video,
  DollarSign,
  Zap,
  HelpCircle,
} from "lucide-react";

export default function BecomeInstructorPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const benefits = [
    {
      icon: DollarSign,
      title: isAr ? "عوائد مالية مجزية" : "Monetize Your Expertise",
      desc: isAr
        ? "حقّق دخلاً مستداماً من مبيعات دوراتك مع أنظمة دفع آمنة وسريعة وتحكم كامل بأسعارك."
        : "Earn steady revenue with transparent payouts, flexible course pricing, and secure transactions.",
      highlight: isAr ? "دفعات موثوقة" : "Direct Payouts",
    },
    {
      icon: Zap,
      title: isAr ? "أدوات ذكاء اصطناعي ثورية" : "AI-Powered Course Studio",
      desc: isAr
        ? "استفد من أدوات الـ AI لتوليد اختبارات تدريبية فورية وملخصات تلقائية لدروسك لتوفير وقتك."
        : "Leverage built-in AI to generate practice quizzes, interactive summaries, and enhance student engagement.",
      highlight: isAr ? "توفير 70% من الوقت" : "Smart Automation",
    },
    {
      icon: Users,
      title: isAr ? "وصول لجمهور عالمي شغوف" : "Reach Motivated Learners",
      desc: isAr
        ? "انشر دوراتك لآلاف الطلاب والمهنيين الباحثين عن تطوير مهاراتهم في العالم العربي والعالم."
        : "Showcase your courses to thousands of ambitious learners looking to advance their professional careers.",
      highlight: isAr ? "آلاف الطلاب النشطين" : "Active Community",
    },
    {
      icon: Award,
      title: isAr ? "شهادات معتمدة وهوية مهنية" : "Verified Credibility",
      desc: isAr
        ? "يمنح طلابك شهادات إتمام معتمدة قابلة للتحقق الفوري بالرمز، ما يعزز الثقة والانتشار."
        : "Issue tamper-evident, verifiable certificates that employers and learners respect worldwide.",
      highlight: isAr ? "اعتماد رسمي" : "Tamper-Evident",
    },
  ];

  const steps = [
    {
      step: "01",
      title: isAr ? "أنشئ حساب المدرب" : "Create Your Instructor Account",
      desc: isAr
        ? "سجل بسهولة واختر دور المدرب وحدد مجالات خبرتك وتخصصك التدريبي."
        : "Sign up in seconds, select the Instructor role, and highlight your domain expertise.",
    },
    {
      step: "02",
      title: isAr ? "ابنِ محتوى دورتك" : "Build Your Curriculum",
      desc: isAr
        ? "استخدم استوديو الكورسات لرفع الفيديوهات، إضافة المرفقات، وتنظيم الفصول والدروس."
        : "Upload high-definition video lessons, structure curriculum modules, and attach resources.",
    },
    {
      step: "03",
      title: isAr ? "انشر وابدأ بجني الأرباح" : "Publish & Start Earning",
      desc: isAr
        ? "بعد مراجعة الجودة السريعة، تصبح دورتك متاحة في الكتالوج وتبدأ باستقبال الطلاب والأرباح."
        : "After a quick quality check, your course goes live in the catalog and you start welcoming enrolled learners.",
    },
  ];

  const faqs = [
    {
      q: isAr ? "من يمكنه التدريس على Coach Space؟" : "Who can become an instructor on Coach Space?",
      a: isAr
        ? "نرحب بجميع الخبراء، المدربين، والمهنيين ذوي الخبرة العملية في مجالات البرمجة، التصميم، الأعمال، والتطوير الذاتي القادرين على تقديم محتوى تدريبي متميز."
        : "Any industry professional, coach, or subject matter expert with proven experience in tech, design, business, or professional coaching can apply.",
    },
    {
      q: isAr ? "كيف تعمل مراجعة واعتماد الحساب؟" : "How does instructor verification work?",
      a: isAr
        ? "لضمان أعلى معايير الجودة، يقوم فريقنا بمراجعة حسابك ومحتوى دورتك الأولى للتأكد من الصوت والصورة والقيمة التدريبية قبل النشر العام."
        : "To maintain world-class quality, our team reviews instructor profiles and initial course submissions for video/audio clarity and practical value.",
    },
    {
      q: isAr ? "هل احتفظ بحقوق الملكية الفكرية لمحتواي؟" : "Do I retain ownership of my course materials?",
      a: isAr
        ? "نعم بالتأكيد! تحتفظ بالملكية الكاملة لمحتواك التدريبي ويمكنك تحديثه أو تعديله في أي وقت."
        : "Yes, 100%. You retain full intellectual property rights to your course content, curriculum, and supplementary files.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#07382E] via-brand-dark to-[#093C32] text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(69,209,180,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(15,82,68,0.4),transparent_50%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-black uppercase tracking-wider text-[#45D1B4]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "انضم إلى نخبة المدربين المعتمدين" : "Teach on Coach Space"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {isAr ? (
              <>
                شارك خبرتك وألهم العالم <br />
                <span className="text-[#45D1B4]">وابنِ مسيرتك التدريبية معنا</span>
              </>
            ) : (
              <>
                Share Your Expertise, Empower Learners, <br />
                <span className="text-[#45D1B4]">And Build a Thriving Teaching Business</span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-200/90 leading-relaxed font-medium">
            {isAr
              ? "انضم إلى مجتمع احترافي من المدربين المعتمدين، واستفد من أدوات الذكاء الاصطناعي الأحدث، واجذب آلاف الطلاب لبرامجك التدريبية."
              : "Inspire thousands of ambitious learners. Monitize your skills with modern course delivery, AI-assisted authoring, and direct student connections."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href={`/${locale}/register?role=instructor`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#45D1B4] hover:bg-[#38bca1] text-brand-dark font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-[#45D1B4]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isAr ? "ابدأ التدريس الآن" : "Apply as Instructor"}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>

            <Link
              href={`/${locale}/login`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm sm:text-base transition-all backdrop-blur-sm"
            >
              <span>{isAr ? "لديك حساب مدرب؟ تسجيل الدخول" : "Already an Instructor? Sign In"}</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#45D1B4]" />
              <span>{isAr ? "تحكم كامل بأسعار دوراتك" : "100% Pricing Autonomy"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#45D1B4]" />
              <span>{isAr ? "أدوات AI مساعدة مجانية" : "Free AI Instructor Suite"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#45D1B4]" />
              <span>{isAr ? "شهادات معتمدة لطلابك" : "Verified Credentials for Learners"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#45D1B4]/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-dark/10 text-brand-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0F5244] bg-[#0F5244]/10 px-2 py-0.5 rounded-full inline-block mb-1.5">
                      {b.highlight}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">{b.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-brand-dark bg-brand-dark/10 px-3 py-1 rounded-full">
            {isAr ? "خطوات بسيطة" : "How It Works"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isAr ? "3 خطوات سهلة لإطلاق أول دورة لك" : "3 Steps to Launch Your First Course"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
            {isAr
              ? "صممنا المنصة لتكون سلسة وسريعة لتركز فقط على جودة محتواك وشغفك التدريبي."
              : "Our intuitive instructor studio makes uploading, organizing, and delivering content fast and effortless."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden space-y-3"
            >
              <div className="text-3xl font-black text-brand-dark/20">{s.step}</div>
              <h3 className="text-base font-extrabold text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isAr ? "الأسئلة الشائعة للمدربين" : "Frequently Asked Questions"}
          </h2>
          <p className="text-xs text-slate-500">
            {isAr ? "كل ما تود معرفته قبل الانضمام" : "Everything you need to know about teaching with us"}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2"
            >
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-dark shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed ps-6 font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="rounded-3xl bg-gradient-to-r from-brand-dark to-[#07382E] text-white p-8 sm:p-12 text-center space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#45D1B4]/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black">
            {isAr ? "جاهز للانضمام وبدء رحلتك كمدرب معتمد؟" : "Ready to Start Teaching on Coach Space?"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200/90 max-w-lg mx-auto font-medium">
            {isAr
              ? "أنشئ حسابك الآن وابدأ بتحويل معرفتك إلى برامج تدريبية احترافية تصل لآلاف الطلاب."
              : "Register your instructor account today and start transforming your expertise into impactful learning experiences."}
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/register?role=instructor`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#45D1B4] hover:bg-[#38bca1] text-brand-dark font-extrabold text-sm transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isAr ? "سجّل كمدرب الآن" : "Apply as an Instructor"}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
