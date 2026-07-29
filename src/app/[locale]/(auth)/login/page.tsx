'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/slice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/features/auth/schemas/authSchemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'student@example.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMsg('');
      // Simulated auth success for seamless experience
      dispatch(
        setCredentials({
          user: {
            id: 'u-101',
            name: data.email.includes('instructor') ? 'Dr. Tariq Al-Mansoor' : 'Mohammed Katanani',
            email: data.email,
            role: data.email.includes('instructor') ? 'INSTRUCTOR' : 'STUDENT',
          },
          token: 'mock-jwt-token-12345',
          refreshToken: 'mock-refresh-token-67890',
        })
      );
      router.push(`/${locale}`);
    } catch {
      setErrorMsg('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">{t('loginTitle')}</h1>
            <p className="text-sm text-slate-400">{t('loginSubtitle')}</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label={t('email')}
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Mail className="absolute ltr:right-3 rtl:left-3 top-9 w-4 h-4 text-slate-500" />
            </div>

            <div className="relative">
              <Input
                label={t('password')}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <Lock className="absolute ltr:right-3 rtl:left-3 top-9 w-4 h-4 text-slate-500" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <Link href={`/${locale}/forgot-password`} className="text-brand-400 hover:underline font-medium">
                {t('forgotPassword')}
              </Link>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full gap-2">
              <span>{t('submitLogin')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Don't have an account?{' '}
            <Link href={`/${locale}/register`} className="text-brand-400 font-semibold hover:underline">
              Create one now
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
