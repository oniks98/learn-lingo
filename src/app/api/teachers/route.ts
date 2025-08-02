// src/app/api/teachers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherPreview } from '@/lib/types/types';

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

    const snapshot = await admin.database().ref('teachers').once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ teachers: [] });
    }

    const teachersData = snapshot.val();
    const teachers: TeacherPreview[] = [];

    Object.entries(teachersData).forEach(([id, data]: [string, any]) => {
      // Перевіряємо чи є локалізовані дані
      const localizedData = data.localized?.[locale];

      if (!localizedData) {
        console.warn(
          `No localized data found for teacher ${id} in locale ${locale}`,
        );
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
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 },
    );
  }
}
