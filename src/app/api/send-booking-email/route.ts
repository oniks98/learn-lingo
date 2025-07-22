// src/app/api/send-booking-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { BookingData } from '@/lib/types/types';

// Дополняем данными преподавателя для письма
interface SendBookingEmailPayload extends BookingData {
  teacherName: string;
  teacherSurname: string;
}

export async function POST(request: Request) {
  try {
    const booking: SendBookingEmailPayload = await request.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM!,
      to: booking.email,
      subject: 'Trial Lesson Booking Confirmation',
      text: `
Hello ${booking.name},

Thank you for booking a trial lesson with teacher ${booking.teacherName} ${booking.teacherSurname}.

We will contact you at ${booking.phone} to confirm the date and time.

Reason for the lesson: ${booking.reason}
      `.trim(),
    });

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
