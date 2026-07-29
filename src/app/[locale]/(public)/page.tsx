'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { mockCourses } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, Clock, Users, Award, PlayCircle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-600/20 via-indigo-600/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Enterprise LMS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto">
            {t('heroTitle')}
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href={`/${locale}/courses`}>
              <Button size="lg" className="gap-2 shadow-xl shadow-brand-600/30">
                <span>{t('exploreCourses')}</span>
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button variant="outline" size="lg">
                {t('becomeInstructor')}
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-white">50,000+</div>
              <div className="text-xs text-slate-400">Active Learners</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-brand-400">120+</div>
              <div className="text-xs text-slate-400">Expert Coaches</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-emerald-400">4.9/5.0</div>
              <div className="text-xs text-slate-400">Average Rating</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-amber-400">100%</div>
              <div className="text-xs text-slate-400">Verified Certs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="brand" className="mb-2">Curated Programs</Badge>
            <h2 className="text-3xl font-extrabold text-white">{t('featuredCourses')}</h2>
          </div>
          <Link href={`/${locale}/courses`}>
            <Button variant="ghost" className="gap-2 text-brand-400 hover:text-brand-300">
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCourses.map((course) => (
            <Card key={course.id} className="flex flex-col h-full overflow-hidden p-0">
              <div className="relative h-48 w-full overflow-hidden group">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <Badge variant="gold" className="absolute top-3 ltr:left-3 rtl:right-3">
                  {course.category}
                </Badge>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center text-amber-400 font-bold gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {course.rating}
                    </span>
                    <span>({course.reviewsCount})</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white line-clamp-2 hover:text-brand-400 transition-colors">
                    <Link href={`/${locale}/courses/${course.slug}`}>{course.title}</Link>
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {course.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover border border-slate-700"
                    />
                    <span className="text-xs font-medium text-slate-300">{course.instructor.name}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-white">${course.price}</span>
                    {course.originalPrice && (
                      <span className="text-xs text-slate-500 line-through ltr:ml-2 rtl:mr-2">
                        ${course.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose CoachSpace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-slate-800 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">{t('whyUsTitle')}</h2>
            <p className="text-sm text-slate-400">Built from the ground up for high-impact knowledge transfer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('whyUs1Title')}</h3>
              <p className="text-sm text-slate-400">{t('whyUs1Desc')}</p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('whyUs2Title')}</h3>
              <p className="text-sm text-slate-400">{t('whyUs2Desc')}</p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('whyUs3Title')}</h3>
              <p className="text-sm text-slate-400">{t('whyUs3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
