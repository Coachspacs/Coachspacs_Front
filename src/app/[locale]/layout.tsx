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
    <html lang={locale} dir={dir}>
      <body className="min-h-screen flex flex-col antialiased font-sans">
        <StoreProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <main className="flex-grow">{children}</main>
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
