import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coachspace.com';
  const locales = ['ar', 'en'];

  const routes = [
    '',
    '/student',
    '/student/courses',
    '/student/certificates',
    '/instructor',
    '/instructor/courses',
    '/instructor/courses/create',
    '/login',
    '/register',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
