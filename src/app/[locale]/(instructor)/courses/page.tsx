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
import { Edit, Users, Eye, Plus, BookOpen } from 'lucide-react';

export default function InstructorCoursesPage() {
  const t = useTranslations('instructor');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-400" />
          {t('myCourses')}
        </h1>
        <Link href={`/${locale}/courses/new/edit`}>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>{t('createNewCourse')}</span>
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">{t('courseTitle')}</th>
                <th className="p-4">Price</th>
                <th className="p-4">Students</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={48}
                        height={36}
                        className="rounded-lg object-cover shrink-0"
                      />
                      <span className="font-bold text-white line-clamp-1">{course.title}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-200">${course.price}</td>
                  <td className="p-4">{course.studentsCount}</td>
                  <td className="p-4">
                    <Badge variant={course.isPublished ? 'accent' : 'outline'}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/${locale}/courses/${course.id}/edit`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                      </Link>

                      <Link href={`/${locale}/courses/${course.id}/students`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-brand-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>Students</span>
                        </Button>
                      </Link>

                      <Link href={`/${locale}/courses/${course.slug}`}>
                        <Button variant="ghost" size="sm" className="p-1.5">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
