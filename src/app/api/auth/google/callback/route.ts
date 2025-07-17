// src/app/api/auth/google/callback/route.ts
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { setLoginSession, isEmailTaken } from '@/lib/api/auth';

// Получает базовый URL (в dev или production)
const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Инициализация клиента OAuth
const client = new OAuth2Client(
  process.env.GOOGLE_AUTH_CLIENT_ID,
  process.env.GOOGLE_AUTH_CLIENT_SECRET,
  `${getBaseUrl()}/api/auth/google/callback`,
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const redirectPath = state ? decodeURIComponent(state) : '/';

  if (!code) {
    return NextResponse.redirect(
      `${getBaseUrl()}${redirectPath}?error=missing_token`,
    );
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_AUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      return NextResponse.redirect(
        `${getBaseUrl()}${redirectPath}?error=invalid_payload`,
      );
    }

    const uid = payload.sub;
    const email = payload.email;
    const name = payload.name ?? 'Unknown';

    // ✅ Проверка, есть ли уже такой email в системе (даже если другой uid)
    const emailTaken = await isEmailTaken(email);
    if (emailTaken) {
      console.log('⛔ Email already taken (duplicate manual account)');
      return NextResponse.redirect(`${getBaseUrl()}/signup?error=user_exists`);
    }

    // ✅ Проверка, есть ли уже такой uid
    const dbUrl = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/users/${uid}.json?auth=${process.env.FIREBASE_DB_SECRET}`;
    const checkRes = await fetch(dbUrl);
    const exists = await checkRes.json();

    if (exists !== null) {
      console.log('⛔ User already exists by uid');
      return NextResponse.redirect(
        `${getBaseUrl()}${redirectPath}?error=user_exists`,
      );
    }

    // ✅ Создание пользователя
    console.log('⏎ Creating new user in Firebase DB:', uid);
    await fetch(dbUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username: name,
        createdAt: Date.now(),
        favorites: [],
        emailVerified: true,
        provider: 'google',
      }),
    });

    const response = NextResponse.redirect(`${getBaseUrl()}${redirectPath}`);
    await setLoginSession(response, {
      email,
      name,
      sub: uid,
      picture: payload.picture,
    });

    return response;
  } catch (err) {
    console.error('🔴 Google Auth Error:', err);
    return NextResponse.redirect(
      `${getBaseUrl()}${redirectPath}?error=google_auth_failed`,
    );
  }
}
