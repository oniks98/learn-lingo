// src/contexts/auth-context.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { UserData } from '@/lib/types/types';
import { removePendingAction } from '@/lib/utils/pending-actions';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<any>;
}

/**
 * Контекст аутентификации для управления состоянием пользователя
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Функция для получения данных пользователя с сервера
 */
const fetchUserData = async (
  firebaseUser: FirebaseUser | null,
): Promise<UserData | null> => {
  if (!firebaseUser) {
    return null;
  }

  try {
    console.log('Fetching user data from server...');

    // Принудительно обновляем информацию о Firebase‑пользователе
    await firebaseUser.reload();

    const idToken = await firebaseUser.getIdToken(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      console.error('Failed to fetch user data:', response.status);
      // Вместо throw — сразу возвращаем null (неавторизован)
      return null;
    }

    const userData = await response.json();
    console.log('User data fetched successfully:', userData);
    console.log('Email verified status:', userData.emailVerified);

    // Если email не верифицирован — считаем, что юзер не аутентифицирован
    if (!userData.emailVerified) {
      console.log('User email is not verified, treating as unauthenticated');
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    // При ошибках сети или парсинга тоже возвращаем null
    return null;
  }
};

/**
 * Провайдер аутентификации
 * Управляет состоянием авторизации пользователя с помощью React Query
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  // React Query для управления данными пользователя
  const {
    data: user = null,
    isLoading: loading,
    refetch: refetchUser,
  } = useQuery<UserData | null>({
    queryKey: ['user'],
    queryFn: () => fetchUserData(auth.currentUser),
    enabled: false, // Отключаем автоматическое выполнение
    staleTime: 30 * 1000, // 30 секunds - короче для быстрого обновления после верификации
    gcTime: 5 * 60 * 1000, // 5 минут
    retry: (failureCount, error) => {
      // Не повторяем запросы, если пользователь не верифицирован
      if (error.message.includes('not verified')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  /**
   * Выход из системы
   */
  const signOut = async () => {
    try {
      console.log('Starting sign out...');

      // Очищаем кеш React Query для пользователя
      queryClient.setQueryData(['user'], null);

      // Очищаем все кеши, связанные с избранным
      queryClient.removeQueries({ queryKey: ['favorites'] });
      queryClient.removeQueries({ queryKey: ['favoriteStatus'] });

      // Очищаем отложенные действия
      removePendingAction();

      // Выходим из Firebase
      await firebaseSignOut(auth);

      // Вызываем API для удаления session cookie
      await fetch('/api/auth/logout', { method: 'POST' });

      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Слушатель изменений состояния аутентификации Firebase
  useEffect(() => {
    console.log('Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Auth state changed - user detected, refetching data...');
        console.log('Firebase user emailVerified:', firebaseUser.emailVerified);

        // Обновляем данные пользователя Firebase перед проверкой
        await firebaseUser.reload();
        console.log(
          'After reload - emailVerified:',
          firebaseUser.emailVerified,
        );

        await refetchUser();
      } else {
        console.log('Auth state changed - user signed out');
        queryClient.setQueryData(['user'], null);

        // Очищаем кеши избранного при выходе
        queryClient.removeQueries({ queryKey: ['favorites'] });
        queryClient.removeQueries({ queryKey: ['favoriteStatus'] });

        // Очищаем отложенные действия при выходе
        removePendingAction();
      }
    });

    return () => {
      console.log('Cleaning up auth state listener...');
      unsubscribe();
    };
  }, [refetchUser, queryClient]);

  // Мемоизируем контекст для оптимизации
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signOut,
      refetchUser,
    }),
    [user, loading, refetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook для использования контекста аутентификации
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
