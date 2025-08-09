import {
  TeacherPreview,
  TeacherExtraInfo,
  TeacherInfoModal,
} from '@/lib/types/types';

/**
 * Допоміжна функція для отримання базового URL
 */
function getBaseUrl() {
  // Для серверного рендерингу
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
  }
  // Для клієнтського рендерингу
  return window.location.origin;
}

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
 * Отримання всіх викладачів (тільки preview дані)
 */
export async function getAllTeachers(
  locale?: string,
): Promise<TeacherPreview[]> {
  const baseUrl = getBaseUrl();
  const currentLocale = locale || getCurrentLocale();

  const response = await fetch(
    `${baseUrl}/api/teachers?locale=${currentLocale}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch teachers: ${response.statusText}`);
  }

  const data = await response.json();
  return data.teachers || [];
}

/**
 * Отримання розширеної інформації про викладача за ID
 */
export async function getTeacherExtraInfo(
  teacherId: string,
  locale?: string,
): Promise<TeacherExtraInfo | null> {
  const baseUrl = getBaseUrl();
  const currentLocale = locale || getCurrentLocale();

  const response = await fetch(
    `${baseUrl}/api/teachers/${teacherId}/extra?locale=${currentLocale}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(
      `Failed to fetch teacher extra info: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Отримання базової інформації про викладача за ID
 * Для модальних вікон, карток бронювання тощо (не потребує локалізації)
 */
export async function getTeacherById(
  teacherId: string,
): Promise<TeacherInfoModal | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/teachers/${teacherId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch teacher: ${response.statusText}`);
  }

  return response.json();
}
