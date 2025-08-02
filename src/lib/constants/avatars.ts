// src/lib/constants/avatars.ts

/**
 * Массив смешных аватаров для отображения в развернутых карточках учителей
 */
export const FUNNY_AVATARS = [
  '/images/funny-avatars/avatar-1.png',
  '/images/funny-avatars/avatar-2.png',
  '/images/funny-avatars/avatar-3.png',
  '/images/funny-avatars/avatar-4.png',
  '/images/funny-avatars/avatar-5.png',
  '/images/funny-avatars/avatar-6.png',
  '/images/funny-avatars/avatar-7.png',
  '/images/funny-avatars/avatar-8.png',
] as const;

/**
 * Функция для получения детерминированного случайного аватара для учителя
 * @param teacherId - ID учителя
 * @returns Путь к смешному аватару
 */
export const getFunnyAvatarForTeacher = (teacherId: string): string => {
  // Создаем простой хеш из ID учителя для детерминированности
  let hash = 0;
  for (let i = 0; i < teacherId.length; i++) {
    const char = teacherId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Получаем индекс от 0 до длины массива аватаров
  const index = Math.abs(hash) % FUNNY_AVATARS.length;
  return FUNNY_AVATARS[index];
};

// Экспорт типа для TypeScript
export type FunnyAvatar = (typeof FUNNY_AVATARS)[number];
