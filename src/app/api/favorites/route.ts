// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherPreview } from '@/lib/types/types';
import { requireAuth } from '@/lib/auth/server-auth';

// GET - отримати всі улюблені вчителі користувача
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;

    // Отримуємо список ID улюблених вчителів
    const favoritesSnapshot = await admin
      .database()
      .ref(`users/${user.uid}/favorites`)
      .once('value');

    const favoritesData = favoritesSnapshot.val() || {};
    const favoriteTeacherIds = Object.keys(favoritesData).filter(
      (teacherId) => favoritesData[teacherId] === true,
    );

    if (favoriteTeacherIds.length === 0) {
      return NextResponse.json({ favorites: [] });
    }

    // Отримуємо повну інформацію про вчителів
    const teachersSnapshot = await admin
      .database()
      .ref('teachers')
      .once('value');

    const allTeachers = teachersSnapshot.val() || {};

    const favoriteTeachers: TeacherPreview[] = favoriteTeacherIds
      .map((teacherId) => {
        const teacher = allTeachers[teacherId];
        if (!teacher) return null;
        return {
          id: teacherId,
          ...teacher,
        };
      })
      .filter((teacher): teacher is TeacherPreview => teacher !== null);

    return NextResponse.json({ favorites: favoriteTeachers });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 },
    );
  }
}

// POST - додати вчителя в улюблене
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    const { teacherId } = await request.json();

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 },
      );
    }

    // Перевіряємо, що вчитель існує
    const teacherSnapshot = await admin
      .database()
      .ref(`teachers/${teacherId}`)
      .once('value');

    if (!teacherSnapshot.exists()) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Додаємо в улюблене
    await admin
      .database()
      .ref(`users/${user.uid}/favorites/${teacherId}`)
      .set(true);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 },
    );
  }
}

// DELETE - видалити вчителя з улюбленого
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { user } = authResult;
    const { teacherId } = await request.json();

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 },
      );
    }

    // Видаляємо з улюбленого
    await admin
      .database()
      .ref(`users/${user.uid}/favorites/${teacherId}`)
      .remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 },
    );
  }
}
