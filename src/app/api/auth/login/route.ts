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

    // Определяем провайдера аутентификации
    const provider = firebase?.sign_in_provider || 'email';
    console.log('Authentication provider:', provider);

    // Создаем или обновляем данные пользователя в Realtime Database
    const userData: UserData = {
      uid,
      email,
      username: name || email.split('@')[0],
      createdAt: Date.now(),
      emailVerified: email_verified ?? false, // Исправляем TypeScript ошибку
      provider: provider === 'google.com' ? 'google' : 'email',
    };
    console.log('Constructed userData for RTDB:', userData);

    const database = admin.database();
    const userRef = database.ref(`users/${uid}`);
    console.log('Realtime Database user reference path:', `users/${uid}`);

    let finalUserData: UserData;

    // Проверяем, существует ли пользователь уже
    console.log('Checking if user exists in Realtime Database...');
    const existingUserSnapshot = await userRef.once('value');

    if (!existingUserSnapshot.exists()) {
      // Новый пользователь - создаем запись
      console.log('User does NOT exist in RTDB. Creating new record...');
      await userRef.set(userData);
      console.log('New user record set in RTDB.');
      finalUserData = userData;
    } else {
      // Существующий пользователь - обновляем данные при необходимости
      console.log('User already exists in RTDB. Checking for updates...');
      const existingData = existingUserSnapshot.val();
      console.log('Existing RTDB data:', existingData);

      const updates: Partial<UserData> = {};

      // Обновляем emailVerified только если оно изменилось
      if (existingData.emailVerified !== email_verified) {
        updates.emailVerified = email_verified ?? false;
        console.log('Email verified status changed. Adding to updates.');
      }

      // Обновляем username если в Firebase есть displayName
      if (
        name &&
        (!existingData.username ||
          (existingData.username === existingData.email?.split('@')[0] &&
            name !== existingData.username))
      ) {
        updates.username = name;
        console.log('Username needs update. Adding to updates.');
      }

      // Если в существующих данных нет createdAt, добавим
      if (!existingData.createdAt && userData.createdAt) {
        updates.createdAt = userData.createdAt;
        console.log('Adding createdAt for existing user.');
      }

      // Применяем обновления, если есть что обновлять
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

    // Создаем ответ с данными пользователя
    const response = NextResponse.json(finalUserData);

    // Создаем сессионный куки ТОЛЬКО если email подтвержден
    if (email_verified) {
      try {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 дней в миллисекундах
        const sessionCookie = await admin
          .auth()
          .createSessionCookie(idToken, { expiresIn });
        console.log('Session cookie created (email verified).');

        response.cookies.set('session', sessionCookie, {
          maxAge: expiresIn / 1000, // maxAge в секундах
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        console.log('Session cookie set in response.');
      } catch (cookieError) {
        console.error('Error creating session cookie:', cookieError);
        // Не прерываем выполнение, просто логируем ошибку
      }
    } else {
      console.log('Email not verified. Session cookie not created.');
      // Удаляем старый куки, если он есть
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

    // Возвращаем 500 для неожиданных ошибок
    return NextResponse.json(
      { error: 'Internal server error during authentication process.' },
      { status: 500 },
    );
  }
}
