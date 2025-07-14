import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { setLoginSession } from '@/lib/api/auth';

const client = new OAuth2Client(
  process.env.GOOGLE_AUTH_CLIENT_ID,
  process.env.GOOGLE_AUTH_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')!;
  // state містить закодований шлях, який ми передали раніше
  const state = searchParams.get('state');
  const redirectPath = state ? decodeURIComponent(state) : '/';

  // Отримуємо токени
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Перевіряємо idToken
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_AUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload()!;

  // Розставляємо сесію та редіректимо на потрібний шлях
  const response = NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}${redirectPath}`,
  );
  await setLoginSession(response, {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  });

  return response;
}
