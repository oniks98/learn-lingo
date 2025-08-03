// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('--- API Email Verification Request Started ---');
    const { oobCode } = await request.json();

    if (!oobCode) {
      console.error('OOB code is missing from request body.');
      return NextResponse.json(
        { error: 'OOB code is required' },
        { status: 400 },
      );
    }

    console.log('Received OOB code. Attempting to verify email...');
    console.log('OOB code:', oobCode);
    console.log('OOB code length:', oobCode.length);

    // Используем правильный Firebase REST API endpoint для верификации email
    // oobCode сам выполняет верификацию, не нужно добавлять emailVerified: true
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
    console.log('Firebase API response:', responseData);

    if (!response.ok) {
      console.error('Firebase REST API error:', responseData);

      let errorMessage = 'Email verification failed';
      let statusCode = 400;

      if (responseData.error?.message) {
        switch (responseData.error.message) {
          case 'INVALID_OOB_CODE':
            // Возможно email уже верифицирован и код использован
            console.log('Invalid OOB code - possibly already used');
            errorMessage =
              'This verification link has already been used or is invalid.';
            break;
          case 'EXPIRED_OOB_CODE':
            errorMessage =
              'Verification link has expired. Please request a new verification email.';
            break;
          case 'USER_DISABLED':
            errorMessage = 'User account is disabled';
            statusCode = 403;
            break;
          default:
            errorMessage = responseData.error.message;
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    console.log('Email verification successful via REST API');
    const email = responseData.email;

    if (!email) {
      console.error('No email returned from Firebase API');
      return NextResponse.json(
        { error: 'Email not found in verification response' },
        { status: 400 },
      );
    }

    // Получаем пользователя по email через Admin SDK
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('Found user record. UID:', userRecord.uid);
    } catch (error) {
      console.error('User not found by email:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Обновляем статус верификации в Realtime Database
    const database = admin.database();
    const userRef = database.ref(`users/${userRecord.uid}`);

    const updates = {
      emailVerified: true,
      updatedAt: Date.now(),
    };

    await userRef.update(updates);
    console.log('User email verification status updated in database:', updates);

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

    console.log('--- API Email Verification Request Finished Successfully ---');

    return NextResponse.json({
      success: true,
      // message: 'Email verification confirmed successfully',
      email: email,
      user: userData,
    });
  } catch (error) {
    console.error('--- API Email Verification Request Error ---');
    console.error('Email verification error details:', error);

    let errorMessage =
      'Internal server error during email verification process.';

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
