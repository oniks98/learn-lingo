'use client';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      className={twMerge(
        clsx(
          'text-dark bg-yellow hover:bg-yellow-light rounded-xl px-12 py-4 leading-[1.56] font-bold transition-colors',
          className,
        ),
      )}
    >
      {children}
    </button>
  );
}
