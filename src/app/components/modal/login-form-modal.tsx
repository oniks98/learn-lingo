'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import Modal from '@/app/components/modal/modal';
import Button from '@/app/components/ui/button';
import { LoginFormValues, loginSchema } from '@/lib/validation/login';
import { useAuth } from '@/contexts/auth-context';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function LoginFormModal({ isOpen, onCloseAction }: Props) {
  const { signIn } = useAuth();
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
      await signIn(data.email, data.password);
      toast.success('Вхід виконано успішно!');
      reset();
      onCloseAction();
    } catch (err: any) {
      toast.error(err?.message || 'Не вдалося виконати вхід.');
    } finally {
      setSending(false);
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
      </form>
    </Modal>
  );
}
