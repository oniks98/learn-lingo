// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';

const FIREBASE_API_BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';

interface VerifyEmailRequest {
  oobCode: string;
}

// Основний обробник API для верифікації email
export async function POST(request: NextRequest) {
  try {
    const { oobCode }: VerifyEmailRequest = await request.json();

    // Валідація наявності oobCode
    if (!oobCode) {
      return NextResponse.json({ error: 'OOB code required' }, { status: 400 });
    }

    // Виконання верифікації email
    return await verifyUserEmail(oobCode);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Верифікація email користувача через oobCode
async function verifyUserEmail(oobCode: string) {
  // Запит до Firebase REST API для підтвердження email
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

  // Отримання email з відповіді
  const { email } = await response.json();
  if (!email) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 500 });
  }

  // Оновлення статусу верифікації в базі
  const userData = await updateVerificationStatus(email);
  return NextResponse.json({ success: true, email, user: userData });
}

// Оновлення статусу верифікації в Realtime Database
async function updateVerificationStatus(email: string) {
  // Отримання користувача за email
  const userRecord = await admin.auth().getUserByEmail(email);
  const userRef = admin.database().ref(`users/${userRecord.uid}`);

  // Оновлення статусу верифікації
  await userRef.update({
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
    INVALID_OOB_CODE: 'Verification link already used or invalid',
    EXPIRED_OOB_CODE: 'Verification link expired',
    USER_DISABLED: 'Account disabled',
  };
  return messages[code || ''] || 'Email verification failed';
}

// Мапінг кодів помилок на HTTP статус коди
function getStatusCode(code?: string): number {
  const codes: Record<string, number> = {
    USER_DISABLED: 403,
  };
  return codes[code || ''] || 400;
}
