// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail } from '@/lib/db/users';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const DB_SECRET = process.env.FIREBASE_DB_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Register body:', body);

    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { ok: false, error: 'Missing fields' },
        { status: 400 },
      );
    }

    console.log('Register request:', { email, name });

    // --- Перевірка: чи email вже використовується ---
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { ok: false, error: 'Email already in use' },
          { status: 400 },
        );
      }
    } catch (err) {
      console.error('Error checking email:', err);
      return NextResponse.json(
        { ok: false, error: 'Failed to check email' },
        { status: 500 },
      );
    }

    // --- Генеруємо uid та хешуємо пароль ---
    const uid = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    // --- Записуємо юзера в Realtime DB ---
    const saveUrl = `${DB_URL}/users/${uid}.json?auth=${DB_SECRET}`;
    const saveRes = await fetch(saveUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        email,
        username: name,
        passwordHash,
        createdAt: Date.now(),
        emailVerified: false,
        provider: 'password',
      }),
    });

    if (!saveRes.ok) {
      const text = await saveRes.text();
      console.error('Failed to save user:', text);
      return NextResponse.json(
        { ok: false, error: 'Failed to create user' },
        { status: 500 },
      );
    }

    // --- Успішна реєстрація ---
    return NextResponse.json({
      ok: true,
      user: {
        uid,
        email,
        name,
        sub: uid,
      },
    });
  } catch (error) {
    console.error('Unexpected error in register:', error);
    return NextResponse.json(
      { ok: false, error: 'Unexpected server error' },
      { status: 500 },
    );
  }
}
