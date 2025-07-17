// src/lib/db/users.ts
import { db } from '@/lib/db/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

export async function getUserByEmail(email: string) {
  try {
    // Используем query для поиска по email через индекс
    const usersRef = ref(db, 'users');
    const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(emailQuery);

    if (!snapshot.exists()) return null;

    const data = snapshot.val();

    // Получаем первого (и единственного) пользователя
    const uid = Object.keys(data)[0];
    const user = data[uid];

    return {
      uid,
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      provider: user.provider,
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}
