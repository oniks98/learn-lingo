// src/components/modal/sign-up-form-modal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await signUp.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
      });
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
      onCloseAction();
    } catch (err) {
      console.error('Google auth error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
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
          <input
            type="password"
            placeholder={t('placeholders.password')}
            {...register('password')}
            className="border-gray-muted w-full rounded-xl border p-4"
            disabled={isAnyLoading}
          />
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
