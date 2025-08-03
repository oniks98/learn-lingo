// src/hooks/use-send-email-change.ts
import { useMutation } from '@tanstack/react-query';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface SendEmailChangeRequest {
  newEmail: string;
}

/**
 * Hook для отправки запроса на смену email
 */
export const useSendEmailChange = () => {
  const t = useTranslations('profile.changeEmailModal');

  return useMutation<void, Error, SendEmailChangeRequest>({
    mutationFn: async ({ newEmail }) => {
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      console.log('Sending email change request to:', newEmail);

      // Проверяем, не является ли новый email тем же, что и текущий
      if (auth.currentUser.email === newEmail) {
        throw new Error('same-email');
      }

      // Проверяем доступность email через серверный API
      console.log('Checking email availability via server API:', newEmail);

      const checkResponse = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkEmail: newEmail }),
      });

      const checkResult = await checkResponse.json();
      console.log('Email availability check result:', checkResult);

      // Если email уже занят
      if (!checkResponse.ok || !checkResult.available || checkResult.exists) {
        console.log('Email is already in use');
        throw new Error('email-already-in-use');
      }

      console.log('Email is available, proceeding with change request');

      // Используем verifyBeforeUpdateEmail для отправки письма подтверждения на новый email
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      console.log('Email change verification sent successfully');
    },
    onSuccess: () => {
      toast.success(t('success'));
    },
    onError: (error) => {
      console.error('Failed to send email change request:', error);

      // Обработка специфических ошибок по message
      const errorMessage = error.message;

      if (errorMessage.includes('email-already-in-use')) {
        toast.error(t('validation.emailAlreadyInUse'));
      } else if (errorMessage.includes('invalid-email')) {
        toast.error(t('validation.emailInvalid'));
      } else if (errorMessage.includes('requires-recent-login')) {
        toast.error(t('validation.recentLoginRequired'));
      } else if (errorMessage.includes('same-email')) {
        toast.error(t('validation.sameEmail'));
      } else {
        toast.error(t('error'));
      }
    },
  });
};
