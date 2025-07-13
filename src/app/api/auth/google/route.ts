import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// Read OAuth config from JSON
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

export async function GET() {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
  return NextResponse.redirect(url);
}
