'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChangeEmailOnServer } from '@/hooks/use-change-email-on-server';
import { useAuth } from '@/contexts/auth-context';

/**
 * Компонент для обробки зміни email через URL параметри
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

    // Перевіряємо, чи є це запитом на зміну email
    if (
      (mode !== 'verifyAndChangeEmail' && mode !== 'recoverEmail') ||
      !oobCode ||
      isProcessing
    ) {
      return;
    }

    // Одразу очищаємо URL для запобігання повторним викликам
    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);

    setIsProcessing(true);

    // Декодуємо oobCode
    const decodedOobCode = decodeURIComponent(oobCode);

    changeEmailMutation.mutate(
      { oobCode: decodedOobCode },
      {
        onSuccess: async () => {
          // Даємо час Firebase оновити дані
          setTimeout(async () => {
            await refetchUser();
            setIsProcessing(false);
          }, 1000);
        },
        onError: () => {
          setIsProcessing(false);
        },
      },
    );
  }, [searchParams, router, changeEmailMutation, refetchUser, isProcessing]);

  return null;
}
