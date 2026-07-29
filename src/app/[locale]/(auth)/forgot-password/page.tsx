'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/features/auth/schemas/authSchemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">{t('forgotPassword')}</h1>
            <p className="text-sm text-slate-400">Enter your account email to receive a recovery link</p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Check your Inbox</h3>
              <p className="text-xs text-slate-300">
                We sent a password reset link to your email address. Follow the link to create a new password.
              </p>
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm" className="mt-2">Back to Login</Button>
              </Link>
            </div>
          ) : (
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

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                {t('sendReset')}
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Remembered your password?{' '}
            <Link href={`/${locale}/login`} className="text-brand-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
