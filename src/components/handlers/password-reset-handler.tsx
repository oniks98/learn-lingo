'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useHandlePasswordReset } from '@/hooks/use-handle-password-reset';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';

/**
 * Компонент для обробки скидання паролю через URL параметри
 */
export default function PasswordResetHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('passwordResetHandler');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oobCode, setOobCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordReset = useHandlePasswordReset();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const code = searchParams.get('oobCode');

    // Перевіряємо, чи це запит на скидання паролю
    if (mode !== 'resetPassword' || !code || isProcessing) {
      return;
    }

    // Очищаємо URL для запобігання повторним викликам
    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);

    setIsProcessing(true);
    setOobCode(decodeURIComponent(code));
    setShowPasswordForm(true);
  }, [searchParams, router, isProcessing]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError(t('validation.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('validation.passwordTooShort'));
      return;
    }

    try {
      await handlePasswordReset.mutateAsync({
        oobCode,
        newPassword,
      });

      setShowPasswordForm(false);
      setIsProcessing(false);
    } catch {
      setError(t('validation.resetFailed'));
    }
  };

  const handleClose = () => {
    setShowPasswordForm(false);
    setIsProcessing(false);
    setError('');
  };

  // Іконка показу паролю
  const EyeIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  // Іконка приховування паролю
  const EyeSlashIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
      />
    </svg>
  );

  if (showPasswordForm) {
    return (
      <Modal
        isOpen={showPasswordForm}
        onCloseAction={handleClose}
        title={t('title')}
      >
        <p className="text-shadow-gray-muted mb-5 leading-snug">
          {t('description')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-[18px]">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={t('placeholders.newPassword')}
              required
              minLength={6}
              className="border-gray-muted w-full rounded-xl border p-4 pr-12"
              disabled={handlePasswordReset.isPending}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={handlePasswordReset.isPending}
            >
              {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder={t('placeholders.confirmPassword')}
              required
              minLength={6}
              className="border-gray-muted w-full rounded-xl border p-4 pr-12"
              disabled={handlePasswordReset.isPending}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={handlePasswordReset.isPending}
            >
              {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={handlePasswordReset.isPending}
            className="w-full disabled:opacity-50"
          >
            {handlePasswordReset.isPending
              ? t('buttons.resetting')
              : t('buttons.resetPassword')}
          </Button>

          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">{t('or')}</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <Button
            type="button"
            onClick={handleClose}
            disabled={handlePasswordReset.isPending}
            className="w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
          >
            {t('buttons.cancel')}
          </Button>
        </form>
      </Modal>
    );
  }

  return null;
}
