// src/hooks/use-password-reset.ts
import { useMutation } from '@tanstack/react-query';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';

/**
 * Hook для відправки листа скидання паролю
 */
export const useSendPasswordReset = () => {
  const t = useTranslations('passwordReset');

  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      console.log('Sending password reset email to:', email);

      // Відправляємо лист скидання паролю
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
    },
    onSuccess: () => {
      toast.success(t('emailSentSuccess'));
    },
    onError: (error) => {
      console.error('Failed to send password reset email:', error);

      let errorMessage = t('genericError');

      // Обробляємо специфічні помилки Firebase
      if (error.message.includes('auth/user-not-found')) {
        errorMessage = t('userNotFound');
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = t('invalidEmail');
      } else if (error.message.includes('auth/too-many-requests')) {
        errorMessage = t('tooManyRequests');
      }

      toast.error(errorMessage);
    },
  });
};
