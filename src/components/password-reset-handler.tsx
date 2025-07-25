// src/components/password-reset-handler.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHandlePasswordReset } from '@/hooks/use-handle-password-reset';

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
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Reset Your Password</h2>
          <p className="mb-6 text-gray-600">
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                name="password"
                placeholder="New Password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-300 p-4"
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
                className="w-full rounded-xl border border-gray-300 p-4"
                disabled={handlePasswordReset.isPending}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={handlePasswordReset.isPending}
                className="flex-1 rounded-xl bg-blue-600 p-4 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {handlePasswordReset.isPending
                  ? 'Resetting...'
                  : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={handleClose}
                disabled={handlePasswordReset.isPending}
                className="flex-1 rounded-xl bg-gray-500 p-4 text-white hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Компонент не рендерить нічого видимого в звичайному стані
  return null;
}
