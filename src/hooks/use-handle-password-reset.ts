// src/hooks/use-handle-password-reset.ts
import { useMutation } from '@tanstack/react-query';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';

interface HandlePasswordResetRequest {
  oobCode: string;
  newPassword: string;
}

/**
 * Hook для обробки скидання паролю через oobCode
 */
export const useHandlePasswordReset = () => {
  return useMutation<void, Error, HandlePasswordResetRequest>({
    mutationFn: async ({ oobCode, newPassword }) => {
      console.log('Handling password reset with oobCode...');

      // Підтверджуємо скидання паролю через Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);
      console.log('Password reset completed successfully');
    },
    onSuccess: () => {
      // toast.success(
      //   'Password has been reset successfully! You can now log in with your new password.',
      // );
    },
    onError: (error) => {
      console.error('Password reset failed:', error);

      let errorMessage = 'Password reset failed. Please try again.';

      // Обробляємо специфічні помилки Firebase
      if (error.message.includes('auth/invalid-action-code')) {
        errorMessage =
          'Invalid or expired password reset link. Please request a new one.';
      } else if (error.message.includes('auth/expired-action-code')) {
        errorMessage =
          'Password reset link has expired. Please request a new one.';
      } else if (error.message.includes('auth/weak-password')) {
        errorMessage = 'Password is too weak. Minimum 6 characters required.';
      }

      toast.error(errorMessage);
    },
  });
};
