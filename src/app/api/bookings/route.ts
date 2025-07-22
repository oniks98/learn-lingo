// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { bookingSchema } from '@/lib/validation/booking';
import type { BookingData, CreateBookingData } from '@/lib/types/types';

/**
 * Перевірка ID токена (Authorization: Bearer ...)
 */
async function verifyToken(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    throw new Error('Unauthorized');
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
  } catch (error) {
    console.error('ID token verification failed:', error);
    throw new Error('Unauthorized');
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    const raw = await req.json();

    // Перевірка наявності teacherId
    if (typeof raw.teacherId !== 'string' || raw.teacherId.trim() === '') {
      return NextResponse.json(
        { message: 'Teacher ID is required' },
        { status: 400 },
      );
    }

    // Валідація форми
    const parsed = bookingSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: parsed.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    const { name, email, phone, reason, bookingDate, comment } = parsed.data;
    const bookingData: CreateBookingData = {
      userId,
      teacherId: raw.teacherId,
      name,
      email,
      phone,
      reason,
      bookingDate, // Нове поле
      comment, // Нове поле
      createdAt: Date.now(),
    };

    const newRef = await admin.database().ref('bookings').push(bookingData);

    return NextResponse.json({
      id: newRef.key,
      message: 'Booking created successfully',
    });
  } catch (err: any) {
    const code = err.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status: code });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);

    const snapshot = await admin
      .database()
      .ref('bookings')
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');

    const raw = snapshot.val() || {};

    const bookings: BookingData[] = Object.entries(raw).map(([id, data]) => ({
      id,
      ...(data as CreateBookingData),
    }));

    return NextResponse.json({ bookings });
  } catch (err: any) {
    const code = err.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status: code });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    const url = new URL(req.url);
    const bookingId = url.searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { message: 'Booking ID is required' },
        { status: 400 },
      );
    }

    const bookingRef = admin.database().ref(`bookings/${bookingId}`);
    const snap = await bookingRef.once('value');

    if (!snap.exists()) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 },
      );
    }

    const booking = snap.val();
    if (booking.userId !== userId) {
      return NextResponse.json(
        { message: 'Forbidden: can only delete own bookings' },
        { status: 403 },
      );
    }

    await bookingRef.remove();
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (err: any) {
    const code = err.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ message: err.message }, { status: code });
  }
}
