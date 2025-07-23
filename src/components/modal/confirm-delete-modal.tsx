'use client';

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
}: Props) {
  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction}>
      <div className="text-center">
        <h2 className="mb-5 text-2xl font-bold">Confirm Deletion</h2>
        <p className="mb-5 text-lg">
          Are you sure you want to delete this reservation?
        </p>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            className="bg-gray-200 text-black hover:bg-gray-300"
            onClick={onCloseAction}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-yellow hover:yellow-light text-black"
            onClick={onConfirmAction}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting…' : 'Yes, Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
