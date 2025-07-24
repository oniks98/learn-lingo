// src/hooks/use-resend-verification-email.ts
import { useMutation } from '@tanstack/react-query';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';

/**
 * Hook для повторної відправки листа верифікації
 */
export const useResendVerificationEmail = () => {
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
      toast.success('Verification email sent! Please check your inbox.');
    },
    onError: (error) => {
      console.error('Failed to resend verification email:', error);

      if (error.message === 'Email is already verified') {
        toast.info('Your email is already verified!');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
    },
  });
};
