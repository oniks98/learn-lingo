import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { userId, email, redirectPath } = await req.json();

    if (!userId || !email || !redirectPath) {
      return NextResponse.json(
        { ok: false, error: 'Missing data' },
        { status: 400 },
      );
    }

    // Генеруємо JWT з payload: uid, email та шляхом для редіректу
    const token = jwt.sign(
      { uid: userId, email, redirectPath },
      process.env.JWT_SECRET!,
      { expiresIn: '30m' },
    );

    const link = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;

    // Налаштовуємо SMTP‑транспортер (Brevo)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // для 587/25
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Відправляємо лист із лінком
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Підтвердження пошти',
      html: `
        <p>Натисніть, щоб підтвердити вашу пошту:</p>
        <a href="${link}">${link}</a>
        <p>Якщо це не ви, проігноруйте цей лист.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('sendConfirmationEmail error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Server error' },
      { status: 500 },
    );
  }
}
