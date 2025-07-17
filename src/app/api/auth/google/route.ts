// src/app/api/auth/google/route.ts
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import { promises as fs } from 'fs';

const PATH_JSON = path.join(process.cwd(), 'google-oauth.json');
const oauthRaw = await fs.readFile(PATH_JSON, 'utf-8');
const oauthConfig = JSON.parse(oauthRaw);

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
  redirectUri: oauthConfig.web.redirect_uris[0],
});

export async function GET(req: Request) {
  // Читаємо '?redirect=' із запиту
  const { searchParams } = new URL(req.url);
  const redirect = searchParams.get('redirect') || '/';

  // Генеруємо auth URL із передачею state = наш redirect шлях
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
    state: encodeURIComponent(redirect),
  });

  return NextResponse.redirect(url);
}
