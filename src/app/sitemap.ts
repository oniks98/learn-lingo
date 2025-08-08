// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import {
  getTeacherIds,
  createBasicSitemapEntries,
  createTeacherSitemapEntries,
} from '@/lib/utils/sitemap';

// Кешування даних для оптимізації
const CACHE_DURATION = 1000 * 60 * 60; // 1 година
let cachedSitemap: MetadataRoute.Sitemap | null = null;
let lastCacheTime = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();

  // Використовуємо кеш якщо він свіжий
  if (cachedSitemap && now - lastCacheTime < CACHE_DURATION) {
    return cachedSitemap;
  }

  try {
    const sitemapEntries = await generateSitemap();

    // Оновлюємо кеш
    cachedSitemap = sitemapEntries;
    lastCacheTime = now;

    return sitemapEntries;
  } catch (error) {
    console.error('Помилка генерації sitemap:', error);

    // Повертаємо кеш якщо є, інакше базові сторінки
    if (cachedSitemap) {
      console.warn('Повертаємо кешовану версію через помилку');
      return cachedSitemap;
    }

    return createBasicSitemapEntries();
  }
}

async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  // Створюємо базові записи для основних сторінок
  const basicEntries = createBasicSitemapEntries();

  // Завантажуємо всіх вчителів та створюємо для них записи
  const teacherIds = await getTeacherIds();
  const teacherEntries = createTeacherSitemapEntries(teacherIds);

  // Об'єднуємо всі записи
  return [...basicEntries, ...teacherEntries];
}
