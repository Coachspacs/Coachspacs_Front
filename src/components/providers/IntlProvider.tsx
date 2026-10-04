"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";

interface IntlProviderProps {
  messages: any;
  locale: string;
  children: React.ReactNode;
}

export function IntlProvider({ messages, locale, children }: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      messages={messages}
      locale={locale}
      onError={(error) => {
        if (error.code === "MISSING_MESSAGE") {
          return;
        }
        console.warn(error);
      }}
      getMessageFallback={({ key, namespace }) => {
        return namespace ? `${namespace}.${key}` : key;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
