// src/contexts/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { UserData, AuthContextType } from '@/lib/types/types';

/**
 * Контекст аутентификации для управления состоянием пользователя
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Провайдер аутентификации
 * Управляет состоянием авторизации пользователя и предоставляет методы для входа/выхода
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Преобразует Firebase User в UserData
   */
  const convertFirebaseUserToUserData = (
    firebaseUser: FirebaseUser,
  ): UserData => {
    return {
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
    };
  };

  /**
   * Обрабатывает изменения состояния аутентификации Firebase
   * Создает или обновляет сессионный куки через API
   */
  const handleAuthStateChange = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        console.log('Auth state changed - user detected');
        await reload(firebaseUser); // Обновляем состояние пользователя
        const idToken = await firebaseUser.getIdToken(true); // force refresh

        console.log('Sending auth request to server...');
        // Отправляем токен на сервер для создания session cookie
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Server response successful:', userData);
          setUser(userData);
        } else {
          console.error('Server response error:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);

          // В случае ошибки используем данные из Firebase
          const userData = convertFirebaseUserToUserData(firebaseUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        const userData = convertFirebaseUserToUserData(firebaseUser);
        setUser(userData);
      }
    } else {
      console.log('Auth state changed - user signed out');
      // Пользователь вышел из системы - удаляем session cookie
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
    }
    setLoading(false);
  };

  /**
   * Принудительно обновляет данные пользователя и синхронизирует с сервером
   * Полезно после операций вроде верификации email
   */
  const refreshUser = async (): Promise<void> => {
    if (!auth.currentUser) {
      console.warn('No current user to refresh');
      return;
    }

    try {
      console.log('Refreshing user data...');
      await reload(auth.currentUser);
      const idToken = await auth.currentUser.getIdToken(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data refreshed:', userData);
        setUser(userData);
      } else {
        const errorText = await response.text();
        console.error(
          'Failed to refresh user data:',
          response.status,
          errorText,
        );
        return;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      return;
    }
  };

  /**
   * Регистрация с email и паролем
   */
  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<UserData> => {
    try {
      console.log('Starting email/password registration...');

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      console.log('User created, updating profile...');
      // Обновляем профиль пользователя с именем
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      console.log('Sending email verification...');
      // Отправляем письмо с верификацией email
      await sendEmailVerification(userCredential.user);
      console.log('Email verification sent to:', userCredential.user.email);

      // Принудительно обновляем токен чтобы включить displayName
      await reload(userCredential.user);

      // Возвращаем UserData
      const userData = convertFirebaseUserToUserData(userCredential.user);
      console.log('Registration successful:', userData);
      return userData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  /**
   * Вход с email и паролем
   */
  const signIn = async (email: string, password: string): Promise<UserData> => {
    try {
      console.log('Starting email/password sign in...');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // При входе, обновляем данные пользователя
      await reload(userCredential.user);
      const userData = convertFirebaseUserToUserData(userCredential.user);
      console.log('Sign in successful:', userData);
      return userData;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  /**
   * Вход через Google OAuth
   */
  const signInWithGoogle = async (redirectPath?: string) => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');

    try {
      console.log('Starting Google sign in...');
      await signInWithPopup(auth, provider);
      console.log('Google sign in successful');

      if (redirectPath) {
        window.location.href = redirectPath;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  /**
   * Выход из системы
   */
  const signOut = async () => {
    try {
      console.log('Starting sign out...');
      await firebaseSignOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Подписка на изменения состояния аутентификации Firebase
  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => {
      console.log('Cleaning up auth state listener...');
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshUser, // Добавляем новый метод
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Хук для использования контекста аутентификации
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
