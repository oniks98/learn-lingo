// src/components/modal/email-change-modal.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';

type Props = {
  isOpen: boolean;
  onCloseAction: () => void;
  onConfirmAction: (newEmail: string) => void;
  isLoading: boolean;
};

export default function EmailChangeModal({
  isOpen,
  onCloseAction,
  onConfirmAction,
  isLoading,
}: Props) {
  const t = useTranslations('profile');
  const [newEmail, setNewEmail] = useState('');

  const handleClose = () => {
    setNewEmail('');
    onCloseAction();
  };

  const handleConfirm = () => {
    if (newEmail.trim()) {
      onConfirmAction(newEmail.trim());
      setNewEmail('');
    }
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

        <div className="mb-6">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={t('changeEmailModal.placeholder')}
            className="focus:border-yellow w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none"
          />
        </div>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            className="bg-gray-200 text-black hover:bg-gray-300"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('changeEmailModal.buttons.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-yellow hover:bg-yellow/80 text-black"
            onClick={handleConfirm}
            disabled={isLoading || !newEmail.trim()}
          >
            {isLoading
              ? t('changeEmailModal.buttons.sending')
              : t('changeEmailModal.buttons.sendVerification')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
