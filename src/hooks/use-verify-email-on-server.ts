import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface VerifyEmailRequest {
  oobCode: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  email?: string;
  user?: {
    uid: string;
    email: string;
    emailVerified: boolean;
    [key: string]: unknown;
  };
}

interface VerifyEmailError extends Error {
  message: string;
}

/**
 * Хук для верифікації email через сервер
 */
export const useVerifyEmailOnServer = () => {
  const t = useTranslations('notifications.email_verification');

  return useMutation<VerifyEmailResponse, VerifyEmailError, VerifyEmailRequest>(
    {
      mutationFn: async ({ oobCode }) => {
        // Відправляємо запит на верифікацію email
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oobCode }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Email verification failed');
        }

        return data;
      },
      onSuccess: (data) => {
        toast.success(data.message || t('server_verify_success'));
      },
      onError: (error: VerifyEmailError) => {
        // Якщо код вже використаний — показуємо success
        if (error.message.includes('already been used')) {
          toast.success(t('link_already_used'));
          return;
        }

        // Якщо посилання прострочене
        if (error.message.includes('expired')) {
          toast.error(t('link_expired'));
          return;
        }

        // Загальна помилка
        toast.error(t('server_verify_failed'));
      },
    },
  );
};
