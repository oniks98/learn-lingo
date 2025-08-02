// // src/app/api/auth/register/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { admin } from '@/lib/db/firebase-admin';
// import { UserData } from '@/lib/types/types';
//
// export async function POST(request: NextRequest) {
//   try {
//     console.log('--- API Register Request Started ---');
//     const { idToken } = await request.json();
//
//     if (!idToken) {
//       console.error('ID token is missing from request body.');
//       return NextResponse.json(
//         { error: 'ID token is required' },
//         { status: 400 },
//       );
//     }
//
//     // Верифікуємо Firebase ID Token
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const { uid, email, name, email_verified, firebase } = decodedToken;
//
//     if (!uid || !email) {
//       return NextResponse.json(
//         { error: 'UID and email are required' },
//         { status: 400 },
//       );
//     }
//
//     // Визначаємо провайдера аутентифікації
//     const provider = firebase?.sign_in_provider || 'email';
//
//     const userData: UserData = {
//       uid,
//       email,
//       username: name || email.split('@')[0],
//       createdAt: Date.now(),
//       emailVerified: email_verified ?? false,
//       provider: provider === 'google.com' ? 'google' : 'email',
//     };
//
//     const database = admin.database();
//     const userRef = database.ref(`users/${uid}`);
//
//     // Перевіряємо, чи користувач вже існує
//     const existingUserSnapshot = await userRef.once('value');
//
//     if (existingUserSnapshot.exists()) {
//       console.log('User already exists, redirecting to login');
//       return NextResponse.json(
//         { error: 'User already exists. Please use login instead.' },
//         { status: 409 },
//       );
//     }
//
//     // Створюємо нового користувача
//     await userRef.set(userData);
//     console.log('New user registered successfully');
//
//     // Створюємо сесійний куки тільки для верифікованих email
//     const response = NextResponse.json(userData);
//
//     if (email_verified) {
//       try {
//         const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 днів
//         const sessionCookie = await admin
//           .auth()
//           .createSessionCookie(idToken, { expiresIn });
//
//         response.cookies.set('session', sessionCookie, {
//           maxAge: expiresIn / 1000,
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'lax',
//           path: '/',
//         });
//       } catch (cookieError) {
//         console.error('Error creating session cookie:', cookieError);
//       }
//     }
//
//     return response;
//   } catch (error) {
//     console.error('Register error:', error);
//
//     // Исправление: убираем избыточную проверку instanceof
//     if (error && typeof error === 'object' && 'code' in error) {
//       console.error('Error code:', (error as any).code);
//     }
//
//     return NextResponse.json(
//       { error: 'Internal server error during registration.' },
//       { status: 500 },
//     );
//   }
// }
