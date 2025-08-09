/**
 * Масив кумедних аватарів для відображення в розгорнутих картках викладачів
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
  '/images/funny-avatars/avatar-9.png',
  '/images/funny-avatars/avatar-10.png',
  '/images/funny-avatars/avatar-11.png',
] as const;

/**
 * Функція для отримання детермінованого випадкового аватара для викладача
 * @param teacherId - ID викладача
 * @returns Шлях до кумедного аватара
 */
export const getFunnyAvatarForTeacher = (teacherId: string): string => {
  // Створюємо простий хеш з ID викладача для детермінованості
  let hash = 0;
  for (let i = 0; i < teacherId.length; i++) {
    const char = teacherId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Конвертуємо в 32-бітне ціле число
  }

  // Отримуємо індекс від 0 до довжини масиву аватарів
  const index = Math.abs(hash) % FUNNY_AVATARS.length;
  return FUNNY_AVATARS[index];
};
