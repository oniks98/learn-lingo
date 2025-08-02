// src/components/modal/password-reset-modal.tsx
'use client';

import { useTranslations } from 'next-intl';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { useSendPasswordReset } from '@/hooks/use-password-reset';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
  onBackToLoginAction: () => void;
}

export default function PasswordResetModal({
  isOpen,
  onCloseAction,
  onBackToLoginAction,
}: Props) {
  const sendPasswordReset = useSendPasswordReset();
  const t = useTranslations('loginForm');

  /**
   * Обработчик отправки письма для сброса пароля
   */
  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordReset.mutateAsync({ email });
    } catch (err) {
      console.error('Ошибка отправки сброса пароля:', err);
    }
  };

  const isPasswordResetLoading = sendPasswordReset.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={onCloseAction}
      title={t('passwordReset.title')}
    >
      <div className="space-y-4">
        {/* Иконка ключа */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>

        {/* Заголовок и описание */}
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {t('passwordReset.heading')}
          </h3>
          <p className="text-shadow-gray-muted mb-4 leading-snug">
            {t('passwordReset.description')}
          </p>
        </div>

        {/* Форма сброса пароля */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            handleSendPasswordReset(email);
          }}
          className="space-y-4"
        >
          {/* Поле ввода email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder={t('placeholders.email')}
              required
              className="border-gray-muted w-full rounded-xl border p-4"
              disabled={isPasswordResetLoading}
            />
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isPasswordResetLoading}
              className="w-full"
            >
              {isPasswordResetLoading
                ? t('passwordReset.sending')
                : t('passwordReset.sendLink')}
            </Button>

            <Button
              type="button"
              onClick={onBackToLoginAction}
              disabled={isPasswordResetLoading}
              className="w-full bg-gray-500 hover:bg-gray-600"
            >
              {t('buttons.backToLogin')}
            </Button>
          </div>
        </form>

        {/* Ссылка на возврат к логину */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            {t('passwordReset.rememberPassword')}{' '}
            <button
              type="button"
              onClick={onBackToLoginAction}
              className="text-blue-600 hover:underline"
            >
              {t('buttons.signIn')}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
}
