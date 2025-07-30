// src/app/api/send-booking-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { BookingData } from '@/lib/types/types';

// Расширяем BookingData для передачи имени учителя
interface BookingWithTeacherData extends BookingData {
  teacherName: string;
  teacherSurname: string;
}

export async function POST(request: Request) {
  try {
    const booking: BookingWithTeacherData = await request.json();

    console.log('Processing booking with teacher data:', {
      teacherId: booking.teacherId,
      teacherName: booking.teacherName,
      teacherSurname: booking.teacherSurname,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });

    // Форматируем дату для письма
    const bookingDateTime = new Date(booking.bookingDate);
    const formattedDate = bookingDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = bookingDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM!,
      to: booking.email,
      subject: 'Trial Lesson Booking Confirmation',
      text: `
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
      `.trim(),
    });

    console.log('Email sent successfully to:', booking.email);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Send email failed:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method Not Allowed' },
    { status: 405 },
  );
}
