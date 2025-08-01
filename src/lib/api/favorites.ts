// src/lib/api/favorites.ts
import { TeacherPreview } from '@/lib/types/types';

const API_BASE = '/api';

// Helper function to get current locale
function getCurrentLocale(): string {
  if (typeof window === 'undefined') {
    return 'en'; // Default for SSR
  }

  // Extract locale from pathname
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  return localeMatch ? localeMatch[1] : 'en';
}

// Отримати всі улюблені вчителі поточного користувача
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

// Додати вчителя в улюблене
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

// Видалити вчителя з улюбленого
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

// Перевірити, чи вчитель в улюбленому
export async function checkIsFavorite(teacherId: string): Promise<boolean> {
  try {
    const { favorites } = await getFavorites();
    return favorites.some((teacher) => teacher.id === teacherId);
  } catch (error) {
    // Якщо помилка (наприклад, не авторизований), вважаємо що не в фаворитах
    return false;
  }
}
