// src/app/api/auth/change-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('--- API Email Change Request Started ---');
    const { oobCode, checkEmail } = await request.json();

    // Если это запрос на проверку email (без oobCode)
    if (checkEmail && !oobCode) {
      console.log('Checking email availability:', checkEmail);

      try {
        // Пытаемся найти пользователя с таким email через Admin SDK
        const userRecord = await admin.auth().getUserByEmail(checkEmail);

        // Если пользователь найден, email занят
        console.log('Email is already in use by user:', userRecord.uid);
        return NextResponse.json(
          {
            available: false,
            exists: true,
            error: 'Email is already in use by another account',
          },
          { status: 409 },
        );
      } catch (error: any) {
        // Если ошибка auth/user-not-found, то email свободен
        if (error.code === 'auth/user-not-found') {
          console.log('Email is available');
          return NextResponse.json({
            available: true,
            exists: false,
          });
        }

        // Для любой другой ошибки
        console.error('Error checking email:', error);
        return NextResponse.json(
          { error: 'Error checking email availability' },
          { status: 500 },
        );
      }
    }

    // Обычная логика смены email (с oobCode)
    if (!oobCode) {
      console.error('OOB code is missing from request body.');
      return NextResponse.json(
        { error: 'OOB code is required' },
        { status: 400 },
      );
    }

    console.log('Received OOB code for email change. Attempting to verify...');
    console.log('OOB code:', oobCode);
    console.log('OOB code length:', oobCode.length);

    // Используем Firebase REST API endpoint для подтверждения смены email
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobCode: oobCode,
        }),
      },
    );

    const responseData = await response.json();
    console.log('Firebase API response for email change:', responseData);

    if (!response.ok) {
      console.error('Firebase REST API error for email change:', responseData);

      let errorMessage = 'Email change failed';
      let statusCode = 400;

      if (responseData.error?.message) {
        switch (responseData.error.message) {
          case 'INVALID_OOB_CODE':
            console.log('Invalid OOB code - possibly already used');
            errorMessage =
              'This email change link has already been used or is invalid.';
            break;
          case 'EXPIRED_OOB_CODE':
            errorMessage =
              'Email change link has expired. Please request a new one.';
            break;
          case 'USER_DISABLED':
            errorMessage = 'User account is disabled';
            statusCode = 403;
            break;
          case 'EMAIL_EXISTS':
            errorMessage =
              'This email address is already in use by another account';
            statusCode = 409;
            break;
          default:
            errorMessage = responseData.error.message;
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    console.log('Email change successful via REST API');
    const newEmail = responseData.email;

    if (!newEmail) {
      console.error('No new email returned from Firebase API');
      return NextResponse.json(
        { error: 'New email not found in change response' },
        { status: 400 },
      );
    }

    // Получаем пользователя по новому email через Admin SDK
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(newEmail);
      console.log('Found user record after email change. UID:', userRecord.uid);
    } catch (error) {
      console.error('User not found by new email:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Обновляем email в Realtime Database
    const database = admin.database();
    const userRef = database.ref(`users/${userRecord.uid}`);

    const updates = {
      email: newEmail,
      emailVerified: true,
      updatedAt: Date.now(),
    };

    await userRef.update(updates);
    console.log('User email updated in database:', updates);

    // Получаем обновленные данные пользователя
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      console.error('User data not found in database');
      return NextResponse.json(
        { error: 'User data not found in database' },
        { status: 404 },
      );
    }

    console.log('--- API Email Change Request Finished Successfully ---');

    return NextResponse.json({
      success: true,
      newEmail: newEmail,
      user: userData,
    });
  } catch (error) {
    console.error('--- API Email Change Request Error ---');
    console.error('Email change error details:', error);

    let errorMessage = 'Internal server error during email change process.';

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
