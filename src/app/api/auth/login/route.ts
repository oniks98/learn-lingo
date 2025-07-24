// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { UserData } from '@/lib/types/types';

export async function POST(request: NextRequest) {
  try {
    console.log('--- API Login Request Started ---');
    const { idToken } = await request.json();

    if (!idToken) {
      console.error('ID token is missing from request body.');
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 },
      );
    }
    console.log('Received ID token. Attempting to verify...');

    // Верифікуємо Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log(
      'ID Token verified successfully. Decoded UID:',
      decodedToken.uid,
    );
    console.log('Decoded Token Email:', decodedToken.email);
    console.log('Decoded Token Name:', decodedToken.name);
    console.log('Decoded Token email_verified:', decodedToken.email_verified);

    const { uid, email, name, email_verified, firebase } = decodedToken;

    if (!uid) {
      console.error('UID is missing from decoded token.');
      return NextResponse.json({ error: 'UID is missing' }, { status: 400 });
    }

    if (!email) {
      console.error('Email is missing from decoded token.');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Визначаємо провайдера аутентифікації
    const provider = firebase?.sign_in_provider || 'email';
    console.log('Authentication provider:', provider);

    // Створюємо або оновлюємо дані користувача в Realtime Database
    const userData: UserData = {
      uid,
      email,
      username: name || email.split('@')[0],
      createdAt: Date.now(),
      emailVerified: email_verified ?? false,
      provider: provider === 'google.com' ? 'google' : 'email',
    };
    console.log('Constructed userData for RTDB:', userData);

    const database = admin.database();
    const userRef = database.ref(`users/${uid}`);
    console.log('Realtime Database user reference path:', `users/${uid}`);

    let finalUserData: UserData;

    // Перевіряємо, чи існує користувач вже
    console.log('Checking if user exists in Realtime Database...');
    const existingUserSnapshot = await userRef.once('value');

    if (!existingUserSnapshot.exists()) {
      // Новий користувач - створюємо запис
      console.log('User does NOT exist in RTDB. Creating new record...');
      await userRef.set(userData);
      console.log('New user record set in RTDB.');
      finalUserData = userData;
    } else {
      // Існуючий користувач - оновлюємо дані при необхідності
      console.log('User already exists in RTDB. Checking for updates...');
      const existingData = existingUserSnapshot.val();
      console.log('Existing RTDB data:', existingData);

      const updates: Partial<UserData> = {};

      // Оновлюємо emailVerified тільки якщо воно змінилося
      if (existingData.emailVerified !== email_verified) {
        updates.emailVerified = email_verified ?? false;
        console.log('Email verified status changed. Adding to updates.');
      }

      // Оновлюємо username якщо в Firebase є displayName
      if (
        name &&
        (!existingData.username ||
          (existingData.username === existingData.email?.split('@')[0] &&
            name !== existingData.username))
      ) {
        updates.username = name;
        console.log('Username needs update. Adding to updates.');
      }

      // Якщо в існуючих даних немає createdAt, додамо
      if (!existingData.createdAt && userData.createdAt) {
        updates.createdAt = userData.createdAt;
        console.log('Adding createdAt for existing user.');
      }

      // Додаємо updatedAt для відстеження останніх змін
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Date.now();
      }

      // Застосовуємо оновлення, якщо є що оновлювати
      if (Object.keys(updates).length > 0) {
        console.log('Applying updates to existing user:', updates);
        await userRef.update(updates);
        console.log('Existing user record updated in RTDB.');
        finalUserData = { ...existingData, ...updates };
      } else {
        console.log('No significant updates needed for existing user.');
        finalUserData = existingData;
      }
    }

    // Створюємо відповідь з даними користувача
    const response = NextResponse.json(finalUserData);

    // Створюємо сесійний куки ТІЛЬКИ якщо email підтверджено
    if (email_verified) {
      try {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 днів у мілісекундах
        const sessionCookie = await admin
          .auth()
          .createSessionCookie(idToken, { expiresIn });
        console.log('Session cookie created (email verified).');

        response.cookies.set('session', sessionCookie, {
          maxAge: expiresIn / 1000, // maxAge у секундах
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        console.log('Session cookie set in response.');
      } catch (cookieError) {
        console.error('Error creating session cookie:', cookieError);
        // Не перериваємо виконання, просто логуємо помилку
      }
    } else {
      console.log('Email not verified. Session cookie not created.');
      // Видаляємо старий куки, якщо він є
      response.cookies.delete('session');
    }

    console.log('--- API Login Request Finished Successfully ---');
    return response;
  } catch (error) {
    console.error('--- API Login Request Error ---');
    console.error('Login error details:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      if ('code' in error) {
        console.error('Error code:', (error as any).code);
      }
    }

    // Повертаємо 500 для неочікуваних помилок
    return NextResponse.json(
      { error: 'Internal server error during authentication process.' },
      { status: 500 },
    );
  }
}
