// src/components/modal/profile-delete-modal.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';

type Props = {
  isOpen: boolean;
  onCloseAction: () => void;
  onConfirmAction: () => void;
  isLoading: boolean;
  userEmail: string;
};

export default function ProfileDeleteModal({
  isOpen,
  onCloseAction,
  onConfirmAction,
  isLoading,
  userEmail,
}: Props) {
  const t = useTranslations('profile');
  const [confirmEmail, setConfirmEmail] = useState('');

  const handleClose = () => {
    setConfirmEmail('');
    onCloseAction();
  };

  const handleConfirm = () => {
    if (confirmEmail === userEmail) {
      onConfirmAction();
    }
  };

  const isDeleteFormValid = confirmEmail === userEmail;

  return (
    <Modal isOpen={isOpen} onCloseAction={handleClose}>
      <div className="text-center">
        <h2 className="mb-5 text-2xl font-bold text-red-600">
          {t('deleteAccountModal.title')}
        </h2>
        <p className="mb-5 text-lg text-gray-600">
          {t('deleteAccountModal.description')}
        </p>

        <div className="mb-6">
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={t('deleteAccountModal.placeholder')}
            className="focus:border-yellow w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none"
          />
          {confirmEmail && !isDeleteFormValid && (
            <p className="mt-2 text-sm text-red-500">
              {t('deleteAccountModal.validation.emailMismatch')}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            className="bg-gray-200 text-black hover:bg-gray-300"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('deleteAccountModal.buttons.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={handleConfirm}
            disabled={isLoading || !isDeleteFormValid}
          >
            {isLoading
              ? t('deleteAccountModal.buttons.deleting')
              : t('deleteAccountModal.buttons.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
