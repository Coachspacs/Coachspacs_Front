import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import StoreProvider from '@/components/StoreProvider';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} lang={locale} className="min-h-screen flex flex-col antialiased font-sans w-full">
      <StoreProvider>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <main className="flex-grow w-full">{children}</main>
        </NextIntlClientProvider>
      </StoreProvider>
    </div>
  );
}
