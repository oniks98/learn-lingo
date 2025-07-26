// src/components/password-reset-handler.tsx
'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHandlePasswordReset } from '@/hooks/use-handle-password-reset';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';

/**
 * Компонент для обробки скидання паролю через URL параметри
 */
export default function PasswordResetHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oobCode, setOobCode] = useState('');

  const handlePasswordReset = useHandlePasswordReset();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const code = searchParams.get('oobCode');

    // Перевіряємо, чи це запит на скидання паролю
    if (mode !== 'resetPassword' || !code || isProcessing) {
      return;
    }

    console.log('Password reset URL detected');
    console.log('OOB Code from URL:', code);

    // Очищаємо URL, щоб запобігти повторним викликам
    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);

    setIsProcessing(true);
    setOobCode(decodeURIComponent(code));
    setShowPasswordForm(true);
  }, [searchParams, router, isProcessing]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await handlePasswordReset.mutateAsync({
        oobCode,
        newPassword,
      });

      // Після успішного скидання закриваємо форму
      setShowPasswordForm(false);
      setIsProcessing(false);
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  const handleClose = () => {
    setShowPasswordForm(false);
    setIsProcessing(false);
  };

  // Показуємо форму введення нового паролю
  if (showPasswordForm) {
    return (
      <Modal
        isOpen={showPasswordForm}
        onCloseAction={handleClose}
        title="Reset Your Password"
      >
        <p className="text-shadow-gray-muted mb-5 leading-snug">
          Please enter your new password below. Make sure it's secure and easy
          for you to remember.
        </p>

        <form onSubmit={handleSubmit} className="space-y-[18px]">
          <div>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              required
              minLength={6}
              className="border-gray-muted w-full rounded-xl border p-4"
              disabled={handlePasswordReset.isPending}
            />
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              required
              minLength={6}
              className="border-gray-muted w-full rounded-xl border p-4"
              disabled={handlePasswordReset.isPending}
            />
          </div>

          <Button
            type="submit"
            disabled={handlePasswordReset.isPending}
            className="w-full disabled:opacity-50"
          >
            {handlePasswordReset.isPending ? 'Resetting…' : 'Reset Password'}
          </Button>

          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <Button
            type="button"
            onClick={handleClose}
            disabled={handlePasswordReset.isPending}
            className="w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </Button>
        </form>
      </Modal>
    );
  }

  // Компонент не рендерить нічого видимого в звичайному стані
  return null;
}
