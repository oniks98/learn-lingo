// src/contexts/auth-context.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
  useState,
  useRef,
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
 * Контекст автентифікації для управління станом користувача в додатку
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Функція для отримання даних користувача з сервера через API
 * Перевіряє валідність токена та статус верифікації email
 * Включає обробку expired session cookies та network errors
 */
const fetchUserData = async (
  firebaseUser: FirebaseUser | null,
): Promise<UserData | null> => {
  if (!firebaseUser) {
    return null;
  }

  try {
    // Примусове оновлення інформації про Firebase користувача
    await firebaseUser.reload();

    // Отримання свіжого ID токена
    const idToken = await firebaseUser.getIdToken(true);

    // Відправка запиту на сервер для валідації та синхронізації
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      // Розширена обробка HTTP помилок
      if (response.status === 401) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Session expired, user needs to re-authenticate');
        }
        return null;
      }

      if (response.status === 403) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Access forbidden, possibly revoked token');
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch user data:', response.status);
      }
      return null;
    }

    const userData = await response.json();

    // Перевірка верифікації email - обов'язкова умова для автентифікації
    if (!userData.emailVerified) {
      return null;
    }

    return userData;
  } catch (error) {
    // Обробка network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Network error fetching user data, user remains offline');
      }
      // Повертаємо null при network error, щоб не показувати старі дані
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching user data:', error);
    }
    return null;
  }
};

/**
 * Провайдер автентифікації з використанням React Query для кешування
 * Управляє станом авторизації користувача в реальному часі
 * Включає оптимізацію для запобігання частим refetch викликам
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const lastNetworkStateRef = useRef(navigator.onLine);

  // React Query для управління даними користувача з оптимізованим кешуванням
  const {
    data: user = null,
    isLoading: loading,
    refetch: refetchUser,
  } = useQuery<UserData | null>({
    queryKey: ['user'],
    queryFn: () => fetchUserData(auth.currentUser),
    enabled: false, // Вимкнено автоматичне виконання
    staleTime: 30 * 1000, // 30 секунд для швидкого оновлення після верифікації
    gcTime: 5 * 60 * 1000, // 5 хвилин час життя в кеші
    retry: (failureCount, error: any) => {
      // Не повторюємо запити для 401/403 помилок
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Не повторюємо запити для неверифікованих користувачів
      if (error?.message?.includes('not verified')) {
        return false;
      }
      // Зменшена кількість спроб для швидшого реагування
      return failureCount < 2;
    },
  });

  /**
   * Оптимізований refetch з debounce для запобігання частим викликам
   */
  const optimizedRefetchUser = async () => {
    const now = Date.now();

    // Не робити refetch частіше ніж раз на 10 секунд
    if (now - lastRefreshTime < 10000) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Refetch skipped due to recent refresh');
      }
      return;
    }

    setLastRefreshTime(now);
    return await refetchUser();
  };

  /**
   * Функція виходу з системи з повним очищенням сесії та кешів
   */
  const signOut = async () => {
    try {
      // Очищення кешу React Query для користувача
      queryClient.setQueryData(['user'], null);

      // Очищення всіх кешів, пов'язаних з обраними елементами
      queryClient.removeQueries({ queryKey: ['favorites'] });
      queryClient.removeQueries({ queryKey: ['favoriteStatus'] });

      // Очищення відкладених дій
      removePendingAction();

      // Вихід з Firebase Authentication
      await firebaseSignOut(auth);

      // Виклик API для видалення session cookie
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (logoutError) {
        // Не критична помилка, продовжуємо вихід
        if (process.env.NODE_ENV === 'development') {
          console.warn('Logout API call failed:', logoutError);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Sign out successful');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign out error:', error);
      }
      throw error;
    }
  };

  /**
   * Слухач змін стану автентифікації Firebase
   * Автоматично оновлює дані при зміні статусу користувача
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Користувач увійшов - оновлюємо та перезапитуємо дані
        await firebaseUser.reload();
        await optimizedRefetchUser();
      } else {
        // Користувач вийшов - очищуємо всі дані
        queryClient.setQueryData(['user'], null);
        queryClient.removeQueries({ queryKey: ['favorites'] });
        queryClient.removeQueries({ queryKey: ['favoriteStatus'] });
        removePendingAction();
        setLastRefreshTime(0); // Скидання часу останнього оновлення
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  /**
   * Обробка network state changes для повторного підключення
   */
  useEffect(() => {
    const handleOnline = () => {
      if (!lastNetworkStateRef.current && navigator.onLine && user) {
        optimizedRefetchUser().catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error refetching user on online:', error);
          }
        });
      }
      lastNetworkStateRef.current = navigator.onLine;
    };

    const handleOffline = () => {
      lastNetworkStateRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Мемоізація контексту для оптимізації продуктивності
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signOut,
      refetchUser: optimizedRefetchUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Хук для використання контексту автентифікації
 * Забезпечує типобезпечний доступ до стану автентифікації
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
