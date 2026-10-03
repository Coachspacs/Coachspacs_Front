import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !['en', 'ar'].includes(locale)) {
    locale = 'en';
  }

  let messages;
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
    messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    messages =
      locale === 'ar'
        ? (await import('../../messages/ar.json')).default
        : (await import('../../messages/en.json')).default;
  }

  return {
    locale,
    messages,
  };
});
