// src/app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherPreview } from '@/lib/types/types';

// GET - Get all teachers (preview data only)
export async function GET() {
  try {
    const snapshot = await admin.database().ref('teachers').once('value');
    const teachersData = snapshot.val();

    if (!teachersData) {
      return NextResponse.json({ teachers: [] });
    }

    const teachers: TeacherPreview[] = Object.entries(teachersData).map(
      ([id, teacher]: [string, any]) => ({
        id,
        name: teacher.name,
        surname: teacher.surname,
        languages: teacher.languages || [],
        levels: teacher.levels || [],
        rating: teacher.rating || 0,
        price_per_hour: teacher.price_per_hour || 0,
        lessons_done: teacher.lessons_done || 0,
        avatar_url: teacher.avatar_url || '',
        lesson_info: teacher.lesson_info || '',
        conditions: teacher.conditions || [],
      }),
    );

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 },
    );
  }
}
