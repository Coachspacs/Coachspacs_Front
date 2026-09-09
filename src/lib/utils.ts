import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(dateString: string, locale = 'en-US') {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function resolveMediaUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const baseWithoutApi = apiBase.replace(/\/api\/?$/, '');
  return baseWithoutApi ? `${baseWithoutApi}${trimmed.startsWith('/') ? '' : '/'}${trimmed}` : trimmed;
}
