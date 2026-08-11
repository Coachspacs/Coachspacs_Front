import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !['en', 'ar'].includes(locale)) {
    locale = 'en';
  }

  const messages =
    locale === 'ar'
      ? (await import('../../messages/ar.json')).default
      : (await import('../../messages/en.json')).default;

  return {
    locale,
    messages,
  };
});
