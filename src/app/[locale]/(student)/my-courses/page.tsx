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
import { PlayCircle, Award, BookOpen } from 'lucide-react';

export default function MyCoursesPage() {
  const t = useTranslations('nav');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-400" />
          {t('myCourses')}
        </h1>
        <p className="text-sm text-slate-400">Continue learning and tracking your achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockCourses.map((course, index) => {
          const progress = index === 0 ? 65 : index === 1 ? 30 : 100;
          return (
            <Card key={course.id} className="p-0 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full">
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <Badge variant="brand" className="absolute top-3 ltr:left-3 rtl:right-3">
                    {course.category}
                  </Badge>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-white line-clamp-2">{course.title}</h3>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-brand-400">{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <Link href={`/${locale}/learn/${course.id}`} className="flex-grow">
                  <Button variant="primary" className="w-full gap-2 text-xs py-2.5">
                    <PlayCircle className="w-4 h-4" />
                    <span>Continue</span>
                  </Button>
                </Link>

                {progress === 100 && (
                  <Link href={`/${locale}/certificates/cert-8849`}>
                    <Button variant="outline" className="gap-1.5 text-xs py-2.5 border-amber-500/40 text-amber-400">
                      <Award className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
