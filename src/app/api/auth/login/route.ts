// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db/users';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Missing email or password' },
        { status: 400 },
      );
    }

    // Находим пользователя по email
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Успешная авторизация
    return NextResponse.json({
      ok: true,
      user: {
        uid: user.uid,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
