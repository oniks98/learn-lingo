// src/app/api/auth/change-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { FirebaseError } from 'firebase/app';

const FIREBASE_API_BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';

interface EmailChangeRequest {
  oobCode?: string;
  checkEmail?: string;
}

// Основний обробник API для зміни email
export async function POST(request: NextRequest) {
  try {
    const { oobCode, checkEmail }: EmailChangeRequest = await request.json();

    // Перевірка доступності email (без oobCode)
    if (checkEmail && !oobCode) {
      return await checkEmailAvailability(checkEmail);
    }

    // Валідація наявності oobCode для зміни email
    if (!oobCode) {
      return NextResponse.json({ error: 'OOB code required' }, { status: 400 });
    }

    // Виконання зміни email
    return await changeUserEmail(oobCode);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Покращена перевірка доступності email
async function checkEmailAvailability(email: string) {
  try {
    await admin.auth().getUserByEmail(email);
    // Якщо дійшли до цієї точки - користувач знайдений, email зайнятий
    return NextResponse.json(
      {
        available: false,
        message: 'Email already in use',
      },
      { status: 409 },
    );
  } catch (error: unknown) {
    if (
      error instanceof FirebaseError &&
      error.code === 'auth/user-not-found'
    ) {
      // Email вільний
      return NextResponse.json({
        available: true,
        message: 'Email is available',
      });
    }

    // Інші помилки Firebase
    console.error('Error checking email availability:', error);
    return NextResponse.json(
      {
        available: false,
        message: 'Error checking email availability',
      },
      { status: 500 },
    );
  }
}

// Решта функцій залишається без змін...
async function changeUserEmail(oobCode: string) {
  const response = await fetch(
    `${FIREBASE_API_BASE}:update?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oobCode }),
    },
  );

  if (!response.ok) {
    const data = await response.json();
    const message = getErrorMessage(data.error?.message);
    const status = getStatusCode(data.error?.message);
    return NextResponse.json({ error: message }, { status });
  }

  const { email: newEmail } = await response.json();
  if (!newEmail) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 500 });
  }

  const userData = await updateUserInDatabase(newEmail);
  return NextResponse.json({ success: true, newEmail, user: userData });
}

async function updateUserInDatabase(newEmail: string) {
  const userRecord = await admin.auth().getUserByEmail(newEmail);
  const userRef = admin.database().ref(`users/${userRecord.uid}`);

  await userRef.update({
    email: newEmail,
    emailVerified: true,
    updatedAt: Date.now(),
  });

  const snapshot = await userRef.once('value');
  return snapshot.val();
}

function getErrorMessage(code?: string): string {
  const messages: Record<string, string> = {
    INVALID_OOB_CODE: 'Link already used or invalid',
    EXPIRED_OOB_CODE: 'Link expired',
    USER_DISABLED: 'Account disabled',
    EMAIL_EXISTS: 'Email already in use',
  };
  return messages[code || ''] || 'Email change failed';
}

function getStatusCode(code?: string): number {
  const codes: Record<string, number> = {
    USER_DISABLED: 403,
    EMAIL_EXISTS: 409,
  };
  return codes[code || ''] || 400;
}
