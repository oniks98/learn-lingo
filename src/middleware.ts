// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware для захисту маршрутів
 * Перевіряє лише наявність session cookie.
 * Повна верифікація session cookie та отримання даних користувача
 * відбувається на сервері у getServerSideProps або Server Components.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Список захищених маршрутів
  const protectedRoutes = ['/profile', '/bookings', '/favorites'];

  // Перевіряємо, чи поточний маршрут захищений
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Якщо маршрут не захищений, пропускаємо middleware
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Отримуємо session cookie
  const sessionCookie = request.cookies.get('session');

  // Якщо немає session cookie - перенаправляємо на login
  if (!sessionCookie) {
    console.log('Middleware: Сесійна кука відсутня, перенаправляю на /login.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Якщо session cookie присутня, middleware дозволяє запиту продовжитись.
  // ПОЛНА ВЕРИФІКАЦІЯ БУДЕ ЗДІЙСНЕНА НА СТОРІНЦІ (У getServerSideProps / Server Component).
  console.log('Middleware: Сесійна кука знайдена, дозволяю запиту продовжити.');
  return NextResponse.next();
}

/**
 * Конфігурація middleware - визначає, на яких маршрутах він працює
 * Виключаємо статичні файли, API routes, favicon, а також сторінки логіну/реєстрації
 */
export const config = {
  matcher: [
    // Матчимо всі шляхи, окрім тих, що починаються з:
    // - /api (API routes)
    // - _next/static (статичні файли Next.js)
    // - _next/image (файли оптимізації зображень Next.js)
    // - favicon.ico (фавікон)
    // - login (сторінка входу)
    // - signup (сторінка реєстрації)
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};
