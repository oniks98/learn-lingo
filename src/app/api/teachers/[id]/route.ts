// src/app/api/teachers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherInfoModal } from '@/lib/types/types';

export async function GET(
  request: NextRequest,
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

    const snapshot = await admin
      .database()
      .ref(`teachers/${teacherId}`)
      .once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const teacher = snapshot.val();

    const teacherInfo: TeacherInfoModal = {
      id: teacherId,
      name: teacher.name || '',
      surname: teacher.surname || '',
      avatar_url: teacher.avatar_url || '',
    };

    return NextResponse.json(teacherInfo);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher' },
      { status: 500 },
    );
  }
}
