// src/hooks/use-change-email-on-server.ts
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface ChangeEmailRequest {
  oobCode: string;
}

interface ChangeEmailResponse {
  success: boolean;
  newEmail: string;
  user?: any;
}

/**
 * Hook для подтверждения смены email через сервер
 */
export const useChangeEmailOnServer = () => {
  const t = useTranslations('notifications.email_change');

  return useMutation<ChangeEmailResponse, any, ChangeEmailRequest>({
    mutationFn: async ({ oobCode }) => {
      console.log('Changing email on server...');
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode }),
      });
      const data = await res.json();
      console.log('Server response for email change:', data);
      if (!res.ok) {
        console.error('Server error response for email change:', data);
        throw new Error(data.error || 'Email change failed');
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(t('success_template', { newEmail: data.newEmail }));
    },
    onError: (error: Error) => {
      console.error('Email change failed:', error);

      // Если код уже использован
      if (error.message.includes('already been used')) {
        toast.error(t('link_already_used'));
        return;
      }

      // Если ссылка истекла
      if (error.message.includes('expired')) {
        toast.error(t('link_expired'));
        return;
      }

      // Для всех остальных ошибок
      toast.error(t('change_failed'));
    },
  });
};
