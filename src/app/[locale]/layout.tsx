import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { draftMode } from 'next/headers';
import StoreProvider from '@/components/StoreProvider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { DynamicBrandingInjector } from '@/components/cms/DynamicBrandingInjector';
import { PreviewModeBanner } from '@/components/cms/PreviewModeBanner';

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
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <div dir={dir} lang={locale} className="min-h-screen flex flex-col antialiased font-sans w-full">
      <DynamicBrandingInjector />
      {isDraftMode && <PreviewModeBanner locale={locale} />}
      <StoreProvider>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthInitializer />
          <CartDrawer />
          <main className="flex-grow w-full">{children}</main>
        </NextIntlClientProvider>
      </StoreProvider>
    </div>
  );
}
