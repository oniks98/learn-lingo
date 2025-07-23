// src/lib/api/bookings.ts
import { BookingData, CreateBookingData } from '@/lib/types/types';

const API_BASE = '/api';

// Get all bookings for the current user
export async function getBookings(): Promise<{ bookings: BookingData[] }> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookings: ${response.statusText}`);
  }

  return response.json();
}

// Create a new booking
export async function createBooking(
  bookingData: CreateBookingData,
): Promise<BookingData> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create booking: ${response.statusText}`);
  }

  return response.json();
}

// Delete a booking
export async function deleteBooking(bookingId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: bookingId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete booking: ${response.statusText}`);
  }
}
