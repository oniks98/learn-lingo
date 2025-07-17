// src/lib/api/auth.ts

import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const TOKEN_NAME = 'app_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 1 week
const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const DB_SECRET = process.env.FIREBASE_DB_SECRET!;

// Проверка, существует ли пользователь с таким email
export async function isEmailTaken(email: string): Promise<boolean> {
  const orderByValue = encodeURIComponent('"email"'); // кавычки вокруг email
  const emailToQuery = encodeURIComponent(`"${email}"`); // кавычки вокруг значения email

  const url = `${DB_URL}/users.json?auth=${DB_SECRET}&orderBy=${orderByValue}&equalTo=${emailToQuery}`;

  const res = await fetch(url);
  const data = await res.json();

  console.log('isEmailTaken:', { email, data });

  return data && Object.keys(data).length > 0;
}

// Создание JWT-сессии
export async function setLoginSession(
  res: NextResponse,
  session: JWTPayload,
): Promise<NextResponse> {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

  res.cookies.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    maxAge: MAX_AGE,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res;
}

export async function getLoginSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const cookie = (await cookieStore).get(TOKEN_NAME)?.value;
  if (!cookie) return null;
  const { payload } = await jwtVerify(
    cookie,
    new TextEncoder().encode(process.env.JWT_SECRET!),
  );
  return payload;
}
