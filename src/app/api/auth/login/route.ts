// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRES_IN = '7d';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Missing credentials' },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Користувача не знайдено' },
        { status: 401 },
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { ok: false, error: 'Email не підтверджений' },
        { status: 403 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { ok: false, error: 'Невірний пароль' },
        { status: 401 },
      );
    }

    // Генеруємо JWT
    const token = jwt.sign(
      {
        email: user.email,
        name: user.username,
        uid: user.uid,
      },
      JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRES_IN,
        subject: user.uid,
      },
    );

    // Формуємо відповідь і встановлюємо куку
    const response = NextResponse.json({
      ok: true,
      user: {
        email: user.email,
        name: user.username,
        uid: user.uid,
      },
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 днів
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { ok: false, error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
