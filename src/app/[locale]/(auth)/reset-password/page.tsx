'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/features/auth/schemas/authSchemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [resetDone, setResetDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async () => {
    setResetDone(true);
    setTimeout(() => {
      router.push(`/${locale}/login`);
    }, 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">{t('resetPasswordTitle')}</h1>
            <p className="text-sm text-slate-400">{t('resetPasswordSub')}</p>
          </div>

          {resetDone ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center font-semibold">
              Password reset successfully! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Reset Password
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            <Link href={`/${locale}/login`} className="text-brand-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
