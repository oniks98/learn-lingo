// src/app/api/profile/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { requireAuth } from '@/lib/auth/server-auth';

// Отримання статистики користувача
export async function GET(request: NextRequest) {
  try {
    console.log('--- API User Stats Request Started ---');

    // Используем готовую функцию аутентификации
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      console.error('Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    console.log('User authenticated successfully:', user.uid);

    const database = admin.database();

    // ИСПРАВЛЕНО: Отримуємо кількість улюблених викладачів з правильного шляху
    const favoritesSnapshot = await database
      .ref(`users/${user.uid}/favorites`)
      .once('value');
    const favoritesData = favoritesSnapshot.val();

    // Подсчитываем только те фавориты, которые имеют значение true
    let favoritesCount = 0;
    if (favoritesData) {
      favoritesCount = Object.entries(favoritesData).filter(
        ([_, value]) => value === true,
      ).length;
    }

    // Отримуємо кількість бронювань користувача
    const bookingsSnapshot = await database
      .ref('bookings')
      .orderByChild('userId')
      .equalTo(user.uid)
      .once('value');

    const bookingsData = bookingsSnapshot.val();
    const bookingsCount = bookingsData ? Object.keys(bookingsData).length : 0;

    console.log(
      `User stats - Favorites: ${favoritesCount}, Bookings: ${bookingsCount}`,
    );
    console.log('Favorites data:', favoritesData);

    const stats = {
      favoritesCount,
      bookingsCount,
    };

    console.log('--- API User Stats Request Finished Successfully ---');
    return NextResponse.json(stats);
  } catch (error) {
    console.error('--- API User Stats Request Error ---');
    console.error('User stats error:', error);

    return NextResponse.json(
      { error: 'Internal server error during stats fetch' },
      { status: 500 },
    );
  }
}
