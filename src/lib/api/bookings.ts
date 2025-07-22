// src/lib/api/bookings.ts
import type { BookingData } from '@/lib/types/types';

export interface CreateBookingData {
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  bookingDate: string; // Нове поле
  comment?: string; // Нове поле (опціональне)
  createdAt: number;
}

export interface BookingResponse {
  id: string;
  message: string;
}

export interface BookingsListResponse {
  bookings: BookingData[];
}

const API_BASE = '/api/bookings';

// Функция для получения ID Token из Firebase Auth
async function getIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const { auth } = await import('@/lib/db/firebase-client');
    const user = auth.currentUser;
    if (!user) return null;

    const idToken = await user.getIdToken();
    console.log('ID Token retrieved successfully');
    return idToken;
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

export async function createBooking(
  bookingData: CreateBookingData,
): Promise<BookingResponse> {
  console.log('Creating booking with data:', bookingData);

  // Получаем ID Token для заголовка Authorization
  const idToken = await getIdToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Добавляем Authorization заголовок если есть ID Token
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
    console.log('Added Authorization header with ID token');
  }

  const response = await fetch(API_BASE, {
    method: 'POST',
    credentials: 'include', // Включаем cookies
    headers,
    body: JSON.stringify(bookingData),
  });

  console.log('Response status:', response.status);
  console.log(
    'Response headers:',
    Object.fromEntries(response.headers.entries()),
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.message || 'Failed to create booking');
  }

  const result: BookingResponse = await response.json();
  console.log('Booking created successfully:', result);
  return result;
}

export async function getBookings(): Promise<BookingsListResponse> {
  console.log('Fetching bookings...');

  // Получаем ID Token для заголовка Authorization
  const idToken = await getIdToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Добавляем Authorization заголовок если есть ID Token
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
    console.log('Added Authorization header with ID token');
  }

  const response = await fetch(API_BASE, {
    method: 'GET',
    credentials: 'include', // Включаем cookies
    headers,
  });

  console.log('Get bookings response status:', response.status);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.message || 'Failed to fetch bookings');
  }

  const result = await response.json();
  console.log('Bookings fetched successfully:', result);
  return result;
}

export async function deleteBooking(
  bookingId: string,
): Promise<{ message: string }> {
  console.log('Deleting booking:', bookingId);

  // Получаем ID Token для заголовка Authorization
  const idToken = await getIdToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Добавляем Authorization заголовок если есть ID Token
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
    console.log('Added Authorization header with ID token');
  }

  const response = await fetch(`${API_BASE}?id=${bookingId}`, {
    method: 'DELETE',
    credentials: 'include', // Включаем cookies
    headers,
  });

  console.log('Delete booking response status:', response.status);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.message || 'Failed to delete booking');
  }

  const result = await response.json();
  console.log('Booking deleted successfully:', result);
  return result;
}
