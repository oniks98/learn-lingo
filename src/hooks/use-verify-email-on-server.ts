// src/hooks/use-verify-email-on-server.ts
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
  user?: any;
}

/**
 * Hook для верифікації email через сервер
 */
export const useVerifyEmailOnServer = () => {
  const t = useTranslations('notifications.email_verification');

  return useMutation<VerifyEmailResponse, any, VerifyEmailRequest>({
    mutationFn: async ({ oobCode }) => {
      console.log('Verifying email with server...');
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode }),
      });
      const data = await res.json();
      console.log('Server response:', data);
      if (!res.ok) {
        console.error('Server error response:', data);
        throw new Error(data.error || 'Email verification failed');
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || t('server_verify_success'));
    },
    onError: (error: Error) => {
      console.error('Email verification failed:', error);

      // Если код уже использован — показываем success и выходим
      if (error.message.includes('already been used')) {
        toast.success(t('link_already_used'));
        return;
      }

      // Если ссылка истекла
      if (error.message.includes('expired')) {
        toast.error(t('link_expired'));
        return;
      }

      // Для всех остальных ошибок
      toast.error(t('server_verify_failed'));
    },
  });
};
