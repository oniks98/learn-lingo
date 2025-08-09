// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { UserData } from '@/lib/types/types';
import { FirebaseError } from 'firebase-admin/app';

/**
 * Обробляє POST запит для автентифікації користувача через Firebase ID Token
 * Створює або оновлює дані користувача в Realtime Database
 * Встановлює сесійний куки для підтверджених користувачів
 * Включає обробку expired та revoked токенів
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    // Валідація наявності ID токена
    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 },
      );
    }

    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(idToken, true);
    } catch (error: unknown) {
      const tokenError = error as FirebaseError;

      // Обробка специфічних помилок токена
      if (tokenError.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }

      if (tokenError.code === 'auth/id-token-revoked') {
        return NextResponse.json({ error: 'Token revoked' }, { status: 401 });
      }

      if (tokenError.code === 'auth/argument-error') {
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 400 },
        );
      }

      // Логування помилки тільки в development режимі
      if (process.env.NODE_ENV === 'development') {
        console.error('Token verification error:', tokenError);
      }

      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { uid, email, name, email_verified, firebase } = decodedToken;

    // Валідація обов'язкових полів
    if (!uid) {
      return NextResponse.json({ error: 'UID is missing' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Визначення провайдера автентифікації
    const provider = firebase?.sign_in_provider || 'email';

    // Підготовка даних користувача для збереження
    const userData: UserData = {
      uid,
      email,
      username: name || email.split('@')[0],
      createdAt: Date.now(),
      emailVerified: email_verified ?? false,
      provider: provider === 'google.com' ? 'google' : 'email',
    };

    // Ініціалізація з'єднання з Realtime Database
    const database = admin.database();
    const userRef = database.ref(`users/${uid}`);

    let finalUserData: UserData;

    try {
      // Перевірка існування користувача в базі даних
      const existingUserSnapshot = await userRef.once('value');

      if (!existingUserSnapshot.exists()) {
        // Створення нового користувача
        await userRef.set(userData);
        finalUserData = userData;
      } else {
        // Оновлення існуючого користувача
        const existingData = existingUserSnapshot.val();
        const updates: Partial<UserData> = {};

        // Оновлення статусу підтвердження email
        if (existingData.emailVerified !== email_verified) {
          updates.emailVerified = email_verified ?? false;
        }

        // Оновлення username якщо є displayName від провайдера
        if (
          name &&
          (!existingData.username ||
            (existingData.username === existingData.email?.split('@')[0] &&
              name !== existingData.username))
        ) {
          updates.username = name;
        }

        // Додавання createdAt для старих записів без цього поля
        if (!existingData.createdAt && userData.createdAt) {
          updates.createdAt = userData.createdAt;
        }

        // Встановлення часу останнього оновлення
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = Date.now();
          await userRef.update(updates);
          finalUserData = { ...existingData, ...updates };
        } else {
          finalUserData = existingData;
        }
      }
    } catch (databaseError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Database operation error:', databaseError);
      }

      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 },
      );
    }

    // Створення відповіді з даними користувача
    const response = NextResponse.json(finalUserData);

    // Створення сесійного куки для підтверджених користувачів
    if (email_verified) {
      try {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 днів у мілісекундах
        const sessionCookie = await admin
          .auth()
          .createSessionCookie(idToken, { expiresIn });

        // Встановлення куки з відповідними параметрами безпеки
        response.cookies.set('session', sessionCookie, {
          maxAge: expiresIn / 1000, // maxAge у секундах
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      } catch (error: unknown) {
        const cookieError = error as FirebaseError;

        // Обробка специфічних помилок створення куки
        if (cookieError.code === 'auth/id-token-expired') {
          return NextResponse.json(
            { error: 'Token expired during session creation' },
            { status: 401 },
          );
        }

        // Логування помилки тільки в development режимі
        if (process.env.NODE_ENV === 'development') {
          console.error('Error creating session cookie:', cookieError);
        }

        // Продовжуємо виконання без переривання, але без куки
        // Це дозволить користувачу працювати з Firebase токенами
      }
    } else {
      // Видалення старого куки для неверифікованих користувачів
      response.cookies.delete('session');
    }

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }

    // Повернення загальної помилки без деталей для production
    return NextResponse.json(
      { error: 'Internal server error during authentication process.' },
      { status: 500 },
    );
  }
}
