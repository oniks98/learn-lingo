// src/components/handlers/email-change-handler.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChangeEmailOnServer } from '@/hooks/use-change-email-on-server';
import { useAuth } from '@/contexts/auth-context';

/**
 * Компонент для обработки смены email через URL параметры
 */
export default function EmailChangeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refetchUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const changeEmailMutation = useChangeEmailOnServer();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // Проверяем, является ли это запросом на смену email
    // Firebase использует 'verifyAndChangeEmail' для подтверждения смены email
    if (
      (mode !== 'verifyAndChangeEmail' && mode !== 'recoverEmail') ||
      !oobCode ||
      isProcessing
    ) {
      return;
    }

    console.log('Email change URL detected, starting email change...');
    console.log('Mode:', mode);
    console.log('OOB Code from URL:', oobCode);

    // СРАЗУ очищаем URL, чтобы предотвратить повторные вызовы
    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);

    setIsProcessing(true);

    // Декодируем oobCode на случай, если он URL-encoded
    const decodedOobCode = decodeURIComponent(oobCode);
    console.log('Decoded OOB Code:', decodedOobCode);

    // Меняем email через сервер
    changeEmailMutation.mutate(
      { oobCode: decodedOobCode },
      {
        onSuccess: async (data) => {
          console.log('Email change successful, refreshing user data...');
          console.log('New email:', data.newEmail);

          // Даем время Firebase обновить данные
          setTimeout(async () => {
            await refetchUser();
            setIsProcessing(false);
          }, 1000);
        },
        onError: (error) => {
          console.error('Email change failed:', error);
          setIsProcessing(false);
        },
      },
    );
  }, [searchParams, router, changeEmailMutation, refetchUser, isProcessing]);

  // Показываем индикатор загрузки во время обработки
  if (isProcessing) {
    return null;
  }

  // Компонент не рендерит ничего видимого в обычном состоянии
  return null;
}
