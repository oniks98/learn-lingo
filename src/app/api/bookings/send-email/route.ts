// src/app/api/bookings/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { BookingData } from '@/lib/types/types';

// Розширені дані бронювання з інформацією про вчителя
interface BookingWithTeacherData extends BookingData {
  teacherName: string;
  teacherSurname: string;
}

// Відправка email підтвердження бронювання
export async function POST(request: Request) {
  try {
    const booking: BookingWithTeacherData = await request.json();

    // Налаштування SMTP транспорту
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });

    // Форматування дати та часу
    const { formattedDate, formattedTime } = formatBookingDateTime(
      booking.bookingDate,
    );

    // Відправка email
    await transporter.sendMail({
      from: process.env.SMTP_FROM!,
      to: booking.email,
      subject: 'Trial Lesson Booking Confirmation',
      text: createEmailContent(booking, formattedDate, formattedTime),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: 'Failed to send email' },
      { status: 500 },
    );
  }
}

// Блокування GET запитів
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method Not Allowed' },
    { status: 405 },
  );
}

// Форматування дати та часу для email
function formatBookingDateTime(bookingDate: Date | string) {
  const dateObj = new Date(bookingDate);

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { formattedDate, formattedTime };
}

// Створення тексту email повідомлення
function createEmailContent(
  booking: BookingWithTeacherData,
  formattedDate: string,
  formattedTime: string,
): string {
  return `
Hello ${booking.name},

Thank you for booking a trial lesson with teacher ${booking.teacherName} ${booking.teacherSurname}.

Lesson Details:
- Date: ${formattedDate}
- Time: ${formattedTime}
- Reason: ${booking.reason}
${booking.comment ? `- Additional notes: ${booking.comment}` : ''}

We will contact you at ${booking.phone} shortly to confirm this booking and provide any additional information you may need.

Best regards,
Learn Lingo Team
  `.trim();
}
