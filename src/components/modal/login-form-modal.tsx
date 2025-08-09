'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import clsx from 'clsx';

import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import EmailVerificationModal from '@/components/modal/email-verification-modal';
import PasswordResetModal from '@/components/modal/password-reset-modal';
import { LoginFormValues, loginSchema } from '@/lib/validation/login';
import { useSignIn, useSignInWithGoogle } from '@/hooks/use-auth-actions';
import GoogleIcon from '@/lib/icons/google-icon.svg';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function LoginFormModal({ isOpen, onCloseAction }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const signIn = useSignIn();
  const signInWithGoogle = useSignInWithGoogle();
  const t = useTranslations('loginForm');

  // Стани для управління UI
  const [showEmailVerificationUI, setShowEmailVerificationUI] = useState(false);
  const [showForgotPasswordUI, setShowForgotPasswordUI] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [contextMessage, setContextMessage] = useState<string | null>(null);

  // Форма логіну
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const watchedEmail = watch('email');

  /**
   * Обробка контекстних повідомлень на основі URL параметрів
   */
  useEffect(() => {
    if (isOpen && message) {
      let modalMessage = '';

      switch (message) {
        case 'session_expired':
          modalMessage = t('messages.sessionExpired');
          break;
        case 'email_change_reauth':
          modalMessage = t('messages.emailChangeReauth');
          break;
        case 'security_reauth':
          modalMessage = t('messages.securityReauth');
          break;
        case 'reauth_required':
          modalMessage = t('messages.reauthRequired');
          break;
      }

      setContextMessage(modalMessage);

      // Очищаємо параметр message щоб уникнути повторного показу toast при оновленні
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [isOpen, message, router]);

  /**
   * Завантаження збережених даних при відкритті модалки
   */
  useEffect(() => {
    if (isOpen) {
      try {
        const savedEmail = localStorage.getItem('loginForm_email');
        if (savedEmail) {
          setValue('email', savedEmail);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Не вдалося завантажити збережені дані форми:', error);
        }
      }
    }
  }, [isOpen, setValue]);

  /**
   * Збереження email при його зміні
   */
  useEffect(() => {
    if (watchedEmail) {
      try {
        localStorage.setItem('loginForm_email', watchedEmail);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Не вдалося зберегти дані форми:', error);
        }
      }
    }
  }, [watchedEmail]);

  /**
   * Обробник відправки форми логіну
   */
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

      // При успішному логіні очищаємо збережені дані та закриваємо модалку
      clearSavedFormData();
      setContextMessage(null);
      reset();
      onCloseAction();

      // Показуємо повідомлення про успіх для повторної аутентифікації
      if (message) {
        toast.success('Authentication successful!');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Помилка логіну в компоненті:', err);
      }
    }
  };

  /**
   * Обробник входу через Google
   */
  const handleGoogle = async () => {
    try {
      await signInWithGoogle.mutateAsync({ redirectPath: '/' });

      // Очищаємо збережені дані при успішному вході через Google
      clearSavedFormData();
      setContextMessage(null);
      onCloseAction();

      // Показуємо повідомлення про успіх для повторної аутентифікації
      if (message) {
        toast.success('Authentication successful!');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Помилка Google аутентифікації в компоненті:', err);
      }
    }
  };

  /**
   * Очищення збережених даних форми
   */
  const clearSavedFormData = () => {
    try {
      localStorage.removeItem('loginForm_email');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Не вдалося очистити збережені дані форми:', error);
      }
    }
  };

  /**
   * Повернення до основної форми логіну
   */
  const handleBackToLogin = () => {
    setShowEmailVerificationUI(false);
    setShowForgotPasswordUI(false);
    setUserEmail('');
  };

  /**
   * Показ форми відновлення пароля
   */
  const handleForgotPassword = () => {
    setShowForgotPasswordUI(true);
  };

  /**
   * Перемикання видимості пароля
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Стани завантаження
  const isSignInLoading = signIn.isPending;
  const isGoogleLoading = signInWithGoogle.isPending;
  const isAnyLoading = isSignInLoading || isGoogleLoading;

  // Показуємо модалку відновлення пароля
  if (showForgotPasswordUI) {
    return (
      <PasswordResetModal
        isOpen={isOpen}
        onCloseAction={onCloseAction}
        onBackToLoginAction={handleBackToLogin}
      />
    );
  }

  // Показуємо модалку верифікації email
  if (showEmailVerificationUI) {
    return (
      <EmailVerificationModal
        isOpen={isOpen}
        onCloseAction={onCloseAction}
        onBackToLoginAction={handleBackToLogin}
        userEmail={userEmail}
      />
    );
  }

  // Основний UI логіну
  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction} title={t('title')}>
      {/* Показуємо контекстне повідомлення якщо є */}
      {contextMessage && (
        <div
          className={clsx(
            'mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3',
          )}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{contextMessage}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-shadow-gray-muted mb-5 leading-snug">
        {t('description')}
      </p>

      {/* Форма логіну */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        {/* Поле email */}
        <div>
          <input
            type="email"
            placeholder={t('placeholders.email')}
            {...register('email')}
            className={clsx('border-gray-muted w-full rounded-xl border p-4')}
            disabled={isAnyLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Поле пароля */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('placeholders.password')}
              {...register('password')}
              className={clsx(
                'border-gray-muted w-full rounded-xl border p-4 pr-12',
              )}
              disabled={isAnyLoading}
            />
            {/* Кнопка показу/приховування пароля */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={clsx(
                'absolute top-1/2 right-4 -translate-y-1/2',
                'text-gray-500 hover:text-gray-700',
              )}
              disabled={isAnyLoading}
            >
              {showPassword ? (
                // Іконка приховування пароля
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
              ) : (
                // Іконка показу пароля
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
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          {/* Посилання "Забули пароль?" */}
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className={clsx(
                'hover:text-yellow text-sm text-black hover:underline',
              )}
              disabled={isAnyLoading}
            >
              {t('forgotPassword')}
            </button>
          </div>
        </div>

        {/* Кнопка входу */}
        <Button
          type="submit"
          disabled={isAnyLoading}
          className="w-full disabled:opacity-50"
        >
          {isSignInLoading ? t('buttons.loggingIn') : t('buttons.logIn')}
        </Button>

        {/* Роздільник */}
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">{t('or')}</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Кнопка входу через Google */}
        <Button
          type="button"
          onClick={handleGoogle}
          disabled={isAnyLoading}
          className={clsx(
            'flex w-full items-center justify-center gap-2',
            'disabled:opacity-50',
          )}
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
