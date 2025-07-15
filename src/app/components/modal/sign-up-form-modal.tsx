'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import Modal from '@/app/components/modal/modal';
import Button from '@/app/components/ui/button';
import { SignUpFormValues, signUpSchema } from '@/lib/validation/signup';
import GoogleIcon from '@/lib/icons/google-icon.svg';
import { useAuth } from '@/contexts/auth-context';
import { useLocationTracker } from '@/contexts/location-context';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function SignUpFormModal({ isOpen, onCloseAction }: Props) {
  const { signUp, signInWithGoogle } = useAuth();
  const { prevPath } = useLocationTracker();

  const [sending, setSending] = useState(false);

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
      const user = await signUp(data.email, data.password, data.name);

      const res = await fetch('/api/sendConfirmationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          redirectPath: prevPath,
        }),
      });

      const result = await res.json();
      if (!result.ok) {
        toast.error(result.error || 'Помилка відправлення листа');
        return;
      }

      toast.success(
        'На вашу пошту надіслано посилання для підтвердження. Перевірте, будь ласка, спам.',
      );

      reset();
      onCloseAction();
    } catch (err: any) {
      toast.error(err.message || 'Не вдалося зареєструватися.');
    } finally {
      setSending(false);
    }
  };

  const handleGoogle = () => {
    signInWithGoogle(prevPath);
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
          disabled={sending}
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
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2"
        >
          <GoogleIcon className="h-5 w-5" />
          Sign in with Google
        </Button>
      </form>
    </Modal>
  );
}
