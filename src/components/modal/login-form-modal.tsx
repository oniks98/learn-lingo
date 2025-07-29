// src/components/modal/login-form-modal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { LoginFormValues, loginSchema } from '@/lib/validation/login';
import { useSignIn, useSignInWithGoogle } from '@/hooks/use-auth-actions';
import { useSendVerificationEmail } from '@/hooks/use-send-verification-email';
import { useSendPasswordReset } from '@/hooks/use-password-reset';
import GoogleIcon from '@/lib/icons/google-icon.svg';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function LoginFormModal({ isOpen, onCloseAction }: Props) {
  const signIn = useSignIn();
  const signInWithGoogle = useSignInWithGoogle();
  const sendVerification = useSendVerificationEmail();
  const sendPasswordReset = useSendPasswordReset();
  const t = useTranslations('loginForm');

  const [showEmailVerificationUI, setShowEmailVerificationUI] = useState(false);
  const [showForgotPasswordUI, setShowForgotPasswordUI] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Наблюдаем за изменениями в полях формы
  const watchedEmail = watch('email');

  // Загружаем сохраненные данные при открытии модалки
  useEffect(() => {
    if (isOpen) {
      try {
        const savedEmail = localStorage.getItem('loginForm_email');
        if (savedEmail) {
          setValue('email', savedEmail);
        }
      } catch (error) {
        console.warn('Could not load saved form data:', error);
      }
    }
  }, [isOpen, setValue]);

  // Сохраняем email при его изменении
  useEffect(() => {
    if (watchedEmail) {
      try {
        localStorage.setItem('loginForm_email', watchedEmail);
      } catch (error) {
        console.warn('Could not save form data:', error);
      }
    }
  }, [watchedEmail]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signIn.mutateAsync({
        email: data.email,
        password: data.password,
      });

      // Перевіряємо, чи потрібна верифікація email
      if (result.needsEmailVerification) {
        setUserEmail(data.email);
        setShowEmailVerificationUI(true);
        return; // НЕ закриваємо модалку
      }

      // Якщо все ок, очищаем сохраненные данные и закриваємо модалку
      try {
        localStorage.removeItem('loginForm_email');
      } catch (error) {
        console.warn('Could not clear saved form data:', error);
      }
      reset();
      onCloseAction();
    } catch (err) {
      console.error('Login error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle.mutateAsync({ redirectPath: '/' });
      // Очищаем сохраненные данные при успешном входе через Google
      try {
        localStorage.removeItem('loginForm_email');
      } catch (error) {
        console.warn('Could not clear saved form data:', error);
      }
      onCloseAction();
    } catch (err) {
      console.error('Google auth error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerification.mutateAsync();
    } catch (err) {
      console.error('Resend verification error:', err);
    }
  };

  const handleBackToLogin = () => {
    setShowEmailVerificationUI(false);
    setShowForgotPasswordUI(false);
    setUserEmail('');
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordUI(true);
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordReset.mutateAsync({ email });
    } catch (err) {
      console.error('Send password reset error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isSignInLoading = signIn.isPending;
  const isGoogleLoading = signInWithGoogle.isPending;
  const isResendLoading = sendVerification.isPending;
  const isPasswordResetLoading = sendPasswordReset.isPending;
  const isAnyLoading =
    isSignInLoading ||
    isGoogleLoading ||
    isResendLoading ||
    isPasswordResetLoading;

  // UI для відновлення паролю
  if (showForgotPasswordUI) {
    return (
      <Modal
        isOpen={isOpen}
        onCloseAction={onCloseAction}
        title={t('passwordReset.title')}
      >
        <div className="space-y-4">
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

          <div className="text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {t('passwordReset.heading')}
            </h3>
            <p className="text-shadow-gray-muted mb-4 leading-snug">
              {t('passwordReset.description')}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              handleSendPasswordReset(email);
            }}
            className="space-y-4"
          >
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
                onClick={handleBackToLogin}
                disabled={isAnyLoading}
                className="w-full bg-gray-500 hover:bg-gray-600"
              >
                {t('buttons.backToLogin')}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>
              {t('passwordReset.rememberPassword')}{' '}
              <button
                type="button"
                onClick={handleBackToLogin}
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

  // UI для повторної відправки верифікації
  if (showEmailVerificationUI) {
    return (
      <Modal
        isOpen={isOpen}
        onCloseAction={onCloseAction}
        title={t('emailVerification.title')}
      >
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
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

          <div className="text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {t('emailVerification.heading')}
            </h3>
            <p className="text-shadow-gray-muted mb-4 leading-snug">
              {t('emailVerification.description', { email: userEmail })}
            </p>
          </div>

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
              onClick={handleBackToLogin}
              disabled={isAnyLoading}
              className="w-full bg-gray-500 hover:bg-gray-600"
            >
              {t('buttons.backToLogin')}
            </Button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>{t('emailVerification.helpText')}</p>
          </div>
        </div>
      </Modal>
    );
  }

  // Звичайний UI логіна
  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction} title={t('title')}>
      <p className="text-shadow-gray-muted mb-5 leading-snug">
        {t('description')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        <div>
          <input
            type="email"
            placeholder={t('placeholders.email')}
            {...register('email')}
            className="border-gray-muted w-full rounded-xl border p-4"
            disabled={isAnyLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('placeholders.password')}
              {...register('password')}
              className="border-gray-muted w-full rounded-xl border p-4 pr-12"
              disabled={isAnyLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isAnyLoading}
            >
              {showPassword ? (
                // Закрытый глаз (скрыть пароль)
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
              ) : (
                // Открытый глаз (показать пароль)
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
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="hover:text-yellow text-sm text-black hover:underline"
              disabled={isAnyLoading}
            >
              {t('forgotPassword')}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isAnyLoading}
          className="w-full disabled:opacity-50"
        >
          {isSignInLoading ? t('buttons.loggingIn') : t('buttons.logIn')}
        </Button>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">{t('or')}</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={isAnyLoading}
          className="flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          <GoogleIcon className="h-5 w-5" />
          {isGoogleLoading
            ? t('buttons.signingInWithGoogle')
            : t('buttons.signInWithGoogle')}
        </Button>
      </form>
    </Modal>
  );
}
