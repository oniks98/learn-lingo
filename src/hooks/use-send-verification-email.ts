// src/hooks/use-send-verification-email.ts
import { useMutation } from '@tanstack/react-query';
import { sendEmailVerification, reload } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';

/**
 * Hook для відправки листа верифікації
 */
export const useSendVerificationEmail = () => {
  const t = useTranslations('notifications.email_verification');

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      console.log('Resending verification email...');

      // Оновлюємо інформацію про користувача
      await reload(auth.currentUser);

      // Перевіряємо, чи email вже верифіковано
      if (auth.currentUser.emailVerified) {
        throw new Error('Email is already verified');
      }

      // Відправляємо лист верифікації
      await sendEmailVerification(auth.currentUser);
      console.log('Verification email sent successfully');
    },
    onSuccess: () => {
      toast.success(t('resend_success'));
    },
    onError: (error) => {
      console.error('Failed to resend verification email:', error);

      if (error.message === 'Email is already verified') {
        toast.info(t('already_verified_info'));
      } else {
        toast.error(t('resend_failed'));
      }
    },
  });
};
