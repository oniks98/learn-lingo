// src/utils/sitemap.ts
import { MetadataRoute } from 'next';
import { SEO_CONFIG, type Locale } from '@/config/seo';

/**
 * Получает ID учителей из API
 */
export async function getTeacherIds(): Promise<string[]> {
  try {
    const response = await fetch(
      `${SEO_CONFIG.baseUrl}/api/teachers?locale=en`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Добавляем кеширование для статической генерации
        next: { revalidate: 3600 }, // обновляем каждый час
      },
    );

    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.teachers?.map((teacher: any) => teacher.id) || [];
  } catch (error) {
    console.error('Error fetching teacher IDs for sitemap:', error);
    return [];
  }
}

/**
 * Создает записи sitemap для основных маршрутов
 */
export function createBasicSitemapEntries(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [];

  SEO_CONFIG.locales.forEach((locale: Locale) => {
    SEO_CONFIG.routes.public.forEach((route) => {
      const isHome = route === '';

      sitemap.push({
        url: `${SEO_CONFIG.baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: isHome
          ? SEO_CONFIG.sitemap.changeFrequencies.home
          : SEO_CONFIG.sitemap.changeFrequencies.teachers,
        priority: isHome
          ? SEO_CONFIG.sitemap.priorities.home
          : SEO_CONFIG.sitemap.priorities.teachers,
        alternates: {
          languages: Object.fromEntries(
            SEO_CONFIG.locales.map((lang) => [
              lang,
              `${SEO_CONFIG.baseUrl}/${lang}${route}`,
            ]),
          ),
        },
      });
    });
  });

  return sitemap;
}

/**
 * Создает записи sitemap для страниц учителей
 */
export function createTeacherSitemapEntries(
  teacherIds: string[],
): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [];

  SEO_CONFIG.locales.forEach((locale: Locale) => {
    teacherIds.forEach((id) => {
      sitemap.push({
        url: `${SEO_CONFIG.baseUrl}/${locale}/teachers/${id}`,
        lastModified: new Date(),
        changeFrequency: SEO_CONFIG.sitemap.changeFrequencies.teacherProfile,
        priority: SEO_CONFIG.sitemap.priorities.teacherProfile,
        alternates: {
          languages: Object.fromEntries(
            SEO_CONFIG.locales.map((lang) => [
              lang,
              `${SEO_CONFIG.baseUrl}/${lang}/teachers/${id}`,
            ]),
          ),
        },
      });
    });
  });

  return sitemap;
}
