// src/app/api/profile/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { requireAuth } from '@/lib/auth/server-auth';

/**
 * Отримання статистики користувача
 * GET /api/profile/stats
 */
export async function GET(request: NextRequest) {
  try {
    // Перевірка автентифікації користувача
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    const database = admin.database();

    // Отримання кількості улюблених викладачів
    const favoritesSnapshot = await database
      .ref(`users/${user.uid}/favorites`)
      .once('value');
    const favoritesData = favoritesSnapshot.val();

    // Підрахунок тільки активних фаворитів (зі значенням true)
    let favoritesCount = 0;
    if (favoritesData) {
      favoritesCount = Object.entries(favoritesData).filter(
        ([_, value]) => value === true,
      ).length;
    }

    // Отримання кількості бронювань користувача
    const bookingsSnapshot = await database
      .ref('bookings')
      .orderByChild('userId')
      .equalTo(user.uid)
      .once('value');

    const bookingsData = bookingsSnapshot.val();
    const bookingsCount = bookingsData ? Object.keys(bookingsData).length : 0;

    // Повернення статистики
    return NextResponse.json({
      favoritesCount,
      bookingsCount,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Помилка отримання статистики користувача:', error);
    }

    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
