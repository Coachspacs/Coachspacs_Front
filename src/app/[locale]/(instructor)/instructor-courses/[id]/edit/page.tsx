'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Save, Trash2, ArrowLeft, Video } from 'lucide-react';

export default function CourseEditorPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [title, setTitle] = useState('Next.js 15 & React 19 Masterclass');
  const [category, setCategory] = useState('Web Development');
  const [price, setPrice] = useState('89.99');

  const [modules, setModules] = useState([
    {
      id: 'm1',
      title: 'Module 1: Foundations',
      lessons: [
        { id: 'l1', title: 'Introduction & Setup', duration: '10:00' },
        { id: 'l2', title: 'Next.js App Router', duration: '15:30' },
      ],
    },
  ]);

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: `m${Date.now()}`,
        title: `Module ${modules.length + 1}: New Topic`,
        lessons: [{ id: `l${Date.now()}`, title: 'New Lesson Video', duration: '12:00' }],
      },
    ]);
  };

  const addLesson = (moduleId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: [
              ...m.lessons,
              { id: `l${Date.now()}`, title: 'New Lesson Title', duration: '10:00' },
            ],
          };
        }
        return m;
      })
    );
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lessonId),
          };
        }
        return m;
      })
    );
  };

  const handleSave = () => {
    router.push(`/${locale}/instructor-courses`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Courses</span>
        </button>

        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      <h1 className="text-3xl font-extrabold text-white">Course Studio & Curriculum Builder</h1>

      {/* General Information Card */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input label="Price ($)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </Card>

      {/* Curriculum Builder */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Curriculum Modules</h2>
          <Button variant="outline" size="sm" onClick={addModule} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </Button>
        </div>

        <div className="space-y-6">
          {modules.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setModules(modules.map((mod) => (mod.id === m.id ? { ...mod, title: newTitle } : mod)));
                  }}
                  className="bg-transparent text-sm font-bold text-brand-400 focus:outline-none focus:border-b border-brand-500"
                />
                <Button variant="ghost" size="sm" onClick={() => addLesson(m.id)} className="text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Lesson
                </Button>
              </div>

              <div className="space-y-2 pl-4 border-l border-slate-800">
                {m.lessons.map((les) => (
                  <div key={les.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-slate-500" />
                      <span>{les.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">{les.duration}</span>
                      <button
                        onClick={() => deleteLesson(m.id, les.id)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
