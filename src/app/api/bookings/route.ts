// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { BookingData, CreateBookingData } from '@/lib/types/types';
import { requireAuth } from '@/lib/auth/server-auth';

// Тип для данных бронирования из Firebase
interface FirebaseBookingData {
  userId: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  bookingDate: string;
  createdAt: number;
}

// Отримання бронювань користувача
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

    // Індексований запит по userId для оптимізації
    const snapshot = await admin
      .database()
      .ref('bookings')
      .orderByChild('userId')
      .equalTo(user.uid)
      .once('value');

    const bookingsData: Record<string, FirebaseBookingData> =
      snapshot.val() || {};

    // Конвертація даних з бази в потрібний формат
    const userBookings: BookingData[] = Object.entries(bookingsData).map(
      ([id, booking]) => ({
        id,
        ...booking,
        bookingDate: new Date(booking.bookingDate),
      }),
    );

    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching bookings:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 },
    );
  }
}

// Створення нового бронювання
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
    const requestData = await request.json();

    // Конвертація дати з рядка в Date об'єкт
    const bookingData: CreateBookingData = {
      ...requestData,
      bookingDate: new Date(requestData.bookingDate),
    };

    // Перевірка прав доступу
    if (bookingData.userId !== user.uid) {
      return NextResponse.json(
        { error: 'Cannot create booking for another user' },
        { status: 403 },
      );
    }

    // Валідація обов'язкових полів
    if (!validateBookingFields(bookingData)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Збереження в базі даних
    const bookingId = await saveBookingToDatabase(bookingData);
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 },
      );
    }

    const createdBooking: BookingData = {
      id: bookingId,
      ...bookingData,
    };

    return NextResponse.json(createdBooking, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating booking:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 },
    );
  }
}

// Видалення бронювання
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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 },
      );
    }

    // Перевірка існування та прав доступу до бронювання
    const isAuthorized = await checkBookingAccess(id, user.uid);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 },
      );
    }

    // Видалення бронювання з бази
    await admin.database().ref(`bookings/${id}`).remove();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting booking:', error);
    }
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 },
    );
  }
}

// Валідація обов'язкових полів бронювання
function validateBookingFields(booking: CreateBookingData): boolean {
  const required = [
    booking.userId,
    booking.teacherId,
    booking.name,
    booking.email,
    booking.phone,
    booking.reason,
    booking.bookingDate,
  ];

  return required.every((field) => field != null && field !== '');
}

// Збереження бронювання в базу даних
async function saveBookingToDatabase(
  bookingData: CreateBookingData,
): Promise<string | null> {
  const bookingForDatabase = {
    ...bookingData,
    bookingDate: bookingData.bookingDate.toISOString(),
    createdAt: bookingData.createdAt || Date.now(),
  };

  const bookingRef = await admin
    .database()
    .ref('bookings')
    .push(bookingForDatabase);

  return bookingRef.key;
}

// Перевірка доступу до бронювання
async function checkBookingAccess(
  bookingId: string,
  userId: string,
): Promise<boolean> {
  const bookingSnapshot = await admin
    .database()
    .ref(`bookings/${bookingId}`)
    .once('value');

  if (!bookingSnapshot.exists()) {
    return false;
  }

  const bookingData: FirebaseBookingData = bookingSnapshot.val();
  return bookingData.userId === userId;
}
