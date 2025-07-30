// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { requireAuth } from '@/lib/auth/server-auth';

// Оновлення профілю користувача
export async function PATCH(request: NextRequest) {
  try {
    console.log('--- API Profile Update Request Started ---');

    // Проверяем аутентификацию пользователя
    const authResult = await requireAuth(request);

    if ('error' in authResult) {
      console.error('Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    console.log('Session verified for user:', user.uid);

    // Отримуємо дані для оновлення
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required and must be a string' },
        { status: 400 },
      );
    }

    // Оновлюємо дані в Realtime Database
    const database = admin.database();
    const userRef = database.ref(`users/${user.uid}`);

    const updates = {
      username: username.trim(),
      updatedAt: Date.now(),
    };

    await userRef.update(updates);
    console.log('User profile updated successfully');

    // Отримуємо оновлені дані користувача
    const updatedUserSnapshot = await userRef.once('value');
    const updatedUserData = updatedUserSnapshot.val();

    console.log('--- API Profile Update Request Finished Successfully ---');
    return NextResponse.json(updatedUserData);
  } catch (error) {
    console.error('--- API Profile Update Request Error ---');
    console.error('Profile update error:', error);

    return NextResponse.json(
      { error: 'Internal server error during profile update' },
      { status: 500 },
    );
  }
}

// Видалення акаунта користувача
export async function DELETE(request: NextRequest) {
  try {
    console.log('--- API Account Deletion Request Started ---');

    // Проверяем аутентификацию пользователя
    const authResult = await requireAuth(request);

    if ('error' in authResult) {
      console.error('Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    console.log('Session verified for user:', user.uid);

    const database = admin.database();

    // Видаляємо всі дані користувача з Realtime Database
    const deletePromises = [
      // Видаляємо профіль користувача
      database.ref(`users/${user.uid}`).remove(),
      // Видаляємо улюблених викладачів
      database.ref(`favorites/${user.uid}`).remove(),
      // Видаляємо бронювання користувача
      database
        .ref('bookings')
        .orderByChild('userId')
        .equalTo(user.uid)
        .once('value')
        .then((snapshot) => {
          const updates: Record<string, null> = {};
          snapshot.forEach((childSnapshot) => {
            updates[`bookings/${childSnapshot.key}`] = null;
          });
          return database.ref().update(updates);
        }),
    ];

    await Promise.all(deletePromises);
    console.log('User data deleted from Realtime Database');

    // Видаляємо користувача з Firebase Auth
    await admin.auth().deleteUser(user.uid);
    console.log('User deleted from Firebase Auth');

    // Очищаємо сесійний куки
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');

    console.log('--- API Account Deletion Request Finished Successfully ---');
    return response;
  } catch (error) {
    console.error('--- API Account Deletion Request Error ---');
    console.error('Account deletion error:', error);

    return NextResponse.json(
      { error: 'Internal server error during account deletion' },
      { status: 500 },
    );
  }
}
