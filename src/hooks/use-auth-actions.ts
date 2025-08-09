import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  reload,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { UserData } from '@/lib/types/types';
import { useSendVerificationEmail } from '@/hooks/use-send-verification-email';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * Розширений тип для результату входу з позначкою необхідності верифікації
 */
export interface SignInResult extends UserData {
  needsEmailVerification?: boolean;
}

/**
 * Тип для помилок синхронізації з сервером
 */
interface SyncError extends Error {
  status?: number;
}

/**
 * Тип для елементів черги синхронізації
 */
interface SyncQueueItem {
  firebaseUser: FirebaseUser;
  resolve: (value: UserData) => void;
  reject: (error: Error) => void;
}

/**
 * Перетворює Firebase User об'єкт в UserData формат додатка
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
 * Мьютекс для запобігання одночасним викликам syncUserWithServer
 */
let syncInProgress = false;
const syncQueue: SyncQueueItem[] = [];

/**
 * Обробляє чергу синхронізації з успішним результатом
 */
const processQueueWithSuccess = (userData: UserData) => {
  while (syncQueue.length > 0) {
    const { resolve } = syncQueue.shift()!;
    resolve(userData);
  }
};

/**
 * Обробляє чергу синхронізації з помилкою
 */
const processQueueWithError = (error: Error) => {
  while (syncQueue.length > 0) {
    const { reject } = syncQueue.shift()!;
    reject(error);
  }
};

/**
 * Синхронізує дані користувача з сервером через API
 * Забезпечує узгодженість між Firebase та власною базою даних
 * Включає обробку race conditions та network errors
 */
const syncUserWithServer = async (
  firebaseUser: FirebaseUser,
): Promise<UserData> => {
  // Перевірка race condition
  if (syncInProgress) {
    return new Promise<UserData>((resolve, reject) => {
      syncQueue.push({ firebaseUser, resolve, reject });
    });
  }

  syncInProgress = true;
  let authError: SyncError | null = null;

  try {
    const idToken = await firebaseUser.getIdToken(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      // Розширена обробка помилок HTTP
      if (response.status === 401 || response.status === 403) {
        authError = new Error('Authentication failed') as SyncError;
        authError.status = response.status;
        processQueueWithError(authError);
        syncInProgress = false;
        return Promise.reject(authError);
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to sync user data with server:', response.status);
      }

      // Повертаємо локальні дані при помилці синхронізації
      const localData = convertFirebaseUserToUserData(firebaseUser);
      processQueueWithSuccess(localData);
      syncInProgress = false;
      return localData;
    }

    const userData = await response.json();
    processQueueWithSuccess(userData);
    syncInProgress = false;
    return userData;
  } catch (error) {
    syncInProgress = false;

    // Обробка network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Network error during sync, using local data');
      }
      const localData = convertFirebaseUserToUserData(firebaseUser);
      processQueueWithSuccess(localData);
      return localData;
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Error syncing user data:', error);
    }

    // При інших помилках відхиляємо всі запити у черзі
    const syncError =
      error instanceof Error ? error : new Error('Unknown sync error');
    processQueueWithError(syncError);
    return Promise.reject(syncError);
  }
};

/**
 * Хук для реєстрації користувача з email та паролем
 * Включає створення профілю та відправку email верифікації
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();
  const sendVerification = useSendVerificationEmail();
  const t = useTranslations('authActions.registration');

  return useMutation<
    UserData,
    AuthError,
    { email: string; password: string; name: string }
  >({
    mutationFn: async ({ email, password, name }) => {
      // Створення нового користувача в Firebase
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Оновлення профілю з відображуваним ім'ям
      await updateProfile(userCred.user, { displayName: name });

      // Відправка email верифікації
      await sendVerification.mutateAsync();

      // Оновлення локальних даних користувача
      await reload(userCred.user);

      // Синхронізація з сервером
      return await syncUserWithServer(userCred.user);
    },
    onSuccess: (userData) => {
      // Оновлення кешу React Query
      queryClient.setQueryData(['user'], userData);
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign up error:', error);
      }

      // Обробка специфічних помилок реєстрації
      if (error.code === 'auth/email-already-in-use') {
        toast.error(t('emailExists'));
      } else if (error.code === 'auth/weak-password') {
        toast.error(t('passwordWeak'));
      } else if (error.code === 'auth/invalid-email') {
        toast.error(t('emailInvalidFormat'));
      } else {
        toast.error(t('generalError'));
      }
    },
  });
};

/**
 * Хук для входу користувача з email та паролем
 * Перевіряє статус верифікації email перед завершенням входу
 * Видалено зайвий reload після signInWithEmailAndPassword
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('authActions.login');

  return useMutation<
    SignInResult,
    AuthError,
    { email: string; password: string }
  >({
    mutationFn: async ({ email, password }) => {
      // Вхід в Firebase з email та паролем
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Синхронізація з сервером (reload вже не потрібен)
      const userData = await syncUserWithServer(userCred.user);

      // Перевірка верифікації email
      if (!userData.emailVerified) {
        return { ...userData, needsEmailVerification: true };
      }

      return userData;
    },
    onSuccess: (result) => {
      // Пропускаємо оновлення кешу для неверифікованих користувачів
      if (result.needsEmailVerification) {
        return;
      }

      // Оновлення кешу React Query тільки для верифікованих користувачів
      queryClient.setQueryData(['user'], result);
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign in error:', error);
      }

      // Обробка специфічних помилок входу
      if (error.code === 'auth/invalid-credential') {
        toast.error(t('wrongCredentials'));
      } else if (error.code === 'auth/user-not-found') {
        toast.error(t('userNotExists'));
      } else if (error.code === 'auth/wrong-password') {
        toast.error(t('incorrectPassword'));
      } else if (error.code === 'auth/invalid-email') {
        toast.error(t('emailInvalidFormat'));
      } else if (error.code === 'auth/user-disabled') {
        toast.error(t('accountDisabled'));
      } else if (error.code === 'auth/too-many-requests') {
        toast.error(t('tooManyAttempts'));
      } else {
        toast.error(t('generalError'));
      }
    },
  });
};

/**
 * Хук для входу через Google OAuth
 * Використовує popup для швидкої автентифікації через Google
 */
export const useSignInWithGoogle = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('authActions.googleAuth');

  return useMutation<UserData, AuthError, { redirectPath?: string }>({
    mutationFn: async ({ redirectPath }) => {
      // Налаштування Google провайдера з необхідними скоупами
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      // Вхід через Google popup
      const userCred = await signInWithPopup(auth, provider);

      // Синхронізація даних з сервером
      const userData = await syncUserWithServer(userCred.user);

      // Перенаправлення за потреби
      if (redirectPath) window.location.href = redirectPath;

      return userData;
    },
    onSuccess: (userData) => {
      // Оновлення кешу React Query
      queryClient.setQueryData(['user'], userData);
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Google sign in error:', error);
      }

      // Обробка специфічних помилок Google OAuth
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error(t('popupCancelled'));
      } else if (error.code === 'auth/popup-blocked') {
        toast.error(t('popupBlocked'));
      } else if (
        error.code === 'auth/account-exists-with-different-credential'
      ) {
        toast.error(t('accountConflict'));
      } else {
        toast.error(t('generalError'));
      }
    },
  });
};
