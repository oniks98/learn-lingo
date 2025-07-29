// src/components/modal/sign-up-form-modal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { SignUpFormValues, signUpSchema } from '@/lib/validation/signup';
import GoogleIcon from '@/lib/icons/google-icon.svg';
import { useSignUp, useSignInWithGoogle } from '@/hooks/use-auth-actions';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function SignUpFormModal({ isOpen, onCloseAction }: Props) {
  const signUp = useSignUp();
  const signInWithGoogle = useSignInWithGoogle();
  const t = useTranslations('signUpForm');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema) });

  // Наблюдаем за изменениями в полях формы
  const watchedName = watch('name');
  const watchedEmail = watch('email');

  // Загружаем сохраненные данные при открытии модалки
  useEffect(() => {
    if (isOpen) {
      try {
        const savedName = localStorage.getItem('signUpForm_name');
        const savedEmail = localStorage.getItem('signUpForm_email');

        if (savedName) {
          setValue('name', savedName);
        }
        if (savedEmail) {
          setValue('email', savedEmail);
        }
      } catch (error) {
        console.warn('Could not load saved form data:', error);
      }
    }
  }, [isOpen, setValue]);

  // Сохраняем имя при его изменении
  useEffect(() => {
    if (watchedName) {
      try {
        localStorage.setItem('signUpForm_name', watchedName);
      } catch (error) {
        console.warn('Could not save form data:', error);
      }
    }
  }, [watchedName]);

  // Сохраняем email при его изменении
  useEffect(() => {
    if (watchedEmail) {
      try {
        localStorage.setItem('signUpForm_email', watchedEmail);
      } catch (error) {
        console.warn('Could not save form data:', error);
      }
    }
  }, [watchedEmail]);

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await signUp.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      // Очищаем сохраненные данные при успешной регистрации
      try {
        localStorage.removeItem('signUpForm_name');
        localStorage.removeItem('signUpForm_email');
      } catch (error) {
        console.warn('Could not clear saved form data:', error);
      }

      reset();
      onCloseAction();
    } catch (err) {
      console.error('Registration error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle.mutateAsync({ redirectPath: '/' });

      // Очищаем сохраненные данные при успешном входе через Google
      try {
        localStorage.removeItem('signUpForm_name');
        localStorage.removeItem('signUpForm_email');
      } catch (error) {
        console.warn('Could not clear saved form data:', error);
      }

      onCloseAction();
    } catch (err) {
      console.error('Google auth error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isSignUpLoading = signUp.isPending;
  const isGoogleLoading = signInWithGoogle.isPending;
  const isAnyLoading = isSignUpLoading || isGoogleLoading;

  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction} title={t('title')}>
      <p className="text-shadow-gray-muted mb-5 leading-snug">
        {t('description')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        <div>
          <input
            type="text"
            placeholder={t('placeholders.fullName')}
            {...register('name')}
            className="border-gray-muted w-full rounded-xl border p-4"
            disabled={isAnyLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
        </div>

        <Button
          type="submit"
          disabled={isAnyLoading}
          className="w-full disabled:opacity-50"
        >
          {isSignUpLoading ? t('buttons.creatingAccount') : t('buttons.signUp')}
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
            ? t('buttons.signingUpWithGoogle')
            : t('buttons.signUpWithGoogle')}
        </Button>
      </form>
    </Modal>
  );
}
