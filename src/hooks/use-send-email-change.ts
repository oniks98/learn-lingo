import { useMutation } from '@tanstack/react-query';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface SendEmailChangeRequest {
  newEmail: string;
}

/**
 * Хук для відправки запиту на зміну email
 */
export const useSendEmailChange = () => {
  const t = useTranslations('profile.changeEmailModal');

  return useMutation<void, Error, SendEmailChangeRequest>({
    mutationFn: async ({ newEmail }) => {
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      // Перевіряємо, чи новий email не є таким же, як поточний
      if (auth.currentUser.email === newEmail) {
        throw new Error('same-email');
      }

      // Перевіряємо доступність email через серверний API
      const checkResponse = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkEmail: newEmail }),
      });

      const checkResult = await checkResponse.json();

      // Виправлена логіка перевірки доступності
      if (!checkResponse.ok) {
        // Якщо статус 409 - email зайнятий
        if (checkResponse.status === 409) {
          throw new Error('email-already-in-use');
        }
        // Інші помилки сервера
        throw new Error('server-error');
      }

      // Перевіряємо чи email доступний
      if (checkResult.available === false) {
        throw new Error('email-already-in-use');
      }

      // Використовуємо verifyBeforeUpdateEmail для відправки листа підтвердження
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    },
    onSuccess: () => {
      toast.success(t('success'));
    },
    onError: (error) => {
      const errorMessage = error.message;

      // Обробляємо специфічні помилки
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
