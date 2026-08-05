import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import StoreProvider from '@/components/StoreProvider';
import { Cairo, Plus_Jakarta_Sans } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

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
    <html lang={locale} dir={dir} className={`${cairo.variable} ${jakarta.variable}`}>
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
