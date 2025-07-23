// src/lib/auth/server-auth.ts
import { NextRequest } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { UserData } from '@/lib/types/types';

/**
 * Извлекает и верифицирует пользователя из session cookie
 * Используется в API роутах для получения текущего пользователя
 */
export async function getCurrentUserFromRequest(
  request: NextRequest,
): Promise<UserData | null> {
  try {
    // Получаем session cookie из запроса
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      console.log('No session cookie found');
      return null;
    }

    // Верифицируем session cookie
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    if (!decodedClaims) {
      console.log('Invalid session cookie');
      return null;
    }

    const { uid } = decodedClaims;

    // Получаем данные пользователя из Realtime Database
    const userSnapshot = await admin
      .database()
      .ref(`users/${uid}`)
      .once('value');

    if (!userSnapshot.exists()) {
      console.log('User not found in database');
      return null;
    }

    const userData = userSnapshot.val() as UserData;
    console.log('User authenticated successfully:', userData.uid);

    return userData;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

/**
 * Middleware для API роутов, требующих аутентификации
 * Возвращает пользователя или null, если не аутентифицирован
 */
export async function requireAuth(
  request: NextRequest,
): Promise<{ user: UserData } | { error: string; status: number }> {
  const user = await getCurrentUserFromRequest(request);

  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  if (!user.emailVerified) {
    return { error: 'Email not verified', status: 403 };
  }

  return { user };
}
