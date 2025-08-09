import { NextRequest } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { UserData } from '@/lib/types/types';

interface FirebaseAuthError extends Error {
  code: string;
}

/**
 * Витягає та верифікує користувача з session cookie
 * Використовується в API маршрутах для отримання поточного користувача
 * Включає обробку expired та revoked session cookies
 */
export async function getCurrentUserFromRequest(
  request: NextRequest,
): Promise<UserData | null> {
  try {
    // Отримання session cookie з запиту
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    let decodedClaims;

    try {
      // Верифікація session cookie через Firebase Admin SDK з перевіркою на revoked
      decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);
    } catch (cookieError) {
      const error = cookieError as FirebaseAuthError;

      // Обробка специфічних помилок session cookie
      if (error.code === 'auth/session-cookie-expired') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Session cookie expired');
        }
        return null;
      }

      if (error.code === 'auth/session-cookie-revoked') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Session cookie revoked');
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('Session cookie verification error:', error);
      }
      return null;
    }

    if (!decodedClaims) {
      return null;
    }

    const { uid } = decodedClaims;

    // Отримання даних користувача з Realtime Database
    const userSnapshot = await admin
      .database()
      .ref(`users/${uid}`)
      .once('value');

    if (!userSnapshot.exists()) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('User data not found in database for UID:', uid);
      }
      return null;
    }

    const userData = userSnapshot.val() as UserData;

    // Перевірка статусу верифікації email
    if (!userData.emailVerified) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('User email not verified:', userData.email);
      }
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('User authenticated successfully:', userData.uid);
    }

    return userData;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error verifying session:', error);
    }
    return null;
  }
}

/**
 * Middleware для API маршрутів, що вимагають автентифікації
 * Перевіряє авторизацію та статус верифікації email користувача
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
