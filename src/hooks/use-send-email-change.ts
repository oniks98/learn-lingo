// src/hooks/use-send-email-change.ts
import { useMutation } from '@tanstack/react-query';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth } from '@/lib/db/firebase-client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface SendEmailChangeRequest {
  newEmail: string;
}

/**
 * Hook для отправки запроса на смену email
 */
export const useSendEmailChange = () => {
  const t = useTranslations('profile.changeEmailModal');
  return useMutation<void, Error, SendEmailChangeRequest>({
    mutationFn: async ({ newEmail }) => {
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      console.log('Sending email change request to:', newEmail);

      // Используем verifyBeforeUpdateEmail для отправки письма подтверждения на новый email

      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      console.log('Email change verification sent successfully');
    },
    onSuccess: () => {
      toast.success(t('success'));
    },
    onError: (error) => {
      console.error('Failed to send email change request:', error);

      // Обработка специфических ошибок Firebase
      if (error.message.includes('email-already-in-use')) {
        toast.error(t('validation.emailAlreadyInUse'));
      } else if (error.message.includes('invalid-email')) {
        toast.error(t('validation.emailInvalid'));
      } else if (error.message.includes('requires-recent-login')) {
        toast.error(t('validation.recentLoginRequired'));
      } else {
        toast.error(t('error'));
      }
    },
  });
};
