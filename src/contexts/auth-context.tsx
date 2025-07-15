'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, db } from '@/lib/utils/firebase';
import { ref, set } from 'firebase/database';

// Тип даних для контексту авторизації
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<User>; // функція реєстрації
  signIn: (email: string, password: string) => Promise<void>; // функція входу
  signOut: () => Promise<void>; // функція виходу
  signInWithGoogle: (redirectPath?: string) => void;
}

// Створюємо контекст авторизації
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Кастомний хук для зручного доступу до контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

//  Провайдер, який обгортає додаток , де потрібна авторизація
export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const signInWithGoogle = (redirectPath = '/') => {
    const redirectParam = encodeURIComponent(redirectPath);
    window.location.href = `/api/auth/google?redirect=${redirectParam}`;
  };

  // Слідкуємо за змінами стану користувача (увійшов/вийшов); useEffect підписується й автоматично відписується
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      setError(null);
    });
  }, []);

  //  Реєстрація нового користувача
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<User> => {
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(user, { displayName });
      // прописуємо в БД мінімальні поля
      await set(ref(db, `users/${user.uid}`), {
        email: user.email,
        username: displayName,
        createdAt: Date.now(),
        favorites: [],
        emailVerified: false,
        provider: 'password',
      });
      return user;
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
      throw err;
    }
  };

  //  Вхід користувача
  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(getFriendlyErrorMessage(err.code));
      throw err;
    }
  };

  //  Вихід користувача
  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError('Failed to sign out of account. Please try again.');
      throw err;
    }
  };

  //  Перетворює коди помилок Firebase на зрозумілі повідомлення
  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Ця електронна пошта вже використовується.';
      case 'auth/invalid-email':
        return 'Неправильний формат електронної пошти.';
      case 'auth/weak-password':
        return 'Пароль має містити щонайменше 6 символів.';
      case 'auth/user-disabled':
        return 'Ваш обліковий запис вимкнено.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Неправильна електронна пошта або пароль.';
      case 'auth/too-many-requests':
        return 'Занадто багато спроб. Спробуйте пізніше.';
      default:
        return `Помилка: ${code}. Спробуйте ще раз.`;
    }
  };

  //  Обʼєкт, який буде доступний через контекст
  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut: signOutUser,
  };

  // Рендеримо провайдер. Дочірні компоненти показуємо лише після завершення ініціалізації
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
