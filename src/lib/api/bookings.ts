import { db } from '@/lib/utils/firebase';
import { ref, push, set } from 'firebase/database';

export interface BookingData {
  teacherId: string;
  teacherName: string;
  teacherSurname: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  createdAt: number;
}

export async function createBooking(data: BookingData): Promise<string> {
  const bookingRef = push(ref(db, 'bookings'));
  await set(bookingRef, data);
  return bookingRef.key!;
}
