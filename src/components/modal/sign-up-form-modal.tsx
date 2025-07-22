// src/app/components/modal/sign-up-form-modal.tsx

'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { SignUpFormValues, signUpSchema } from '@/lib/validation/signup';
import GoogleIcon from '@/lib/icons/google-icon.svg';
import { useAuth } from '@/contexts/auth-context';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function SignUpFormModal({ isOpen, onCloseAction }: Props) {
  const { signUp, signInWithGoogle } = useAuth();
  const [sending, setSending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setSending(true);
    try {
      // Регистрируем пользователя через Firebase Auth
      // sendEmailVerification уже вызывается внутри signUp
      await signUp(data.email, data.password, data.name);

      // Показываем сообщение об успешной регистрации
      toast.success(
        'Реєстрація успішна! На вашу пошту надіслано посилання для підтвердження. Перевірте, будь ласка, спам.',
      );

      reset();
      onCloseAction();
    } catch (err: any) {
      console.error('Registration error:', err);

      // Обрабатываем различные типы ошибок Firebase
      let errorMessage = 'Не вдалося зареєструватися.';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Користувач з такою електронною поштою вже існує.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Пароль занадто слабкий. Мінімум 6 символів.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Невірний формат електронної пошти.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Успішний вхід через Google!');
      onCloseAction();
    } catch (err: any) {
      console.error('Google auth error:', err);
      toast.error(err.message || 'Не вдалося увійти через Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction} title="Sign Up">
      <p className="text-shadow-gray-muted mb-5 leading-snug">
        Create your account to find the best teachers and start your learning
        journey today.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        <div>
          <input
            type="text"
            placeholder="Full Name"
            {...register('name')}
            className="border-gray-muted w-full rounded-xl border p-4"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="border-gray-muted w-full rounded-xl border p-4"
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
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={sending || googleLoading}
          className="w-full disabled:opacity-50"
        >
          {sending ? 'Creating account…' : 'Sign Up'}
        </Button>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={sending || googleLoading}
          className="flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          <GoogleIcon className="h-5 w-5" />
          {googleLoading ? 'Signing up with Google…' : 'Sign Up with Google'}
        </Button>
      </form>
    </Modal>
  );
}
