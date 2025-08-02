// src/components/modal/email-change-modal.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { useSendEmailChange } from '@/hooks/use-send-email-change';
import {
  EmailChangeFormValues,
  emailChangeSchema,
} from '@/lib/validation/email-change';

type Props = {
  isOpen: boolean;
  onCloseAction: () => void;
};

export default function EmailChangeModal({ isOpen, onCloseAction }: Props) {
  const t = useTranslations('profile');
  const sendEmailChangeMutation = useSendEmailChange();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<EmailChangeFormValues>({
    resolver: zodResolver(emailChangeSchema),
    mode: 'onChange', // Валидация при каждом изменении
  });

  const handleClose = () => {
    reset(); // Очищаем форму
    onCloseAction();
  };

  const onSubmit = (data: EmailChangeFormValues) => {
    sendEmailChangeMutation.mutate(
      { newEmail: data.email },
      {
        onSuccess: () => {
          handleClose(); // Закрываем модал после успешной отправки
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onCloseAction={handleClose}>
      <div className="text-center">
        <h2 className="mb-5 text-2xl font-bold">
          {t('changeEmailModal.title')}
        </h2>
        <p className="mb-5 text-lg text-gray-600">
          {t('changeEmailModal.description')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <input
              type="email"
              {...register('email')}
              placeholder={t('changeEmailModal.placeholder')}
              className="focus:border-yellow w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none"
              disabled={sendEmailChangeMutation.isPending}
            />
            {errors.email && (
              <p className="mt-2 text-left text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              type="button"
              className="bg-gray-200 text-black hover:bg-gray-300"
              onClick={handleClose}
              disabled={sendEmailChangeMutation.isPending}
            >
              {t('changeEmailModal.buttons.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-yellow hover:bg-yellow/80 text-black"
              disabled={sendEmailChangeMutation.isPending || !isValid}
            >
              {sendEmailChangeMutation.isPending
                ? t('changeEmailModal.buttons.sending')
                : t('changeEmailModal.buttons.sendVerification')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
