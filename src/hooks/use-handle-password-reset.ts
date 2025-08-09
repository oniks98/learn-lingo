import { useMutation } from '@tanstack/react-query';
import { confirmPasswordReset } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';

interface HandlePasswordResetRequest {
  oobCode: string;
  newPassword: string;
}

/**
 * Хук для обробки скидання паролю через oobCode
 */
export const useHandlePasswordReset = () => {
  const t = useTranslations('notifications.password_reset');

  return useMutation<void, Error, HandlePasswordResetRequest>({
    mutationFn: async ({ oobCode, newPassword }) => {
      // Підтверджуємо скидання паролю через Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);
    },
    onSuccess: () => {
      toast.success(t('success_message'));
    },
    onError: (error) => {
      let errorMessage = t('general_error');

      // Обробляємо специфічні помилки Firebase
      if (error.message.includes('auth/invalid-action-code')) {
        errorMessage = t('invalid_link');
      } else if (error.message.includes('auth/expired-action-code')) {
        errorMessage = t('expired_link');
      } else if (error.message.includes('auth/weak-password')) {
        errorMessage = t('weak_password');
      }

      toast.error(errorMessage);
    },
  });
};
