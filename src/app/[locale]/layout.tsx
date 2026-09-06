import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import StoreProvider from '@/components/StoreProvider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'ar' || rawLocale === 'en' ? rawLocale : 'en';

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} lang={locale} className="min-h-screen flex flex-col antialiased font-sans w-full">
      <StoreProvider>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthInitializer />
          <main className="flex-grow w-full">{children}</main>
        </NextIntlClientProvider>
      </StoreProvider>
    </div>
  );
}
