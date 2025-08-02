// src/app/layout.tsx
import React from 'react';
import { Roboto } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

const font = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.className}>
      <body>
        {children} {/* Удаляем Providers отсюда */}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            duration: 4000,
            classNames: { title: 'text-lg font-bold text-center' },
          }}
        />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
