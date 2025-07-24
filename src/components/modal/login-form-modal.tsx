// src/components/modal/login-form-modal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { LoginFormValues, loginSchema } from '@/lib/validation/login';
import { useSignIn, useSignInWithGoogle } from '@/hooks/use-auth-actions';
import GoogleIcon from '@/lib/icons/google-icon.svg';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function LoginFormModal({ isOpen, onCloseAction }: Props) {
  const signIn = useSignIn();
  const signInWithGoogle = useSignInWithGoogle();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const user = await signIn.mutateAsync({
        email: data.email,
        password: data.password,
      });
      // Додаткова перевірка email верифікації
      if (!user.emailVerified) {
        // залишаємо мутацію покривати це повідомлення, якщо потрібно
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
      onCloseAction();
    } catch (err) {
      console.error('Google auth error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
  };

  const isSignInLoading = signIn.isPending;
  const isGoogleLoading = signInWithGoogle.isPending;
  const isAnyLoading = isSignInLoading || isGoogleLoading;

  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction} title="Log In">
      <p className="text-shadow-gray-muted mb-5 leading-snug">
        Welcome back! Please enter your credentials to access your account and
        continue your search for a teacher.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        <div>
          <input
            type="email"
            placeholder="Email"
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
            placeholder="Password"
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
          {isSignInLoading ? 'Logging in…' : 'Log In'}
        </Button>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={isAnyLoading}
          className="flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          <GoogleIcon className="h-5 w-5" />
          {isGoogleLoading ? 'Signing in with Google…' : 'Sign In with Google'}
        </Button>
      </form>
    </Modal>
  );
}
