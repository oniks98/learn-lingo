// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { z } from 'zod';

// Валідація для операцій з обраним
const favoriteActionSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
});

async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    throw new Error('Unauthorized');
  }
}

// GET - отримати список обраних вчителів
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);

    const db = admin.database();
    const ref = db.ref(`users/${userId}/favorites`);
    const snapshot = await ref.once('value');

    const favorites = snapshot.exists() ? snapshot.val() : {};

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error('Favorites fetch failed:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST - додати до обраного
export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    const rawData = await req.json();

    // Валідація даних
    const validationResult = favoriteActionSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    const { teacherId } = validationResult.data;

    const db = admin.database();
    const ref = db.ref(`users/${userId}/favorites`);

    await ref.update({
      [teacherId]: true,
    });

    return NextResponse.json({
      message: 'Teacher added to favorites',
      teacherId,
    });
  } catch (error: any) {
    console.error('Add to favorites failed:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE - видалити з обраного
export async function DELETE(req: NextRequest) {
  try {
    const userId = await verifyToken(req);

    const url = new URL(req.url);
    const teacherId = url.searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { message: 'Teacher ID is required' },
        { status: 400 },
      );
    }

    const db = admin.database();
    const ref = db.ref(`users/${userId}/favorites/${teacherId}`);

    // Перевіряємо, чи існує запис
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: 'Teacher not found in favorites' },
        { status: 404 },
      );
    }

    await ref.remove();

    return NextResponse.json({
      message: 'Teacher removed from favorites',
      teacherId,
    });
  } catch (error: any) {
    console.error('Remove from favorites failed:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
