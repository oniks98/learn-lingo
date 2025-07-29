// src/components/modal/confirm-delete-modal.tsx
'use client';

import { useTranslations } from 'next-intl';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';

type Props = {
  isOpen: boolean;
  onCloseAction: () => void;
  onConfirmAction: () => void;
  isLoading?: boolean;
  title?: string;
  message?: string;
};

export default function ConfirmDeleteModal({
  isOpen,
  onCloseAction,
  onConfirmAction,
  isLoading = false,
  title,
  message,
}: Props) {
  const t = useTranslations('confirmDeleteModal');

  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction}>
      <div className="text-center">
        <h2 className="mb-5 text-2xl font-bold">{title || t('title')}</h2>
        <p className="mb-5 text-lg">{message || t('message')}</p>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            className="bg-gray-200 text-black hover:bg-gray-300"
            onClick={onCloseAction}
            disabled={isLoading}
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            type="button"
            className="bg-yellow hover:yellow-light text-black"
            onClick={onConfirmAction}
            disabled={isLoading}
          >
            {isLoading ? t('buttons.deleting') : t('buttons.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
