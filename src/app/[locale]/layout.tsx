import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import StoreProvider from '@/components/StoreProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

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
    <html lang={locale} dir={dir} className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <StoreProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
