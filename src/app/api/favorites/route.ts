// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherPreview } from '@/lib/types/types';
import { requireAuth } from '@/lib/auth/server-auth';

// Отримання всіх улюблених вчителів користувача
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
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // Отримання ID улюблених вчителів
    const favoriteTeacherIds = await getFavoriteTeacherIds(user.uid);

    if (favoriteTeacherIds.length === 0) {
      return NextResponse.json({ favorites: [] });
    }

    // Отримання повної інформації про вчителів
    const favoriteTeachers = await getFavoriteTeachersData(
      favoriteTeacherIds,
      locale,
    );

    return NextResponse.json({ favorites: favoriteTeachers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 },
    );
  }
}

// Додавання вчителя в улюблене
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

    // Перевірка існування вчителя
    const teacherExists = await checkTeacherExists(teacherId);
    if (!teacherExists) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Додавання в улюблене
    await addToFavorites(user.uid, teacherId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 },
    );
  }
}

// Видалення вчителя з улюбленого
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

    // Видалення з улюбленого
    await removeFromFavorites(user.uid, teacherId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 },
    );
  }
}

// Отримання списку ID улюблених вчителів
async function getFavoriteTeacherIds(userId: string): Promise<string[]> {
  const favoritesSnapshot = await admin
    .database()
    .ref(`users/${userId}/favorites`)
    .once('value');

  const favoritesData = favoritesSnapshot.val() || {};
  return Object.keys(favoritesData).filter(
    (teacherId) => favoritesData[teacherId] === true,
  );
}

// Отримання даних улюблених вчителів з локалізацією
async function getFavoriteTeachersData(
  favoriteTeacherIds: string[],
  locale: string,
): Promise<TeacherPreview[]> {
  const teachersSnapshot = await admin.database().ref('teachers').once('value');

  const allTeachers = teachersSnapshot.val() || {};

  return favoriteTeacherIds
    .map((teacherId) => {
      const teacher = allTeachers[teacherId];
      if (!teacher) return null;

      return flattenTeacherData(teacher, teacherId, locale);
    })
    .filter((teacher): teacher is TeacherPreview => teacher !== null);
}

// Приведення даних вчителя до плоского формату з локалізацією
function flattenTeacherData(
  teacher: any,
  teacherId: string,
  locale: string,
): TeacherPreview {
  const localizedData =
    teacher.localized?.[locale] || teacher.localized?.en || {};

  return {
    id: teacherId,
    name: teacher.name,
    surname: teacher.surname,
    languages: teacher.languages || [],
    levels: teacher.levels || [],
    rating: teacher.rating || 0,
    price_per_hour: teacher.price_per_hour || 0,
    lessons_done: teacher.lessons_done || 0,
    avatar_url: teacher.avatar_url || '',
    lesson_info: localizedData.lesson_info || '',
    conditions: localizedData.conditions || [],
  };
}

// Перевірка існування вчителя
async function checkTeacherExists(teacherId: string): Promise<boolean> {
  const teacherSnapshot = await admin
    .database()
    .ref(`teachers/${teacherId}`)
    .once('value');

  return teacherSnapshot.exists();
}

// Додавання вчителя в улюблене
async function addToFavorites(
  userId: string,
  teacherId: string,
): Promise<void> {
  await admin
    .database()
    .ref(`users/${userId}/favorites/${teacherId}`)
    .set(true);
}

// Видалення вчителя з улюбленого
async function removeFromFavorites(
  userId: string,
  teacherId: string,
): Promise<void> {
  await admin.database().ref(`users/${userId}/favorites/${teacherId}`).remove();
}
