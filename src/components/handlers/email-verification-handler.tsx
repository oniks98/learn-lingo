// src/components/email-verification-handler.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifyEmailOnServer } from '@/hooks/use-verify-email-on-server';
import { useAuth } from '@/contexts/auth-context';

/**
 * Компонент для обработки верификации email через URL параметры
 */
export default function EmailVerificationHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refetchUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const verifyEmailMutation = useVerifyEmailOnServer();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // Проверяем, является ли это запросом на верификацию email
    if (mode !== 'verifyEmail' || !oobCode || isProcessing) {
      return;
    }

    console.log('Email verification URL detected, starting verification...');
    console.log('OOB Code from URL:', oobCode);

    // СРАЗУ очищаем URL, чтобы предотвратить повторные вызовы
    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);

    setIsProcessing(true);

    // Декодируем oobCode на случай, если он URL-encoded
    const decodedOobCode = decodeURIComponent(oobCode);
    console.log('Decoded OOB Code:', decodedOobCode);

    // Верифицируем email через сервер
    verifyEmailMutation.mutate(
      { oobCode: decodedOobCode },
      {
        onSuccess: async () => {
          console.log('Email verification successful, refreshing user data...');

          // Даем время Firebase обновить статус
          setTimeout(async () => {
            await refetchUser();
            setIsProcessing(false);
          }, 1000);
        },
        onError: (error) => {
          console.error('Email verification failed:', error);
          setIsProcessing(false);
        },
      },
    );
  }, [searchParams, router, verifyEmailMutation, refetchUser, isProcessing]);

  // Показываем индикатор загрузки во время обработки
  if (isProcessing) {
    return null;
  }

  // Компонент не рендерит ничего видимого в обычном состоянии
  return null;
}
