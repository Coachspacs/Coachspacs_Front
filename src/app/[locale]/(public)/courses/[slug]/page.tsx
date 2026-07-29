'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/features/cart/cartSlice';
import { RootState } from '@/lib/store';
import { mockCourses } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Star,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  FileText,
  Award,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Zap,
} from 'lucide-react';

export default function CourseDetailsPage() {
  const t = useTranslations('course');
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const router = useRouter();
  const dispatch = useDispatch();

  const course = mockCourses.find((c) => c.slug === slug) || mockCourses[0];
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some((item) => item.course.id === course.id);

  const [openModuleId, setOpenModuleId] = useState<string | null>('mod-1');

  const handleAddToCart = () => {
    dispatch(addToCart(course));
  };

  const handleBuyNow = () => {
    dispatch(addToCart(course));
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="pb-20 space-y-12">
      {/* Course Hero Banner */}
      <section className="bg-slate-900/90 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="brand">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                {course.rating} ({course.reviewsCount} reviews)
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-400" />
                {course.studentsCount} students
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                {course.duration}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid & Sticky Checkout Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Body */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            <Card className="p-8 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                What You Will Master
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>Build full-stack Web applications with Next.js 15 App Router</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>Implement dual-language RTL/LTR i18n switching seamlessly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>Manage global client & server state using RTK Query</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>Deploy production-ready responsive UIs with dark mode aesthetics</span>
                </div>
              </div>
            </Card>

            {/* Syllabus Curriculum Accordion */}
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white">{t('curriculum')}</h2>
              <div className="space-y-3">
                {course.modules?.map((module) => {
                  const isOpen = openModuleId === module.id;
                  return (
                    <div key={module.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800">
                      <button
                        onClick={() => setOpenModuleId(isOpen ? null : module.id)}
                        className="w-full p-4 flex items-center justify-between text-left rtl:text-right bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
                      >
                        <span className="font-bold text-slate-100 text-sm">{module.title}</span>
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                          <span>{module.lessons.length} lessons</span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-4 space-y-2 border-t border-slate-800 bg-slate-950/40">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 text-xs text-slate-300"
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle className="w-4 h-4 text-brand-400" />
                                <span>{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {lesson.isPreview && (
                                  <Badge variant="brand" className="text-[10px] py-0 px-2">
                                    Preview
                                  </Badge>
                                )}
                                <span className="text-slate-500 font-mono">{lesson.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor Bio Card */}
            <Card className="p-8 space-y-6">
              <h2 className="text-2xl font-extrabold text-white">{t('instructor')}</h2>
              <div className="flex items-start gap-4">
                <Image
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  width={64}
                  height={64}
                  className="rounded-2xl object-cover border border-slate-700"
                />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{course.instructor.name}</h3>
                  <p className="text-xs font-semibold text-brand-400">{course.instructor.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{course.instructor.bio}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sticky Checkout CTA Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="p-6 space-y-6 shadow-2xl border-brand-500/30">
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-700">
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg animate-pulse">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-white">${course.price}</span>
                  {course.originalPrice && (
                    <span className="text-sm text-slate-500 line-through">${course.originalPrice}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <Button onClick={handleBuyNow} className="w-full gap-2 py-3.5 text-base">
                    <Zap className="w-5 h-5 fill-current" />
                    <span>{t('buyNow')}</span>
                  </Button>

                  {isInCart ? (
                    <Link href={`/${locale}/cart`} className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t('inCart')}</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" onClick={handleAddToCart} className="w-full gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t('addToCart')}</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-slate-200 mb-2">{t('includes')}</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span>{course.duration} {t('hours')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>{t('certificate')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>{t('lifetimeAccess')}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
