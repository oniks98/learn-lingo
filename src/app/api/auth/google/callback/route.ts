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
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_AUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload()!;

  const baseUrl = process.env.NEXTAUTH_URL!;
  const response = NextResponse.redirect(`${baseUrl}/`);

  await setLoginSession(response, {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  });
  return response;
}
