// src/hooks/use-password-reset.ts
import { useMutation } from '@tanstack/react-query';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';

/**
 * Hook для відправки листа скидання паролю
 */
export const useSendPasswordReset = () => {
  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      console.log('Sending password reset email to:', email);

      // Відправляємо лист скидання паролю
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
    },
    onSuccess: () => {
      toast.success('Password reset email sent! Please check your inbox.');
    },
    onError: (error) => {
      console.error('Failed to send password reset email:', error);

      let errorMessage =
        'Failed to send password reset email. Please try again.';

      // Обробляємо специфічні помилки Firebase
      if (error.message.includes('auth/user-not-found')) {
        errorMessage = 'No user found with this email address.';
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address format.';
      } else if (error.message.includes('auth/too-many-requests')) {
        errorMessage = 'Too many requests. Please try again later.';
      }

      toast.error(errorMessage);
    },
  });
};
