import { TeacherPreview } from '@/lib/types/types';

/**
 * Фільтрує список викладачів за заданими критеріями
 * @param teachers - масив викладачів для фільтрації
 * @param filters - об'єкт з критеріями фільтрації
 * @returns відфільтрований масив викладачів
 */
export function filterTeachers(
  teachers: TeacherPreview[],
  filters: {
    language?: string;
    level?: string;
    price?: number;
  },
): TeacherPreview[] {
  return teachers.filter((teacher) => {
    // Перевірка відповідності мови навчання
    const matchesLanguage =
      !filters.language || teacher.languages.includes(filters.language);

    // Перевірка відповідності рівня навчання
    const matchesLevel =
      !filters.level || teacher.levels.includes(filters.level);

    // Перевірка відповідності ціни за годину
    const matchesPrice =
      filters.price === undefined || teacher.price_per_hour === filters.price;

    // Логування для розробки
    if (process.env.NODE_ENV === 'development') {
      console.log('Фільтрація викладача:', {
        teacherId: teacher.id,
        matchesLanguage,
        matchesLevel,
        matchesPrice,
        filters,
      });
    }

    return matchesLanguage && matchesLevel && matchesPrice;
  });
}
