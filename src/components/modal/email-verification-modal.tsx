'use client';

import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { useSendVerificationEmail } from '@/hooks/use-send-verification-email';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
  onBackToLoginAction: () => void;
  userEmail: string;
}

export default function EmailVerificationModal({
  isOpen,
  onCloseAction,
  onBackToLoginAction,
  userEmail,
}: Props) {
  const sendVerification = useSendVerificationEmail();
  const t = useTranslations('loginForm');

  /**
   * Обробник повторного надсилання листа верифікації
   */
  const handleResendVerification = async () => {
    try {
      await sendVerification.mutateAsync();
    } catch (err) {
      console.error('Помилка повторного надсилання верифікації:', err);
    }
  };

  const isResendLoading = sendVerification.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={onCloseAction}
      title={t('emailVerification.title')}
    >
      <div className="space-y-4">
        {/* Іконка попередження */}
        <div
          className={clsx(
            'mx-auto flex h-16 w-16 items-center justify-center',
            'rounded-full bg-yellow-100',
          )}
        >
          <svg
            className="h-8 w-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Заголовок та опис */}
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {t('emailVerification.heading')}
          </h3>
          <p className={clsx('text-shadow-gray-muted mb-4 leading-snug')}>
            {t('emailVerification.description', { email: userEmail })}
          </p>
        </div>

        {/* Кнопки дій */}
        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleResendVerification}
            disabled={isResendLoading}
            className="w-full"
          >
            {isResendLoading
              ? t('emailVerification.sending')
              : t('emailVerification.resendEmail')}
          </Button>

          <Button
            type="button"
            onClick={onBackToLoginAction}
            disabled={isResendLoading}
            className={clsx('w-full bg-gray-500 hover:bg-gray-600')}
          >
            {t('buttons.backToLogin')}
          </Button>
        </div>

        {/* Допоміжний текст */}
        <div className={clsx('mt-4 text-center text-xs text-gray-500')}>
          <p>{t('emailVerification.helpText')}</p>
        </div>
      </div>
    </Modal>
  );
}
