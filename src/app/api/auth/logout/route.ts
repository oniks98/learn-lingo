// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

/**
 * Обробляє POST запит для виходу користувача з системи
 * Видаляє сесійний куки та повертає статус успіху
 */
export async function POST() {
  try {
    // Створення відповіді з позитивним статусом
    const response = NextResponse.json({ success: true });

    // Видалення сесійного куки для завершення сесії
    response.cookies.delete('session');

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout error:', error);
    }

    return NextResponse.json(
      { error: 'Internal server error during logout.' },
      { status: 500 },
    );
  }
}
