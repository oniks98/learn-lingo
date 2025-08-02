// src/app/api/teachers/[id]/extra/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { TeacherExtraInfo } from '@/lib/types/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: teacherId } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 },
      );
    }

    // Валідація локалі
    if (!['en', 'uk'].includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale. Supported: en, uk' },
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
    const localizedData = teacher.localized?.[locale];

    if (!localizedData) {
      return NextResponse.json(
        { error: `No localized data found for locale: ${locale}` },
        { status: 404 },
      );
    }

    const extraInfo: TeacherExtraInfo = {
      experience: localizedData.experience || '',
      reviews: localizedData.reviews || [],
    };

    return NextResponse.json(extraInfo);
  } catch (error) {
    console.error('Error fetching teacher extra info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher extra info' },
      { status: 500 },
    );
  }
}
