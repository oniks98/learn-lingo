'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import clsx from 'clsx';
import ExitIcon from '@/lib/icons/exit';

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

        <div
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
          )}
        >
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
                '@container relative max-h-[90vh] w-full max-w-[599px]',
                'flex flex-col rounded-[30px] bg-white shadow-xl',
                className,
              )}
            >
              {/* Шапка модалки */}
              <div className="relative flex-shrink-0 p-[10.68cqw] pb-0">
                <button
                  onClick={onCloseAction}
                  className={clsx(
                    'hover:text-yellow absolute top-5 right-5 transition',
                  )}
                >
                  <ExitIcon className="h-8 w-8" />
                </button>

                {title && (
                  <DialogTitle
                    className={clsx(
                      'mb-5 text-[26px] leading-[1.2] font-medium tracking-[-0.02em] md:text-[40px]',
                    )}
                  >
                    {title}
                  </DialogTitle>
                )}
              </div>

              {/* Контент со скроллом */}
              <div className="flex-1 overflow-y-auto p-[10.68cqw] pt-0">
                {children}
              </div>
            </DialogPanel>
          </Transition>
        </div>
      </Dialog>
    </Transition>
  );
}
