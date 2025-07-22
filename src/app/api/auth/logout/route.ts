// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('--- API Logout Request Started ---');

    const response = NextResponse.json({ success: true });

    // Удаляем session cookie
    response.cookies.delete('session');

    console.log('Session cookie deleted.');
    console.log('--- API Logout Request Finished Successfully ---');

    return response;
  } catch (error) {
    console.error('--- API Logout Request Error ---');
    console.error('Logout error:', error);

    return NextResponse.json(
      { error: 'Internal server error during logout.' },
      { status: 500 },
    );
  }
}
