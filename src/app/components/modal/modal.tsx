'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Modal({
  isOpen,
  onCloseAction,
  children,
  className,
  title,
}: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCloseAction}>
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Transition
            show={isOpen}
            enter="transition duration-300 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-200 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            as={Fragment}
          >
            <DialogPanel
              className={clsx(
                'relative w-full max-w-[460px] rounded-3xl bg-white p-8 shadow-xl',
                className,
              )}
            >
              <button
                onClick={onCloseAction}
                className="text-gray-muted absolute top-6 right-6 hover:text-black"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              {title && (
                <DialogTitle className="mb-4 text-[28px] font-bold">
                  {title}
                </DialogTitle>
              )}

              {children}
            </DialogPanel>
          </Transition>
        </div>
      </Dialog>
    </Transition>
  );
}
