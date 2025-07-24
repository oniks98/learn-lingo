// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { favoriteActionSchema } from '@/lib/validation/favorites';
import { requireAuth } from '@/lib/auth/server-auth';

/**
 * GET - отримати список обраних вчителів
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);

    if ('error' in authResult) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    const db = admin.database();
    const ref = db.ref(`users/${user.uid}/favorites`);
    const snapshot = await ref.once('value');

    const favorites = snapshot.exists() ? snapshot.val() : {};

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Favorites fetch failed:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST - додати до обраного
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);

    if ('error' in authResult) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    const rawData = await req.json();

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
    const ref = db.ref(`users/${user.uid}/favorites`);

    await ref.update({
      [teacherId]: true,
    });

    return NextResponse.json({
      message: 'Teacher added to favorites',
      teacherId,
    });
  } catch (error) {
    console.error('Add to favorites failed:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * DELETE - видалити з обраного
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);

    if ('error' in authResult) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;

    const url = new URL(req.url);
    const teacherId = url.searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { message: 'Teacher ID is required' },
        { status: 400 },
      );
    }

    const db = admin.database();
    const ref = db.ref(`users/${user.uid}/favorites/${teacherId}`);

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
  } catch (error) {
    console.error('Remove from favorites failed:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
