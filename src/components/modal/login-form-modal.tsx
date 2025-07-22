'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { LoginFormValues, loginSchema } from '@/lib/validation/login';
import { useAuth } from '@/contexts/auth-context';
import GoogleIcon from '@/lib/icons/google-icon.svg';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function LoginFormModal({ isOpen, onCloseAction }: Props) {
  const { signIn, signInWithGoogle } = useAuth();
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSending(true);
    try {
      const userData = await signIn(data.email, data.password);

      if (!userData.emailVerified) {
        toast.warning(
          'Вхід виконано, але потрібно підтвердити email. Перевірте свою пошту.',
        );
      } else {
        toast.success('Вхід виконано успішно!');
      }

      reset();
      onCloseAction();
    } catch (err: any) {
      toast.error(err?.message || 'Не вдалося виконати вхід.');
    } finally {
      setSending(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      // После успешного входа через Google можем показать сообщение
      // но лучше это делать в AuthContext после получения данных пользователя
    } catch (error) {
      toast.error('Не вдалося увійти через Google.');
    }
  };

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
          disabled={sending}
          className="w-full disabled:opacity-50"
        >
          {sending ? 'Logging in…' : 'Log In'}
        </Button>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <Button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2"
        >
          <GoogleIcon className="h-5 w-5" />
          Sign In with Google
        </Button>
      </form>
    </Modal>
  );
}
