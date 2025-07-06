import { TeacherPreview } from '@/lib/types/types';

export function filterTeachers(
  teachers: TeacherPreview[],
  filters: {
    language?: string;
    level?: string;
    price?: number;
  },
): TeacherPreview[] {
  return teachers.filter((teacher) => {
    const matchesLanguage =
      !filters.language || teacher.languages.includes(filters.language);

    const matchesLevel =
      !filters.level || teacher.levels.includes(filters.level);

    const matchesPrice =
      filters.price === undefined || teacher.price_per_hour === filters.price;

    return matchesLanguage && matchesLevel && matchesPrice;
  });
}
