// src/app/api/verify-email/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Missing token' },
        { status: 400 },
      );
    }

    // Валідуємо JWT
    let payload: { uid: string; redirectPath: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired token' },
        { status: 400 },
      );
    }

    if (!payload.uid || !payload.redirectPath) {
      return NextResponse.json(
        { ok: false, error: 'Invalid token payload' },
        { status: 400 },
      );
    }

    // Оновлюємо через REST API з секретом
    const dbUrl = process.env.FIREBASE_DB_URL!;
    const secret = process.env.FIREBASE_DB_SECRET!;
    const url = `${dbUrl}/users/${payload.uid}/emailVerified.json?auth=${secret}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(true),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Firebase REST error:', errText);
      return NextResponse.json(
        { ok: false, error: 'Failed to update emailVerified' },
        { status: 500 },
      );
    }

    // Все успішно — редірект назад
    const destination = `${process.env.NEXTAUTH_URL}${payload.redirectPath}`;
    return NextResponse.redirect(destination);
  } catch (err: any) {
    console.error('verify-email unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
