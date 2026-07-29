'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/slice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/features/auth/schemas/authSchemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User as UserIcon, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(
      setCredentials({
        user: {
          id: `u-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
        },
        token: 'mock-jwt-token-12345',
        refreshToken: 'mock-refresh-token-67890',
      })
    );
    if (data.role === 'INSTRUCTOR') {
      router.push(`/${locale}/dashboard`);
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">{t('registerTitle')}</h1>
            <p className="text-sm text-slate-400">{t('registerSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t('role')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'STUDENT')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                    selectedRole === 'STUDENT'
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserIcon className="w-5 h-5 text-brand-400" />
                  <span>{t('roleStudent')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'INSTRUCTOR')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                    selectedRole === 'INSTRUCTOR'
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-brand-400" />
                  <span>{t('roleInstructor')}</span>
                </button>
              </div>
            </div>

            <Input
              label={t('fullName')}
              placeholder="e.g. Tariq Mansoor"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label={t('email')}
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('password')}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {t('submitRegister')}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Already have an account?{' '}
            <Link href={`/${locale}/login`} className="text-brand-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
