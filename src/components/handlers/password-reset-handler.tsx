// src/components/password-reset-handler.tsx
'use client';
import React from 'react';
import { useEffect, useState } from 'react';
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

      // Після успішного скидання закриваємо форму
      setShowPasswordForm(false);
      setIsProcessing(false);
    } catch (error) {
      console.error('Password reset failed:', error);
      setError(t('validation.resetFailed'));
    }
  };

  const handleClose = () => {
    setShowPasswordForm(false);
    setIsProcessing(false);
    setError('');
  };

  // Показуємо форму введення нового паролю
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

          <div>
            <input
              type="password"
              name="password"
              placeholder={t('placeholders.newPassword')}
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
              placeholder={t('placeholders.confirmPassword')}
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

  // Компонент не рендерить нічого видимого в звичайному стані
  return null;
}
