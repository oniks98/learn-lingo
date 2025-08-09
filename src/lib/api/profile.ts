import { UserData } from '@/lib/types/types';

const API_BASE = '/api';

/**
 * Оновлення профілю користувача
 */
export async function updateProfile(updates: {
  username: string;
}): Promise<UserData> {
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Видалення акаунта користувача
 */
export async function deleteAccount(): Promise<void> {
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete account: ${response.statusText}`);
  }
}

/**
 * Отримання статистики користувача
 */
export async function getUserStats(): Promise<{
  favoritesCount: number;
  bookingsCount: number;
}> {
  const response = await fetch(`${API_BASE}/profile/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user stats: ${response.statusText}`);
  }

  return response.json();
}
