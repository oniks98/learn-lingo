// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getLoginSession } from '@/lib/api/auth';

export async function GET() {
  try {
    const session = await getLoginSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'No session' });
    }

    return NextResponse.json({
      ok: true,
      user: {
        uid: session.sub,
        email: session.email,
        name: session.name,
        sub: session.sub,
      },
    });
  } catch (err: any) {
    console.error('Failed to get session:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
