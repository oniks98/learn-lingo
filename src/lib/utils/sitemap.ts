import { MetadataRoute } from 'next';
import { SEO_CONFIG, type Locale } from '@/config/seo';

/**
 * Отримує ID викладачів з API
 * @returns масив ідентифікаторів викладачів
 */
export async function getTeacherIds(): Promise<string[]> {
  try {
    const response = await fetch(
      `${SEO_CONFIG.baseUrl}/api/teachers?locale=en`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Додаємо кешування для статичної генерації
        next: { revalidate: 3600 }, // оновлюємо кожну годину
      },
    );

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Помилка API: ${response.status}`);
      }
      return [];
    }

    const data = await response.json();
    return data.teachers?.map((teacher: any) => teacher.id) || [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Помилка отримання ID викладачів для sitemap:', error);
    }
    return [];
  }
}

/**
 * Створює записи sitemap для основних маршрутів
 * @returns масив записів для основних сторінок
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
 * Створює записи sitemap для сторінок викладачів
 * @param teacherIds - масив ідентифікаторів викладачів
 * @returns масив записів для профілів викладачів
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
