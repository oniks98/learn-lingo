// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { favoriteActionSchema } from '@/lib/validation/favorites';
import { verifyApiToken, handleApiError } from '@/lib/auth/server';

// GET - отримати список обраних вчителів
export async function getFavorites(req: NextRequest) {
  try {
    const userId = await verifyApiToken(req);

    const db = admin.database();
    const ref = db.ref(`users/${userId}/favorites`);
    const snapshot = await ref.once('value');

    const favorites = snapshot.exists() ? snapshot.val() : {};

    return NextResponse.json({ favorites });
  } catch (error: any) {
    return handleApiError(error, 'Favorites fetch');
  }
}

// POST - додати до обраного
export async function addToFavorites(req: NextRequest) {
  try {
    const userId = await verifyApiToken(req);
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
    return handleApiError(error, 'Add to favorites');
  }
}

// DELETE - видалити з обраного
export async function removeFromFavorites(req: NextRequest) {
  try {
    const userId = await verifyApiToken(req);

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
    return handleApiError(error, 'Remove from favorites');
  }
}
