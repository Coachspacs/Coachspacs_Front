'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { mockEnrolledStudents } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { Users, Mail } from 'lucide-react';

export default function EnrolledStudentsPage() {
  const t = useTranslations('instructor');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-brand-400" />
          {t('studentsEnrolled')}
        </h1>
        <p className="text-sm text-slate-400">View progress and details of students in your program</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Enrolled Date</th>
                <th className="p-4">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockEnrolledStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={st.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'}
                        alt={st.name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white">{st.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {st.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{st.courseTitle}</td>
                  <td className="p-4 text-slate-400">{st.enrolledAt}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                      <span className="font-bold text-brand-400">{st.progress}%</span>
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
