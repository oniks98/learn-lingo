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

    // ✅ Проверяем, есть ли email в системе (по всем провайдерам)
    const emailTaken = await isEmailTaken(email);

    if (emailTaken) {
      // Проверяем, какой провайдер использовался
      const dbUrl = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/users.json?auth=${process.env.FIREBASE_DB_SECRET}&orderBy="email"&equalTo="${email}"`;
      const checkRes = await fetch(dbUrl);
      const usersData = await checkRes.json();

      if (usersData) {
        const existingUser = Object.values(usersData)[0] as any;

        if (existingUser.provider === 'password') {
          // Email занят ручной регистрацией - показываем ошибку
          console.log('⛔ Email already taken by manual registration');
          return NextResponse.redirect(
            `${getBaseUrl()}/signup?error=user_exists`,
          );
        }

        if (existingUser.provider === 'google') {
          // Email занят предыдущей Google-регистрацией - логиним молча
          console.log('✅ User exists with Google provider, logging in');
          const response = NextResponse.redirect(
            `${getBaseUrl()}${redirectPath}`,
          );
          await setLoginSession(response, {
            email,
            name,
            sub: uid,
            picture: payload.picture,
          });
          return response;
        }
      }
    }

    // ✅ Email свободен - создаем нового пользователя
    console.log('⏎ Creating new user in Firebase DB:', uid);
    const dbUrl = `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/users/${uid}.json?auth=${process.env.FIREBASE_DB_SECRET}`;

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

    // Логиним и редиректим на страницу откуда была регистрация
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
