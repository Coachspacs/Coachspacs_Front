'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { mockInstructorStats } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, Users, BookOpen, Star, Plus, TrendingUp } from 'lucide-react';

export default function InstructorDashboardPage() {
  const t = useTranslations('instructor');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{t('dashboard')}</h1>
          <p className="text-sm text-slate-400">Track revenue, student growth, and course metrics</p>
        </div>
        <Link href={`/${locale}/courses/new/edit`}>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>{t('createNewCourse')}</span>
          </Button>
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('totalRevenue')}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">${mockInstructorStats.totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% from last month</span>
          </div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('totalStudents')}</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{mockInstructorStats.totalStudents.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Across 6 active courses</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('activeCourses')}</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{mockInstructorStats.activeCourses}</div>
          <div className="text-xs text-slate-400">2 pending review</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{mockInstructorStats.averageRating}</div>
          <div className="text-xs text-slate-400">From 540 student reviews</div>
        </Card>
      </div>

      {/* Monthly Revenue Visual Bar */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Monthly Earnings Overview</h2>
        <div className="h-44 flex items-end gap-4 pt-6">
          {mockInstructorStats.monthlyEarnings.map((item) => {
            const heightPercent = (item.earnings / 5000) * 100;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] text-slate-400 font-mono">${item.earnings}</span>
                <div
                  className="w-full bg-gradient-to-t from-brand-700 to-brand-500 rounded-t-lg transition-all hover:brightness-125"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs text-slate-400 font-medium">{item.month}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
