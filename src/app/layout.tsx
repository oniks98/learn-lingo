// src/app/layout.tsx
import React from 'react';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

import { fontClassName } from '@/config/fonts';
import { viewport } from '@/config/viewport';
import { metadata } from '@/config/metadata';

export { viewport, metadata };

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${fontClassName} h-full`}>
      <body className="h-full">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            duration: 3000,
            classNames: { title: 'text-lg font-bold text-center' },
          }}
        />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
