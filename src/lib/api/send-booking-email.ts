import type { BookingData } from '@/lib/types/types';

// Расширенный тип для отправки email с данными учителя
interface BookingEmailData extends BookingData {
  teacherName: string;
  teacherSurname: string;
}

export async function sendBookingEmail(
  booking: BookingEmailData,
): Promise<void> {
  const response = await fetch('/api/send-booking-email', {
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
