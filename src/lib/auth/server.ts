// src/lib/auth/server.ts
import { cookies, headers } from 'next/headers';
import { admin } from '@/lib/db/firebase-admin';
import { UserData } from '@/lib/types/types';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Серверні утиліти для роботи з аутентифікацією
 */

/**
 * Отримує дані поточного користувача з session cookie
 * Використовується в Server Components та Server Actions
 *
 * @returns UserData або null, якщо користувач не авторизований
 */
export async function getCurrentUser(): Promise<{
  user: UserData;
  uid: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return null;
    }

    // Верифікуємо session cookie
    const decodedClaims = await admin.auth().verifySessionCookie(
      sessionCookie.value,
      true, // checkRevoked
    );

    const { uid } = decodedClaims;

    // Отримуємо дані користувача з Realtime Database
    const database = admin.database();
    const userSnapshot = await database.ref(`users/${uid}`).once('value');

    if (!userSnapshot.exists()) {
      return null;
    }

    const userData = userSnapshot.val() as UserData;

    return { user: userData, uid };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Отримує UID користувача з заголовків (встановлених middleware)
 * Швидший спосіб отримання UID без додаткових запитів до Firebase
 *
 * @returns UID користувача або null
 */
export async function getUserIdFromHeaders(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get('x-user-id');
  } catch (error) {
    console.error('Get user ID from headers error:', error);
    return null;
  }
}

/**
 * Отримує email користувача з заголовків (встановлених middleware)
 *
 * @returns Email користувача або null
 */
export async function getUserEmailFromHeaders(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get('x-user-email');
  } catch (error) {
    console.error('Get user email from headers error:', error);
    return null;
  }
}

/**
 * Перевіряє, чи користувач має підтверджений email
 * Необхідно для операцій запису в bookings та favorites
 *
 * @param uid - UID користувача
 * @returns boolean - чи підтверджений email
 */
export async function isUserEmailVerified(uid: string): Promise<boolean> {
  try {
    const database = admin.database();
    const emailVerifiedSnapshot = await database
      .ref(`users/${uid}/emailVerified`)
      .once('value');

    return emailVerifiedSnapshot.val() === true;
  } catch (error) {
    console.error('Check email verification error:', error);
    return false;
  }
}

/**
 * Верифікує Bearer токен з заголовків запиту
 * Використовується в API Routes
 *
 * @param req - NextRequest об'єкт
 * @returns UID користувача
 * @throws Error якщо токен невалідний або відсутній
 */
export async function verifyApiToken(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    throw new Error('Unauthorized');
  }
}

/**
 * Обробляє помилки в API Routes
 * Повертає відповідний HTTP статус і повідомлення
 *
 * @param error - помилка
 * @param operation - назва операції для логування
 * @returns NextResponse з помилкою
 */
export function handleApiError(error: any, operation: string): NextResponse {
  console.error(`${operation} failed:`, error);

  if (error.message === 'Unauthorized') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    { message: 'Internal server error' },
    { status: 500 },
  );
}
