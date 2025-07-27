// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/db/firebase-admin';
import { BookingData, CreateBookingData } from '@/lib/types/types';
import { requireAuth } from '@/lib/auth/server-auth';

// GET - с использованием индексированного запроса
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

    // Используем индексированный запрос по userId
    const snapshot = await admin
      .database()
      .ref('bookings')
      .orderByChild('userId')
      .equalTo(user.uid)
      .once('value');

    const bookingsData = snapshot.val() || {};

    const userBookings: BookingData[] = Object.entries(bookingsData).map(
      ([id, booking]: [string, any]) => ({
        id,
        ...booking,
        // Конвертируем строку обратно в Date при получении из базы
        bookingDate: new Date(booking.bookingDate),
      }),
    );

    console.log(`Found ${userBookings.length} bookings for user ${user.uid}`);
    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 },
    );
  }
}

// POST - Create a new booking
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

    // Конвертируем bookingDate из строки в Date если нужно
    const bookingData: CreateBookingData = {
      ...requestData,
      bookingDate: new Date(requestData.bookingDate),
    };

    if (bookingData.userId !== user.uid) {
      return NextResponse.json(
        { error: 'Cannot create booking for another user' },
        { status: 403 },
      );
    }

    if (
      !bookingData.userId ||
      !bookingData.teacherId ||
      !bookingData.name ||
      !bookingData.email ||
      !bookingData.phone ||
      !bookingData.reason ||
      !bookingData.bookingDate
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Подготавливаем данные для сохранения в базу
    const bookingForDatabase = {
      ...bookingData,
      // Конвертируем Date в ISO строку для сохранения в Firebase
      bookingDate: bookingData.bookingDate.toISOString(),
      createdAt: bookingData.createdAt || Date.now(),
    };

    const bookingRef = await admin
      .database()
      .ref('bookings')
      .push(bookingForDatabase);
    const bookingId = bookingRef.key;

    if (!bookingId) {
      console.error('Firebase push returned null bookingId');
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 },
      );
    }

    // Возвращаем данные с Date объектом
    const createdBooking: BookingData = {
      id: bookingId,
      ...bookingData, // Здесь bookingDate уже Date
    };

    console.log('Booking created successfully:', bookingId);
    return NextResponse.json(createdBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 },
    );
  }
}

// DELETE - Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    // Проверяем аутентификацию пользователя
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

    // Проверяем, что бронирование принадлежит текущему пользователю
    const bookingSnapshot = await admin
      .database()
      .ref(`bookings/${id}`)
      .once('value');

    if (!bookingSnapshot.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingSnapshot.val();
    if (bookingData.userId !== user.uid) {
      return NextResponse.json(
        { error: 'Cannot delete booking of another user' },
        { status: 403 },
      );
    }

    // Удаляем бронирование
    await admin.database().ref(`bookings/${id}`).remove();

    console.log('Booking deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 },
    );
  }
}
