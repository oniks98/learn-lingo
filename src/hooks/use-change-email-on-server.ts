import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ChangeEmailResponse,
  ChangeEmailError,
  ChangeEmailRequest,
} from '@/lib/types/types';

/**
 * Хук для підтвердження зміни email через сервер
 */
export const useChangeEmailOnServer = () => {
  const t = useTranslations('notifications.email_change');

  return useMutation<ChangeEmailResponse, ChangeEmailError, ChangeEmailRequest>(
    {
      mutationFn: async ({ oobCode }) => {
        // Відправляємо запит на зміну email
        const res = await fetch('/api/auth/change-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oobCode }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Email change failed');
        }

        return data;
      },
      onSuccess: (data) => {
        // Показуємо повідомлення про успіх
        toast.success(t('success_template', { newEmail: data.newEmail }));
      },
      onError: (error: ChangeEmailError) => {
        // Обробляємо різні типи помилок
        if (error.message.includes('already been used')) {
          toast.error(t('link_already_used'));
          return;
        }

        if (error.message.includes('expired')) {
          toast.error(t('link_expired'));
          return;
        }

        // Загальна помилка
        toast.error(t('change_failed'));
      },
    },
  );
};
