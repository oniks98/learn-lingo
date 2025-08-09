import * as React from 'react';
import clsx from 'clsx';

import { cn } from '@/lib/utils/utils-tw-merge';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        clsx(
          // Базові стилі
          'selection:bg-primary dark:bg-input/30 border-input',
          'flex w-full min-w-0 rounded-xl border bg-transparent',
          'px-3 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none',
          // File input стилі
          'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium',
          // Disabled стилі
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          // Focus стилі
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          // Invalid стилі
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          'aria-invalid:border-destructive',
        ),
        className,
      )}
      {...props}
    />
  );
}

export { Input };
