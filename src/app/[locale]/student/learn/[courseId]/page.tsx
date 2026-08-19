'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { mockCourses } from '@/lib/mockData';
import { Lesson } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  PlayCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Award,
  BookOpen,
} from 'lucide-react';

export default function CoursePlayerPage() {
  const t = useTranslations('player');
  const params = useParams();
  const locale = params.locale as string;

  const course = mockCourses[0];
  const modulesList: any[] = (course as any).modules || (course as any).sections || [];
  const allLessons: Lesson[] = modulesList.flatMap((m: any) => m.lessons) || [];

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['les-1', 'les-2']);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeLesson = allLessons[activeLessonIndex] || allLessons[0];
  const isCurrentCompleted = completedLessonIds.includes(activeLesson.id);

  const toggleLessonCompletion = (lessonId: string) => {
    if (completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds(completedLessonIds.filter((id) => id !== lessonId));
    } else {
      setCompletedLessonIds([...completedLessonIds, lessonId]);
    }
  };

  const handleNext = () => {
    if (activeLessonIndex < allLessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    }
  };

  const progressPercent = Math.round((completedLessonIds.length / allLessons.length) * 100);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-slate-950 text-slate-100 rounded-3xl overflow-hidden shadow-2xl">
      {/* Video Content & Controls (Main Area) */}
      <div className="flex-grow flex flex-col justify-between p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Player Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">{course.titleAr || course.titleEn || (course as any).title}</span>
            <h1 className="text-xl font-bold text-white mt-1">{activeLesson.title}</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
          <video
            key={activeLesson.id}
            controls
            autoPlay
            className="w-full h-full object-cover"
            src={activeLesson.videoUrl}
          >
            Your browser does not support HTML5 video player.
          </video>
        </div>

        {/* Navigation & Lesson Completion Bar */}
        <div className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <Button
              variant={isCurrentCompleted ? 'outline' : 'primary'}
              size="sm"
              onClick={() => toggleLessonCompletion(activeLesson.id)}
              className="gap-2"
            >
              <CheckCircle className={`w-4 h-4 ${isCurrentCompleted ? 'text-emerald-400' : ''}`} />
              <span>{isCurrentCompleted ? t('completed') : t('markCompleted')}</span>
            </Button>

            {progressPercent === 100 && (
              <Link href={`/${locale}/student/certificates/cert-8849`}>
                <Button variant="ghost" size="sm" className="text-amber-400 gap-1.5 font-bold">
                  <Award className="w-4 h-4" />
                  Claim Certificate
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              disabled={activeLessonIndex === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t('prevLesson')}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleNext}
              disabled={activeLessonIndex === allLessons.length - 1}
              className="gap-1"
            >
              <span>{t('nextLesson')}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsible Syllabus Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-96 border-t lg:border-t-0 ltr:lg:border-l rtl:lg:border-r border-slate-800 p-6 space-y-6 shrink-0 bg-slate-900/80">
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              {t('courseContent')}
            </h2>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">{t('yourProgress')}</span>
                <span className="text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module List */}
          <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
            {modulesList.map((module: any) => (
              <div key={module.id} className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {module.title}
                </h3>
                <div className="space-y-1">
                  {module.lessons.map((lesson: any) => {
                    const globalIdx = allLessons.findIndex((l) => l.id === lesson.id);
                    const isActive = globalIdx === activeLessonIndex;
                    const isDone = completedLessonIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonIndex(globalIdx)}
                        className={`w-full p-3 rounded-xl flex items-center justify-between text-left rtl:text-right text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#0F5244]/40 border border-emerald-500 text-white font-bold'
                            : 'bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="line-clamp-1">{lesson.title}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-2">{lesson.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
