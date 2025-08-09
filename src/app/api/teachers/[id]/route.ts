// src/app/api/teachers/[id]/route.ts
import { NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherInfoModal } from '@/lib/types/types';

/**
 * Отримання інформації про викладача
 * GET /api/teachers/[id]
 */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: teacherId } = await params;

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 },
      );
    }

    // Отримання даних викладача з бази даних
    const snapshot = await admin
      .database()
      .ref(`teachers/${teacherId}`)
      .once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const teacher = snapshot.val();

    // Формування інформації про викладача
    const teacherInfo: TeacherInfoModal = {
      id: teacherId,
      name: teacher.name || '',
      surname: teacher.surname || '',
      avatar_url: teacher.avatar_url || '',
    };

    return NextResponse.json(teacherInfo);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Помилка отримання інформації про викладача:', error);
    }

    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
