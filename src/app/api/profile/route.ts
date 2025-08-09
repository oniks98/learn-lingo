// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { requireAuth } from '@/lib/auth/server-auth';

/**
 * Оновлення профілю користувача
 * PATCH /api/profile
 */
export async function PATCH(request: NextRequest) {
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

    // Отримання даних для оновлення
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required and must be a string' },
        { status: 400 },
      );
    }

    // Оновлення даних в Realtime Database
    const database = admin.database();
    const userRef = database.ref(`users/${user.uid}`);

    const updates = {
      username: username.trim(),
      updatedAt: Date.now(),
    };

    await userRef.update(updates);

    // Отримання оновлених даних користувача
    const updatedUserSnapshot = await userRef.once('value');
    const updatedUserData = updatedUserSnapshot.val();

    return NextResponse.json(updatedUserData);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Помилка оновлення профілю:', error);
    }

    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}

/**
 * Видалення акаунта користувача
 * DELETE /api/profile
 */
export async function DELETE(request: NextRequest) {
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

    // Видалення всіх даних користувача з Realtime Database
    const deletePromises = [
      // Видалення профілю користувача
      await database.ref(`users/${user.uid}`).remove(),
      // Видалення улюблених викладачів
      await database.ref(`favorites/${user.uid}`).remove(),
      // Видалення бронювань користувача
      database
        .ref('bookings')
        .orderByChild('userId')
        .equalTo(user.uid)
        .once('value')
        .then(async (snapshot) => {
          const updates: Record<string, null> = {};
          snapshot.forEach((childSnapshot) => {
            updates[`bookings/${childSnapshot.key}`] = null;
          });
          return await database.ref().update(updates);
        }),
    ];

    await Promise.all(deletePromises);

    // Видалення користувача з Firebase Auth
    await admin.auth().deleteUser(user.uid);

    // Очищення сесійного куки
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Помилка видалення акаунта:', error);
    }

    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
