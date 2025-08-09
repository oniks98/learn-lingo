// src/app/api/teachers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherPreview, FirebaseTeacherData } from '@/lib/types/types';

/**
 * Отримання списку викладачів з локалізацією
 * GET /api/teachers?locale=en|uk
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // Валідація локалі
    if (!['en', 'uk'].includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale. Supported: en, uk' },
        { status: 400 },
      );
    }

    // Отримання даних викладачів з бази даних
    const snapshot = await admin.database().ref('teachers').once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ teachers: [] });
    }

    const teachersData = snapshot.val() as Record<string, FirebaseTeacherData>;
    const teachers: TeacherPreview[] = [];

    // Обробка кожного викладача з локалізацією
    Object.entries(teachersData).forEach(([id, data]) => {
      const localizedData = data.localized?.[locale as 'en' | 'uk'];

      if (!localizedData) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `Відсутні локалізовані дані для викладача ${id} в локалі ${locale}`,
          );
        }
        return;
      }

      const teacher: TeacherPreview = {
        id,
        name: data.name || '',
        surname: data.surname || '',
        languages: data.languages || [],
        levels: data.levels || [],
        rating: data.rating || 0,
        price_per_hour: data.price_per_hour || 0,
        lessons_done: data.lessons_done || 0,
        avatar_url: data.avatar_url || '',
        lesson_info: localizedData.lesson_info || '',
        conditions: localizedData.conditions || [],
      };

      teachers.push(teacher);
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Помилка отримання списку викладачів:', error);
    }

    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
