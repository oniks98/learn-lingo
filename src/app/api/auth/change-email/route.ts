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

// Перевірка чи зайнятий email адреса
async function checkEmailAvailability(email: string) {
  try {
    await admin.auth().getUserByEmail(email);
    return NextResponse.json({ available: false }, { status: 409 });
  } catch (error: unknown) {
    if (
      error instanceof FirebaseError &&
      error.code === 'auth/user-not-found'
    ) {
      return NextResponse.json({ available: true });
    }
    throw error;
  }
}

// Зміна email користувача через oobCode
async function changeUserEmail(oobCode: string) {
  // Запит до Firebase REST API для підтвердження зміни
  const response = await fetch(
    `${FIREBASE_API_BASE}:update?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oobCode }),
    },
  );

  // Обробка помилок Firebase API
  if (!response.ok) {
    const data = await response.json();
    const message = getErrorMessage(data.error?.message);
    const status = getStatusCode(data.error?.message);
    return NextResponse.json({ error: message }, { status });
  }

  // Отримання нового email з відповіді
  const { email: newEmail } = await response.json();
  if (!newEmail) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 500 });
  }

  // Оновлення даних користувача в базі
  const userData = await updateUserInDatabase(newEmail);
  return NextResponse.json({ success: true, newEmail, user: userData });
}

// Оновлення даних користувача в Realtime Database
async function updateUserInDatabase(newEmail: string) {
  // Отримання користувача за новим email
  const userRecord = await admin.auth().getUserByEmail(newEmail);
  const userRef = admin.database().ref(`users/${userRecord.uid}`);

  // Оновлення email та статусу верифікації
  await userRef.update({
    email: newEmail,
    emailVerified: true,
    updatedAt: Date.now(),
  });

  // Повернення оновлених даних користувача
  const snapshot = await userRef.once('value');
  return snapshot.val();
}

// Мапінг кодів помилок Firebase на зрозумілі повідомлення
function getErrorMessage(code?: string): string {
  const messages: Record<string, string> = {
    INVALID_OOB_CODE: 'Link already used or invalid',
    EXPIRED_OOB_CODE: 'Link expired',
    USER_DISABLED: 'Account disabled',
    EMAIL_EXISTS: 'Email already in use',
  };
  return messages[code || ''] || 'Email change failed';
}

// Мапінг кодів помилок на HTTP статус коди
function getStatusCode(code?: string): number {
  const codes: Record<string, number> = {
    USER_DISABLED: 403,
    EMAIL_EXISTS: 409,
  };
  return codes[code || ''] || 400;
}
