// src/hooks/use-change-email-on-server.ts
import { useMutation } from '@tanstack/react-query';
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
  return useMutation<ChangeEmailResponse, any, ChangeEmailRequest>({
    mutationFn: async ({ oobCode }) => {
      console.log('Changing email on server...');
      const res = await fetch('/api/change-email', {
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
      toast.success(
        `Your email has been successfully changed to ${data.newEmail}!`,
      );
    },
    onError: (error: Error) => {
      console.error('Email change failed:', error);

      // Если код уже использован
      if (error.message.includes('already been used')) {
        toast.error('This email change link has already been used.');
        return;
      }

      // Если ссылка истекла
      if (error.message.includes('expired')) {
        toast.error(
          'This email change link has expired. Please request a new one.',
        );
        return;
      }

      // Для всех остальных ошибок
      toast.error('Email change failed. Please try again.');
    },
  });
};
