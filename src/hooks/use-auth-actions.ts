// src/hooks/use-auth-actions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  reload,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { UserData } from '@/lib/types/types';
import { useSendVerificationEmail } from '@/hooks/use-send-verification-email';
import { toast } from 'sonner';

// Додаємо новий тип для результату логіна
export interface SignInResult extends UserData {
  needsEmailVerification?: boolean;
}

/**
 * Перетворює Firebase User в UserData
 */
const convertFirebaseUserToUserData = (
  firebaseUser: FirebaseUser,
): UserData => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  username:
    firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  emailVerified: firebaseUser.emailVerified,
  provider: firebaseUser.providerData[0]?.providerId.includes('google')
    ? 'google'
    : 'email',
  createdAt: Date.now(),
  photoURL: firebaseUser.photoURL || undefined,
});

/**
 * Відправляє дані користувача на сервер для синхронізації з базою даних
 */
const syncUserWithServer = async (
  firebaseUser: FirebaseUser,
): Promise<UserData> => {
  try {
    console.log('Syncing user data with server...');
    const idToken = await firebaseUser.getIdToken(true);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      console.error('Failed to sync user data with server:', response.status);
      // вместо throw – сразу возвращаем локальные данные
      return convertFirebaseUserToUserData(firebaseUser);
    }

    const userData = await response.json();
    console.log('User data synced successfully:', userData);
    return userData;
  } catch (error) {
    console.error('Error syncing user data:', error);
    // при любых ошибках (сеть, парсинг и т.п.) возвращаем локальные данные
    return convertFirebaseUserToUserData(firebaseUser);
  }
};

/**
 * Hook для реєстрації з email та паролем
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();
  const sendVerification = useSendVerificationEmail();

  return useMutation<
    UserData,
    any,
    { email: string; password: string; name: string }
  >({
    mutationFn: async ({ email, password, name }) => {
      console.log('Starting email/password registration...');
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log('User created, updating profile...');
      await updateProfile(userCred.user, { displayName: name });
      console.log('Sending email verification...');
      await sendVerification.mutateAsync();
      await reload(userCred.user);
      const userData = await syncUserWithServer(userCred.user);
      console.log('Registration successful:', userData);
      return userData;
    },
    onSuccess: (userData) => {
      // Оновлюємо кеш React Query
      queryClient.setQueryData(['user'], userData);
      toast.success(
        `Вітаємо, ${userData.username}! Перевірте пошту для підтвердження акаунту.`,
      );
    },
    onError: (error) => {
      console.error('Sign up error:', error);
      // Деталізовані повідомлення
      let msg = 'Помилка реєстрації. Спробуйте ще раз.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Ця електронна пошта вже використовується.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Пароль занадто слабкий. Мінімум 6 символів.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Неправильний формат електронної пошти.';
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    },
  });
};

/**
 * Hook для входу з email та паролем
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation<SignInResult, any, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      console.log('Starting email/password sign in...');
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await reload(userCred.user);
      const userData = await syncUserWithServer(userCred.user);
      console.log('Sign in successful:', userData);

      // Перевіряємо, чи email верифіковано
      if (!userData.emailVerified) {
        console.log('Email not verified, returning with flag');
        return { ...userData, needsEmailVerification: true };
      }

      return userData;
    },
    onSuccess: (result) => {
      // Якщо потрібна верифікація email, не оновлюємо кеш і не показуємо success
      if (result.needsEmailVerification) {
        console.log('User needs email verification, skipping cache update');
        return;
      }

      // Оновлюємо кеш React Query тільки для повністю верифікованих користувачів
      queryClient.setQueryData(['user'], result);
      toast.success(`Вітаємо знову, ${result.username}!`);
    },
    onError: (error) => {
      console.error('Sign in error:', error);
      // Деталізовані повідомлення
      let msg = 'Помилка входу. Спробуйте ще раз.';
      if (error.code === 'auth/invalid-credential') {
        msg =
          'Неправильна пошта або пароль. Перевірте дані та спробуйте ще раз.';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'Користувача з такою поштою не знайдено.';
      } else if (error.code === 'auth/wrong-password') {
        msg = 'Неправильний пароль.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Неправильний формат електронної пошти.';
      } else if (error.code === 'auth/user-disabled') {
        msg = 'Цей акаунт заблоковано.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Забагато спроб входу. Спробуйте пізніше.';
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    },
  });
};

/**
 * Hook для входу через Google OAuth
 */
export const useSignInWithGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation<UserData, any, { redirectPath?: string }>({
    mutationFn: async ({ redirectPath }) => {
      console.log('Starting Google sign in...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const userCred = await signInWithPopup(auth, provider);
      const userData = await syncUserWithServer(userCred.user);
      console.log('Google sign in successful:', userData);
      if (redirectPath) window.location.href = redirectPath;
      return userData;
    },
    onSuccess: (userData) => {
      // Оновлюємо кеш React Query
      queryClient.setQueryData(['user'], userData);
      toast.success('Успішний вхід через Google!');
    },
    onError: (error) => {
      console.error('Google sign in error:', error);
      // Деталізовані повідомлення
      let msg = 'Помилка входу через Google. Спробуйте ще раз.';
      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Вхід через Google було скасовано.';
      } else if (error.code === 'auth/popup-blocked') {
        msg = 'Спливаюче вікно заблоковано браузером.';
      } else if (
        error.code === 'auth/account-exists-with-different-credential'
      ) {
        msg = 'Акаунт з цією поштою існує з іншим способом входу.';
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    },
  });
};
