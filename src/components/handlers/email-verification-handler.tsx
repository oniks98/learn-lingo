'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifyEmailOnServer } from '@/hooks/use-verify-email-on-server';
import { useAuth } from '@/contexts/auth-context';

/**
 * Компонент для обробки верифікації email через URL параметри
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

    // Перевіряємо, чи є це запитом на верифікацію email
    if (mode !== 'verifyEmail' || !oobCode || isProcessing) {
      return;
    }

    // Одразу очищаємо URL для запобігання повторним викликам
    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);

    setIsProcessing(true);

    // Декодуємо oobCode
    const decodedOobCode = decodeURIComponent(oobCode);

    verifyEmailMutation.mutate(
      { oobCode: decodedOobCode },
      {
        onSuccess: async () => {
          // Даємо час Firebase оновити статус
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
  }, [searchParams, router, verifyEmailMutation, refetchUser, isProcessing]);

  return null;
}
