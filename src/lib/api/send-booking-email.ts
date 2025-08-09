import type { BookingData } from '@/lib/types/types';

/**
 * Розширений тип для відправки email з даними викладача
 */
interface BookingEmailData extends BookingData {
  teacherName: string;
  teacherSurname: string;
}

/**
 * Відправка email з деталями бронювання
 */
export async function sendBookingEmail(
  booking: BookingEmailData,
): Promise<void> {
  const response = await fetch('/api/bookings/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send booking email');
  }
}
