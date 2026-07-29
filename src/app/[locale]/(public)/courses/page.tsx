'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { mockCourses } from '@/lib/mockData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Star, Clock, Filter, X } from 'lucide-react';

export default function CatalogPage() {
  const t = useTranslations('catalog');
  const params = useParams();
  const locale = params.locale as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const categories = ['All', 'Web Development', 'Design', 'Business & Coaching'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLevel =
        selectedLevel === 'All' || course.level.toLowerCase() === selectedLevel.toLowerCase();

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Catalog Header */}
      <div className="space-y-4 text-center md:text-start">
        <h1 className="text-4xl font-extrabold text-white">{t('title')}</h1>
        <p className="text-base text-slate-400 max-w-2xl">{t('subtitle')}</p>
      </div>

      {/* Search & Filters Controls */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="relative">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 rtl:pr-11 text-base py-3"
          />
          <Search className="absolute ltr:left-4 rtl:right-4 top-3.5 w-5 h-5 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute ltr:right-4 rtl:left-4 top-3.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">{t('level')}:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <p className="text-lg text-slate-400">{t('noResults')}</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLevel('All');
            }}
          >
            {t('clearFilters')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col h-full overflow-hidden p-0">
              <div className="relative h-48 w-full overflow-hidden group">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <Badge variant="brand" className="absolute top-3 ltr:left-3 rtl:right-3">
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
                      width={28}
                      height={28}
                      className="rounded-full object-cover border border-slate-700"
                    />
                    <span className="text-xs font-medium text-slate-300">{course.instructor.name}</span>
                  </div>

                  <span className="text-lg font-extrabold text-white">${course.price}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
