// src/app/api/auth/change-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { oobCode, checkEmail } = await request.json();

    // Если это запрос на проверку email (без oobCode)
    if (checkEmail && !oobCode) {
      try {
        // Пытаемся найти пользователя с таким email через Admin SDK
        await admin.auth().getUserByEmail(checkEmail);

        // Если пользователь найден, email занят
        return NextResponse.json(
          {
            available: false,
            exists: true,
            error: 'Email is already in use by another account',
          },
          { status: 409 },
        );
      } catch (error: unknown) {
        // Если ошибка auth/user-not-found, то email свободен
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'auth/user-not-found'
        ) {
          return NextResponse.json({
            available: true,
            exists: false,
          });
        }

        // Для любой другой ошибки
        return NextResponse.json(
          { error: 'Error checking email availability' },
          { status: 500 },
        );
      }
    }

    // Обычная логика смены email (с oobCode)
    if (!oobCode) {
      return NextResponse.json(
        { error: 'OOB code is required' },
        { status: 400 },
      );
    }

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

    if (!response.ok) {
      let errorMessage = 'Email change failed';
      let statusCode = 400;

      if (responseData.error?.message) {
        switch (responseData.error.message) {
          case 'INVALID_OOB_CODE':
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

    const newEmail = responseData.email;

    if (!newEmail) {
      return NextResponse.json(
        { error: 'New email not found in change response' },
        { status: 400 },
      );
    }

    // Получаем пользователя по новому email через Admin SDK
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(newEmail);
    } catch {
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

    // Получаем обновленные данные пользователя
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found in database' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      newEmail: newEmail,
      user: userData,
    });
  } catch (error) {
    let errorMessage = 'Internal server error during email change process.';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
