import { TeacherPreview } from '@/lib/types/types';

const API_BASE = '/api';

/**
 * Допоміжна функція для отримання поточної локалі
 */
function getCurrentLocale(): string {
  if (typeof window === 'undefined') {
    return 'en'; // За замовчуванням для SSR
  }

  // Витягуємо локаль з pathname
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  return localeMatch ? localeMatch[1] : 'en';
}

/**
 * Отримання всіх улюблених викладачів поточного користувача
 */
export async function getFavorites(
  locale?: string,
): Promise<{ favorites: TeacherPreview[] }> {
  const currentLocale = locale || getCurrentLocale();

  const response = await fetch(
    `${API_BASE}/favorites?locale=${currentLocale}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch favorites: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Додавання викладача до улюблених
 */
export async function addToFavorites(teacherId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teacherId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add to favorites: ${response.statusText}`);
  }
}

/**
 * Видалення викладача з улюблених
 */
export async function removeFromFavorites(teacherId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/favorites`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teacherId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to remove from favorites: ${response.statusText}`);
  }
}

/**
 * Перевірка чи викладач у улюблених
 */
export async function checkIsFavorite(teacherId: string): Promise<boolean> {
  try {
    const { favorites } = await getFavorites();
    return favorites.some((teacher) => teacher.id === teacherId);
  } catch {
    // Якщо помилка (наприклад, не авторизований), вважаємо що не в улюблених
    return false;
  }
}
