import { db } from '@/lib/db/firebase'; // твой инициализированный firebase app
import { ref, get } from 'firebase/database';

export async function getUserByEmail(email: string) {
  const snapshot = await get(ref(db, 'users'));

  if (!snapshot.exists()) return null;

  const data = snapshot.val();

  for (const uid in data) {
    const user = data[uid];
    if (user.email === email) {
      return {
        uid,
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        emailVerified: user.emailVerified,
        provider: user.provider,
      };
    }
  }

  return null;
}
