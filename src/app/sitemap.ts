// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import {
  getTeacherIds,
  createBasicSitemapEntries,
  createTeacherSitemapEntries,
} from '@/lib/utils/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Создаем базовые записи для основных страниц
    const basicEntries = createBasicSitemapEntries();

    // Получаем ID учителей и создаем для них записи
    const teacherIds = await getTeacherIds();
    const teacherEntries = createTeacherSitemapEntries(teacherIds);

    // Объединяем все записи
    return [...basicEntries, ...teacherEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // В случае ошибки возвращаем хотя бы базовые страницы
    return createBasicSitemapEntries();
  }
}
