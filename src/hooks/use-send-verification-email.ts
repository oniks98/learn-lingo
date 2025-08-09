import { useMutation } from '@tanstack/react-query';
import { sendEmailVerification, reload } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';

/**
 * Хук для відправки листа верифікації email
 */
export const useSendVerificationEmail = () => {
  const t = useTranslations('notifications.email_verification');

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      // Оновлюємо інформацію про користувача
      await reload(auth.currentUser);

      // Перевіряємо, чи email вже верифіковано
      if (auth.currentUser.emailVerified) {
        throw new Error('Email is already verified');
      }

      // Відправляємо лист верифікації
      await sendEmailVerification(auth.currentUser);
    },
    onSuccess: () => {
      toast.success(t('resend_success'));
    },
    onError: (error) => {
      if (error.message === 'Email is already verified') {
        toast.info(t('already_verified_info'));
      } else {
        toast.error(t('resend_failed'));
      }
    },
  });
};
